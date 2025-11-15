import {
  elementValue,
  escapeCssMeta,
  findByName,
  idOrName,
  isBlankElement,
  isCheckableElement,
  isVisible,
  objectLength,
} from './helpers.js';
import { getRules } from './rules.js';
import { getMessage } from './messages.js';
import { validatorStore } from './validatorStore.js';
import { store as methodStore } from './methods.js';

export class Validator {
  currentForm = null;
  submitted = {};
  invalid = {};
  successList = [];
  errorList = [];
  errorMap = {};
  toShow = [];
  toHide = [];
  currentElements = [];
  labelContainer = null;
  errorContext = null;
  containers = [];

  settings = {
    ignore: ":hidden",
    errorClass: "error",
    validClass: "valid",
    wrapper: null,
    errorLabelContainer: null,
    errorContainer: null,
    onfocusin: this.onFocusIn,
    onfocusout: this.onFocusOut,
    onkeyup: this.onKeyUp,
    onclick: this.onClick,
    highlight: this.highlight,
    unhighlight: this.unhighlight,
    errorPlacement: null,
    focusCleanup: false,
    rules: {},
    messages: {}
  };

  constructor(form, options) {
    this.currentForm = form;
    this.settings = { ...this.settings, ...options};

    this.normalizeSettings();
    
    this.init();
  }

  normalizeSettings() {
    // bind function settings to this validator instance
    if (this.settings.onfocusin) {
      this.settings.onfocusin = this.settings.onfocusin.bind(this);
    }
    if (this.settings.onfocusout) {
      this.settings.onfocusout = this.settings.onfocusout.bind(this);
    }
    if (this.settings.onkeyup) {
      this.settings.onkeyup = this.settings.onkeyup.bind(this);
    }
    if (this.settings.onclick) {
      this.settings.onclick = this.settings.onclick.bind(this);
    }
    if (this.settings.highlight) {
      this.settings.highlight = this.settings.highlight.bind(this);
    }
    if (this.settings.unhighlight) {
      this.settings.unhighlight = this.settings.unhighlight.bind(this);
    }
    if (this.settings.errorPlacement) {
      this.settings.errorPlacement = this.settings.errorPlacement.bind(this);
    }
  }

  init() {
    this.labelContainer = document.querySelector(this.settings.errorLabelContainer);
    this.errorContext = this.labelContainer || this.currentForm;
    this.containers = [document.querySelector(this.settings.errorContainer), this.labelContainer]
      .filter(el => el !== null);

    this.attachEventHandlers();
  }

  attachEventHandlers() {
    const focusTargets = [
      "[type='text']", "[type='password']", "[type='file']", "select", "textarea", "[type='number']",
      "[type='search']", "[type='tel']", "[type='url']", "[type='email']", "[type='datetime']",
      "[type='date']", "[type='month']", "[type='week']", "[type='time']", "[type='datetime-local']",
      "[type='range']", "[type='color']", "[type='radio']", "[type='checkbox']", "button", "input[type='button']"
    ];

    const clickTargets = ["select", "option", "[type='radio']", "[type='checkbox']"];

    const delegate = (event, targets, handler) => {
      const element = event.target;

      // Ignore the element if it doesn't match one of the targets
      if (!element.matches(targets.join(", "))) {
        return;
      }

      // Ignore the element if it belongs to another form. This will happen mainly
      // when setting the `form` attribute of an input to the id of another form
      if (this.currentForm !== element.form) {
        return;
      }

      if (this.shouldIgnore(element)) {
        return;
      }

      return handler(element, event);
    };

    this.currentForm.addEventListener("focusin", (e) => delegate(e, focusTargets, this.settings.onfocusin));
    this.currentForm.addEventListener("focusout", (e) => delegate(e, focusTargets, this.settings.onfocusout));
    this.currentForm.addEventListener("keyup", (e) => delegate(e, focusTargets, this.settings.onkeyup));
    this.currentForm.addEventListener("click", (e) => delegate(e, clickTargets, this.settings.onclick));
  }

  reset() {
    this.successList = [];
    this.errorList = [];
    this.errorMap = {};
    this.toShow = [];
    this.toHide = [];
    this.currentElements = [];
  }

  form() {
    this.prepareForm();
    this.currentElements = this.elements();
    for (const element of this.currentElements) {
      this.check(element);
    }

    this.submitted = { ...this.submitted, ...this.errorMap };
    this.invalid = { ...this.errorMap };
    this.showErrors();
    return this.valid();
  }

  element(element) {
    const target = this.validationTargetFor(element);
    if (target === undefined) {
      delete this.invalid[element.name];
      return true;
    }

    this.prepareElement(target);
    this.currentElements = [target];

    const result = this.check(target) !== false;
    this.invalid[target.name] = !result;

    if (!this.numberOfInvalids()) {
      this.toHide.push(...this.containers);
    }
    this.showErrors();

    return result;
  }

  prepareElement(element) {
    this.reset();
    this.toHide = this.errorsFor(element);
  }

  valid() {
    return this.size() === 0;
  }

  size() {
    return this.errorList.length;
  }

  elements() {
    const rulesCache = {};

    const selector = "input, select, textarea";
    const notSelector = 'input[type="submit"], [type="reset"], [type="image"], [disabled]';

    return [...this.currentForm.querySelectorAll(selector)]
      .filter(el => !el.matches(notSelector) && !this.shouldIgnore(el))
      .filter(el => {
        if (el.form !== this.currentForm) {
          return false;
        }

        const name = el.name || el.getAttribute("name");
        if (name in rulesCache || !objectLength(getRules(el))) {
          return false;
        }

        rulesCache[name] = true;
        return true;
      });
  }

  validElements() {
    const invalid = this.invalidElements();
    return this.currentElements.filter(el => !invalid.includes(el));
  }

  invalidElements() {
    return this.errorList.map(e => e.element);
  }

  check(element) {
    element = this.validationTargetFor(element);

    const rules = getRules(element);
    const value = elementValue(element);
    const isBlank = isBlankElement(element);

    for (const method in rules) {
      const rule = { method, parameters: rules[method] };
      try {
        const result = methodStore.get(method)(isBlank, value, element, rule.parameters);

        if (!result) {
          this.formatAndAdd(element, rule);
          return false;
        }
      }
      catch (e) {
        throw e;
      }
    }

    if (objectLength(rules)) {
      this.successList.push(element);
    }
    return true;
  }

  errors() {
    const errorClass = this.settings.errorClass.split(" ").join(".");
    return [...this.errorContext.querySelectorAll(`label.${errorClass}`)];
  }

  showErrors() {
    for (const error of this.errorList) {
      if (this.settings.highlight) {
        this.settings.highlight(error.element, this.settings.errorClass, this.settings.validClass);
      }
      this.showLabel(error.element, error.message);
    }

    if (this.errorList.length) {
      this.toShow = this.toShow.concat(this.containers);
    }

    if (this.settings.unhighlight) {
      for (const element of this.validElements()) {
        this.settings.unhighlight(element, this.settings.errorClass, this.settings.validClass);
      }
    }

    this.toHide = this.toHide.filter(el => !this.toShow.includes(el));
    this.hideErrors();
    this.addWrapper(this.toShow).forEach(el => {
      // TODO: this should restore to previous state instead of always using display:block
      el.style.display = "block";
    });
  }

  formatAndAdd(element, rule) {
    const message = getMessage(element, rule, this.settings.messages);

    this.errorList.push({ message, element, method: rule.method });
    this.errorMap[element.name] = message;
    this.submitted[element.name] = message;
  }

  prepareForm() {
    this.reset();
    this.toHide = this.errors().concat(this.containers);
  }

  highlight(element, errorClass, validClass) {
    let targets = [element];
    if (element.type === "radio") {
      targets = findByName(element.form, element.name);
    }

    targets.forEach(el => {
      if (errorClass) {
        el.classList.add(errorClass);
      }
      if (validClass) {
        el.classList.remove(validClass);
      }
    });
  }

  unhighlight(element, errorClass, validClass) {
    let targets = [element];
    if (element.type === "radio") {
      targets = findByName(element.form, element.name);
    }

    targets.forEach(el => {
      if (errorClass) {
        el.classList.remove(errorClass);
      }
      if (validClass) {
        el.classList.add(validClass);
      }
    });
  }

  onFocusIn(element) {
    if (this.settings.focusCleanup) {
      if (this.settings.unhighlight) {
        this.settings.unhighlight(element, this.settings.errorClass, this.settings.validClass);
      }
      this.hideErrors(element);
    }
  }

  onFocusOut(element) {

  }

  onKeyUp(element, event) {

  }

  onClick(element) {

  }

  hideErrors(element) {
    // we're either hiding all errors, or just the errors for a specific element
    let targets = this.toHide;
    if (element) {
      targets = this.errorsFor(element);
    }

    for (const el of targets) {
      el.innerText = "";

      if (!this.containers.includes(el)) {
        el.innerText = "";
      }

      // TODO: match jquery and remember old display state
      this.addWrapper(el).forEach(e => e.style.display = "none");
    }
  }

  addWrapper(elements) {
    const result = Array.isArray(elements) ? elements : [elements];

    if (this.settings.wrapper) {
      const wrappers = result.map(el => el.parentElement)
        .filter(el => el.matches(this.settings.wrapper));

      result.push(...wrappers);
    }

    return result;
  }

  showLabel(element, message) {
    let errors = this.errorsFor(element);

    if (errors.length) {
      // Refresh error/success class
      errors.forEach(el => {
        el.classList.remove(this.settings.validClass);
        el.classList.add(this.settings.errorClass);
        el.innerHTML = message || "";
      });
    }
    else {
      const elementID = idOrName(element);

      const newError = document.createElement("label");
      newError.setAttribute("id", `${elementID}-error`);
      newError.classList.add(this.settings.errorClass);
      newError.innerHTML = message || "";

      // Maintain reference to the element(s) to be placed into the DOM
      let insert = newError;
      if (this.settings.wrapper) {
        const wrapper = document.createElement(this.settings.wrapper);
        wrapper.appendChild(newError);
        insert = wrapper;
      }

      if (this.labelContainer) {
        this.labelContainer.appendChild(insert);
      }
      else if (this.settings.errorPlacement) {
        this.settings.errorPlacement(insert, element);
      }
      else {
        element.after(insert);
      }

      newError.setAttribute("for", elementID);

      errors = [newError];
    }

    this.toShow.push(...errors);
  }

  errorsFor(element) {
    const name = escapeCssMeta(idOrName(element));
    const selector = `label[for='${name}'], label[for='${name}'] *`;

    return this.errors().filter(el => el.matches(selector));
  }

  numberOfInvalids() {
    return objectLength(this.invalid);
  }

  destroy() {
    this.resetForm();
    validatorStore.delete(this.currentForm);

    // TODO: cleanup event listeners
  }

  resetForm() {
    this.invalid = {};
    this.submitted = {};
    this.prepareForm();
    this.hideErrors();

    this.resetElements();
  }

  resetElements() {
    if (this.settings.unhighlight) {
      for (const element of this.elements()) {
        this.unhighlight(element, this.settings.errorClass, "");
        findByName(element.form, element.name).forEach(el => el.classList.remove(this.settings.validClass));
      }
    }
    else {
      this.elements().forEach(el => {
        el.classList.remove(this.settings.errorClass);
        el.classList.remove(this.settings.validClass);
      });
    }
  }

  validationTargetFor(element) {
    let targets = [element];
    if (isCheckableElement(element)) {
      targets = findByName(element.form, element.name);
    }

    return targets.filter(t => !this.shouldIgnore(t))[0];
  }

  shouldIgnore(element) {
    if (!this.settings.ignore) {
      return false;
    }
    if (this.settings.ignore === ":hidden") {
      return !isVisible(element);
    }

    return element.matches(this.settings.ignore);
  }
}
