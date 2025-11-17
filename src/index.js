import { Validator } from './validator.js';
import { validatorStore } from './validatorStore.js';
import { addClassRules, getRules, normalizeRule } from './rules.js';
import { store as methodStore } from './methods.js';
import { store as messageStore } from './messages.js';
import { elementValue, isBlankElement } from './helpers.js';

export function validate(selector, options) {
  const element = selector instanceof HTMLElement
    ? selector
    : document.querySelector(selector);

  if (!element) {
    console.warn("Nothing selected, can't validate, returning nothing.");
    return;
  }

  if (validatorStore.has(element)) {
    return validatorStore.get(element);
  }

  const validator = new Validator(element, options);
  validatorStore.set(element, validator);
  return validator;
}

export function valid(selector) {
  let elements = [];
  if (typeof selector === 'string') {
    elements = [...document.querySelectorAll(selector)];
  }
  else if (selector instanceof HTMLElement) {
    elements = [selector];
  }
  else if (Array.isArray(selector)) {
    elements = selector;
  }

  if (elements[0].matches("form")) {
    return validate(elements[0]).form();
  }

  const errorList = [];
  let valid = true;
  const validator = validate(elements[0].form);

  elements.forEach(el => {
    valid = validator.element(el) && valid;
    if (!valid) {
      errorList.push(...validator.errorList);
    }
  });

  validator.errorList = errorList;
  return valid;
}

export function rules(selector) {
  const element = selector instanceof HTMLElement
    ? selector
    : document.querySelector(selector);

  return getRules(element);
}


export function addMethod(name, method, message) {
  methodStore.set(name, method);
  if (message) {
    messageStore.set(name, message);
  }
  if (method.length < 3) {
    const rules = normalizeRule(name);
    addClassRules(name, rules);
  }
}

export const helpers = {
  isBlankElement,
  elementValue
};

export { store as messages } from "./messages.js";
export { store as methods } from "./methods.js";
