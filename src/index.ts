/**
 * @fileoverview Core validation library for client-side form validation.
 * Provides programmatic API for validating forms and form elements.
 */

import { Validator } from './validator';
import { validatorStore } from './validatorStore';
import { addClassRules, getRules, normalizeRule } from './rules';
import { store as methods } from './methods';
import { store as messages } from './messages';
import { ValidatorSettings } from './types';

/**
 * Creates or retrieves a validator for a form or form element.
 * If a validator already exists for the element, returns the existing validator.
 *
 * @param selector - CSS selector string or HTMLElement to validate
 * @param [options] - Validation options including rules, messages, and callbacks
 * @returns Validator instance or undefined if element not found
 * @example
 * // Validate a form with rules
 * dv.validate('#myForm', {
 *   rules: {
 *     email: { required: true, email: true },
 *     password: { required: true, minlength: 8 }
 *   }
 * });
 */
export function validate(
  selector: string | HTMLElement,
  options?: Partial<ValidatorSettings>,
) {
  const element =
    selector instanceof HTMLElement
      ? selector
      : document.querySelector(selector);

  if (!element) {
    console.warn("No element selected, can't validate.");
    return;
  }
  if (!(element instanceof HTMLFormElement)) {
    const elementType = element.tagName || 'unknown element';
    console.warn(
      `Element must be a form element for validation. Received: ${elementType}`,
    );
    return;
  }

  if (validatorStore.has(element)) {
    return validatorStore.get(element);
  }

  const validator = new Validator(element, options);
  validatorStore.set(element, validator);
  return validator;
}

/**
 * Validates form or form elements and returns whether they are valid.
 * Triggers validation and returns the result without submitting the form.
 *
 * @param {string|HTMLElement|HTMLElement[]} selector - Element(s) to validate:
 * CSS selector, element, or array of elements
 * @returns {boolean} True if all elements are valid, false otherwise
 * @example
 * // Check if form is valid
 * if (dv.valid('#myForm')) {
 *   console.log('Form is valid!');
 * }
 *
 * // Check specific fields
 * if (dv.valid(['#email', '#password'])) {
 *   console.log('Email and password are valid!');
 * }
 */
export function valid(selector: string | HTMLElement | HTMLElement[]) {
  let elements: any[] = [];
  if (typeof selector === 'string') {
    elements = Array.from(document.querySelectorAll(selector));
  } else if (selector instanceof HTMLElement) {
    elements = [selector];
  } else if (Array.isArray(selector)) {
    elements = selector;
  }

  if (elements[0].matches('form')) {
    return validate(elements[0]).form();
  }

  const errorList: any[] = [];
  let valid = true;
  const validator = validate(elements[0].form);

  elements.forEach((el) => {
    valid = validator.element(el) && valid;
    if (!valid) {
      errorList.push(...validator.errorList);
    }
  });

  validator.errorList = errorList;
  return valid;
}

/**
 * Gets the validation rules for an element.
 *
 * @param {string|HTMLElement} selector - CSS selector string or HTMLElement
 * @returns {Object} Object containing validation rules for the element
 * @example
 * // Get rules for an input
 * const emailRules = dv.rules('#email');
 * console.log(emailRules); // { required: true, email: true }
 */
export function rules(selector: string | HTMLElement) {
  const element =
    selector instanceof HTMLElement
      ? selector
      : document.querySelector(selector);

  return getRules(element);
}

/**
 * Adds a custom validation method.
 * The method can be used in validation rules by its name.
 *
 * @param {string} name - Name of the validation method
 * @param {Function} method - Validation function that returns true if valid
 * @param {string} [message] - Default error message for this validation method
 * @example
 * // Add a custom phone validation method
 * dv.addMethod('phone', function(blank, value, element) {
 *   return blank || /^\d{3}-\d{3}-\d{4}$/.test(value);
 * }, 'Please enter a valid phone number (xxx-xxx-xxxx)');
 *
 * // Use in validation rules
 * dv.validate('#myForm', {
 *   rules: {
 *     phoneNumber: { phone: true }
 *   }
 * });
 */
export function addMethod(name: string, method: any, message: any) {
  methods.set(name, method);
  if (message) {
    messages.set(name, message);
  }
  if (method.length < 3) {
    const rules = normalizeRule(name);
    addClassRules(name, rules);
  }
}

/**
 * Map of validation error messages.
 * @type {Map<string, string>}
 */
export { messages };

/**
 * Map of validation methods.
 * @type {Map<string, Function>}
 */
export { methods };

/**
 * Default export containing all validation functions and stores.
 * @namespace
 */
export default {
  validate,
  valid,
  rules,
  addMethod,
  messages,
  methods,
};
