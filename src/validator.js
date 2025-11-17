import {
  elementValue,
  escapeCssMeta,
  findByName,
  hideElement,
  idOrName,
  isBlankElement,
  isCheckableElement,
  isVisible,
  objectLength,
  showElement,
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
    errorElement: "label",
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
    invalidHandler: null,
    success: null,
    focusCleanup: false,
    rules: {},
    messages: {}
  };

  /**
   * stored event handlers for easy cleanup
   */
  boundEventHandlers = {
    onFocusIn: null,
    onFocusOut: null,
    onKeyUp: null,
    onClick: null,
    onInvalidForm: null
  };

  /**
   * Initializes a new validator instance for the given form with optional configuration settings.
   * @param form - form element to validate
   * @param options - optional user configuration settings
   */
  constructor(form, options) {
    this.currentForm = form;
    this.settings = { ...this.settings, ...options};

    this.normalizeSettings();
    
    this.init();
  }

  /**
   * Normalizes Validator settings.
   * Currently, this only binds function settings to validator instance.
   */
  normalizeSettings() {
    // bind function settings to this validator instance\
    ["onfocusin", "onfocusout", "onkeyup", "onclick", "highlight", "unhighlight", "errorPlacement", "invalidHandler"]
      .forEach(key => {
        if (this.settings[key]) {
          this.settings[key] = this.settings[key].bind(this);
        }
      });
  }

  /**
   * Sets up DOM references and attaches event handlers to the form.
   */
  init() {
    this.labelContainer = document.querySelector(this.settings.errorLabelContainer);
    this.errorContext = this.labelContainer || this.currentForm;
    this.containers = [document.querySelector(this.settings.errorContainer), this.labelContainer]
      .filter(el => el !== null);

    this.attachEventHandlers();
  }

  /**
   * Registers delegated event listeners for focus, blur, keyup, and click events on form elements.
   */
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

    this.boundEventHandlers.onFocusIn = (e) => delegate(e, focusTargets, this.settings.onfocusin);
    this.boundEventHandlers.onFocusOut = (e) => delegate(e, focusTargets, this.settings.onfocusout);
    this.boundEventHandlers.onKeyUp = (e) => delegate(e, focusTargets, this.settings.onkeyup);
    this.boundEventHandlers.onClick = (e) => delegate(e, clickTargets, this.settings.onclick);
    this.boundEventHandlers.onInvalidForm = this.settings.invalidHandler;

    this.currentForm.addEventListener("focusin", this.boundEventHandlers.onFocusIn);
    this.currentForm.addEventListener("focusout", this.boundEventHandlers.onFocusOut);
    this.currentForm.addEventListener("keyup", this.boundEventHandlers.onKeyUp);
    this.currentForm.addEventListener("click", this.boundEventHandlers.onClick);

    if (this.settings.invalidHandler) {
      this.currentForm.addEventListener("invalid-form", this.boundEventHandlers.onInvalidForm);
    }
  }

  /**
   * Resets the validator state.
   */
  reset() {
    this.successList = [];
    this.errorList = [];
    this.errorMap = {};
    this.toShow = [];
    this.toHide = [];
    this.currentElements = [];
  }

  /**
   * Validates all form elements.
   * @return {boolean} - true if the form is valid, false otherwise
   */
  form() {
    this.prepareForm();
    this.currentElements = this.elements();
    for (const element of this.currentElements) {
      this.check(element);
    }

    this.submitted = { ...this.submitted, ...this.errorMap };
    this.invalid = { ...this.errorMap };
    if (!this.valid() && this.settings.invalidHandler) {
      this.currentForm.dispatchEvent(new CustomEvent("invalid-form", {
        detail: this,
        bubbles: false
      }));
    }
    this.showErrors();
    return this.valid();
  }

  /**
   * Validates a single element within the form.
   * @param element - element to validate
   * @return {boolean} - true if the element is valid, false otherwise
   */
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

  /**
   * Returns true if there are currently no validation errors.
   * @return {boolean} - true if there are no validation errors, false otherwise
   */
  valid() {
    return this.size() === 0;
  }

  /**
   * Returns the number of validation errors.
   * @return {number} - number of validation errors
   */
  size() {
    return this.errorList.length;
  }

  /**
   * Returns a list of all form elements that need to be validated.
   * @return {NodeList} - list of form elements
   */
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

  /**
   * Returns an array of currently valid elements from the last validation.
   * @return {NodeList} - list of valid form elements
   */
  validElements() {
    const invalid = this.invalidElements();
    return this.currentElements.filter(el => !invalid.includes(el));
  }

  /**
   * Returns an array of currently invalid elements from the last validation.
   * @return {NodeList} - list of invalid form elements
   */
  invalidElements() {
    return this.errorList.map(e => e.element);
  }

  /**
   * Runs all validation rules against an element and returns true if valid.
   * @param element - element to validate
   * @return {boolean} - true if the element is valid, false otherwise
   */
  check(element) {
    element = this.validationTargetFor(element);

    const rules = getRules(element);
    const value = elementValue(element);
    const isBlank = isBlankElement(element);

    for (const method in rules) {
      const rule = { method, parameters: rules[method] };

      const methodFunc = methodStore.get(method);
      if (!methodFunc) {
        console.warn(`Validation method "${method}" not found. Skipping.`);
        continue;
      }

      try {
        const result = methodFunc(isBlank, value, element, rule.parameters);

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

  /**
   * Returns all error label elements currently in the DOM.
   * @return {HTMLElement[]} - array of error label elements
   */
  errors() {
    const errorClass = this.errorClasses.join(".");
    return [...this.errorContext.querySelectorAll(`${this.settings.errorElement}.${errorClass}`)];
  }

  showErrors() {
    for (const error of this.errorList) {
      if (this.settings.highlight) {
        this.settings.highlight(error.element, this.errorClasses, this.validClasses);
      }
      this.showLabel(error.element, error.message);
    }

    if (this.errorList.length) {
      this.toShow = this.toShow.concat(this.containers);
    }

    if (this.settings.success) {
      for (const el of this.successList) {
        this.showLabel(el);
      }
    }

    if (this.settings.unhighlight) {
      for (const element of this.validElements()) {
        this.settings.unhighlight(element, this.errorClasses, this.validClasses);
      }
    }

    this.toHide = this.toHide.filter(el => !this.toShow.includes(el));
    this.hideErrors();
    this.addWrapper(this.toShow).forEach(showElement);
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

  highlight(element, errorClasses, validClasses) {
    let targets = [element];
    if (element.type === "radio") {
      targets = findByName(element.form, element.name);
    }

    targets.forEach(el => {
      el.classList.add(...errorClasses);
      el.classList.remove(...validClasses);
    });
  }

  unhighlight(element, errorClasses, validClasses) {
    let targets = [element];
    if (element.type === "radio") {
      targets = findByName(element.form, element.name);
    }

    targets.forEach(el => {
      el.classList.remove(...errorClasses);
      el.classList.add(...validClasses);
    });
  }

  onFocusIn(element) {
    if (this.settings.focusCleanup) {
      if (this.settings.unhighlight) {
        this.settings.unhighlight(element, this.errorClasses, this.validClasses);
      }
      this.hideErrors(element);
    }
  }

  onFocusOut(element) {
    if (isCheckableElement(element)) {
      return;
    }
    if (!(element.name in this.submitted) && isBlankElement(element)) {
      return;
    }

    this.element(element);
  }

  onKeyUp(element, event) {
    if (event.which === 9 && elementValue(element) === "") {
      return;
    }

    // Avoid revalidate the field when pressing one of the following keys
    // Shift       => 16
    // Ctrl        => 17
    // Alt         => 18
    // Caps lock   => 20
    // End         => 35
    // Home        => 36
    // Left arrow  => 37
    // Up arrow    => 38
    // Right arrow => 39
    // Down arrow  => 40
    // Insert      => 45
    // Num lock    => 144
    // AltGr key   => 225
    const excludedKeys = [
      16, 17, 18, 20, 35, 36, 37,
      38, 39, 40, 45, 144, 225
    ];
    if (excludedKeys.includes(event.keyCode)) {
      return;
    }

    if (!(element.name in this.submitted) && !(element.name in this.invalid)) {
      return;
    }

    this.element(element);
  }

  onClick(element) {
    // Click on selects, radiobuttons and checkboxes
    if (element.name in this.submitted) {
      this.element(element);
    }
    // Or option elements, check parent select in that case
    else if ( element.parentNode.name in this.submitted ) {
      this.element(element.parentNode);
    }
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

      this.addWrapper(el).forEach(hideElement);
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
        el.classList.add(...this.errorClasses);
        el.innerHTML = message || "";
      });
    }
    else {
      const elementID = idOrName(element);

      const newError = document.createElement(this.settings.errorElement);
      newError.setAttribute("id", `${elementID}-error`);
      newError.classList.add(...this.errorClasses);
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

    if (!message && this.settings.success) {
      errors.forEach(e => e.innerText = "");
      if (typeof this.settings.success === "string") {
        errors.forEach(e => e.classList.add(this.settings.success));
      }
      else {
        this.settings.success(errors, element);
      }
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

    this.currentForm.removeEventListener("focusin", this.boundEventHandlers.onFocusIn);
    this.currentForm.removeEventListener("focusout", this.boundEventHandlers.onFocusOut);
    this.currentForm.removeEventListener("keyup", this.boundEventHandlers.onKeyUp);
    this.currentForm.removeEventListener("click", this.boundEventHandlers.onClick);
    this.currentForm.removeEventListener("invalid-form", this.boundEventHandlers.onInvalidForm);
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
        this.unhighlight(element, ...this.errorClasses, []);
        findByName(element.form, element.name).forEach(el => el.classList.remove(...this.validClasses));
      }
    }
    else {
      this.elements().forEach(el => {
        el.classList.remove(...this.errorClasses);
        el.classList.remove(...this.validClasses);
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

  /**
   * Returns true if the element should be skipped from receiving validation.
   * @param element - element to check
   * @return {boolean} - true if the element should be skipped, false otherwise
   */
  shouldIgnore(element) {
    if (!this.settings.ignore) {
      return false;
    }
    if (this.settings.ignore === ":hidden") {
      return !isVisible(element);
    }

    return element.matches(this.settings.ignore);
  }

  get errorClasses() {
    return this.settings.errorClass.split(" ")
      .filter(Boolean);
  }

  get validClasses() {
    return this.settings.validClass.split(" ")
      .filter(Boolean);
  }
}
