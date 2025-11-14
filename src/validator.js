import {
  elementValue,
  escapeCssMeta,
  findByName,
  getLength,
  idOrName,
  isBlankElement,
  isCheckableElement,
  isVisible,
  objectLength,
} from './helpers.js';
import { getRules } from './rules.js';
import { getMessage } from './messages.js';
import { getMethods } from './methods.js';
import { validatorStore } from './validatorStore.js';

export class Validator {
  currentForm = undefined;
  submitted = {};
  invalid = {};
  successList = [];
  errorList = [];
  errorMap = {};
  toShow = [];
  toHide = [];
  currentElements = [];

  settings = {
    ignore: ":hidden",
    rules: {}
  };

  constructor(form, options) {
    this.currentForm = form;
    this.settings = { ...this.settings, ...options};
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
        const result = getMethods()[method](isBlank, value, element, rule.parameters);

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
    return [...this.currentForm.querySelectorAll("label.error")];
  }

  showErrors() {
    for (const error of this.errorList) {
      this.highlight(error.element);
      this.showLabel(error.element, error.message);
    }

    for (const element of this.validElements()) {
      this.unhighlight(element, "error", "valid");
    }

    this.toHide = this.toHide.filter(el => !this.toShow.includes(el));
    this.hideErrors();
    this.toShow.forEach(el => {
      // TODO: this should restore to previous state instead of always using display:block
      el.style.display = "block";
    });
  }

  formatAndAdd(element, rule) {
    const message = getMessage(element, rule);

    this.errorList.push({ message, element, method: rule.method });
    this.errorMap[element.name] = message;
    this.submitted[element.name] = message;
  }

  prepareForm() {
    this.reset();
    this.toHide = this.errors();
  }

  highlight(element) {
    if (element.type === "radio") {
      findByName(element.form, element.name).forEach(el => {
        el.classList.add("error");
        el.classList.remove("valid");
      });
    }
    else {
      element.classList.add("error");
      element.classList.remove("valid");
    }
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

  hideErrors() {
    for (const element of this.toHide) {
      element.innerText = "";
      // TODO: match jquery and remember old display state
      element.style.display = "none";
    }
  }

  showLabel(element, message) {
    let errors = this.errorsFor(element);

    if (errors.length) {
      // Refresh error/success class
      errors.forEach(el => {
        el.classList.remove("valid");
        el.classList.add("error");
        el.innerHTML = message || "";
      });
    }
    else {
      const elementID = idOrName(element);

      const newError = document.createElement("label");
      newError.setAttribute("id", `${elementID}-error`);
      newError.classList.add("error");
      newError.innerHTML = message || "";
      element.after(newError);
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
  }

  resetForm() {
    this.invalid = {};
    this.submitted = {};
    this.prepareForm();
    this.hideErrors();

    this.resetElements();
  }

  resetElements() {
    for (const element of this.elements()) {
      this.unhighlight(element, "error", "");
      findByName(element.form, element.name).forEach(el => el.classList.remove("valid"));
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
    if (this.settings.ignore === ":hidden") {
      return !isVisible(element);
    }

    return element.matches(this.settings.ignore);
  }
}
