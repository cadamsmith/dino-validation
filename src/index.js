import { Validator, validatorMap } from './validator.js';
import { getRules } from './rules.js';

export function validate(selector) {
  const element = selector instanceof HTMLElement
    ? selector
    : document.querySelector(selector);

  if (!element) {
    console.warn("Nothing selected, can't validate, returning nothing.");
    return;
  }

  if (validatorMap.has(element)) {
    return validatorMap.get(element);
  }

  const validator = new Validator(element);
  validatorMap.set(element, validator);
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

export function rules(selectorOrElement) {
  const element = selectorOrElement instanceof HTMLElement
    ? selectorOrElement
    : document.querySelector(selectorOrElement);

  return getRules(element);
}
