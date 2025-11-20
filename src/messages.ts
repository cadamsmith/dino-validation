import { findDefined, format } from './helpers';
import { Validator } from './validator';
import { FormControlElement } from './types';

/**
 * Default error messages for all validation methods.
 * Messages can be strings or functions that return formatted strings with parameters.
 */
const messages: Record<string, string | Function> = {
  required: 'This field is required.',
  remote: 'Please fix this field.',
  email: 'Please enter a valid email address.',
  url: 'Please enter a valid URL.',
  date: 'Please enter a valid date.',
  dateISO: 'Please enter a valid date (ISO).',
  number: 'Please enter a valid number.',
  digits: 'Please enter only digits.',
  equalTo: 'Please enter the same value again.',
  maxlength: format('Please enter no more than {0} characters.'),
  minlength: format('Please enter at least {0} characters.'),
  rangelength: format(
    'Please enter a value between {0} and {1} characters long.',
  ),
  range: format('Please enter a value between {0} and {1}.'),
  max: format('Please enter a value less than or equal to {0}.'),
  min: format('Please enter a value greater than or equal to {0}.'),
  step: format('Please enter a multiple of {0}.'),
  regex: format('Please enter a value that matches the pattern {0}.'),
  nonalphamin: format('Please enter at least {0} non-alphabetic characters.'),
  creditcard: 'Please enter a valid credit card number.',
};

/**
 * Public API for accessing and managing error messages.
 */
export const store = {
  /**
   * Returns all registered message keys.
   * @return {string[]} - array of message keys
   */
  keys: function (): string[] {
    return Object.keys(messages);
  },
  /**
   * Gets an error message by validation method name.
   * @param {string} key - validation method name
   * @return {string|Function} - error message string or function
   */
  get: function (key: string): string | Function | undefined {
    return messages[key];
  },
  /**
   * Adds or replaces an error message for a validation method.
   * @param {string} key - validation method name
   * @param {string|Function} value - error message string or function
   */
  set: function (key: string, value: string | Function): void {
    messages[key] = value;
  },
};

/**
 * Gets the appropriate error message for a validation rule failure.
 * Checks custom messages, data attributes, element title, and default messages in order.
 * @param element - form element that failed validation
 * @param rule - validation rule (string method name or object with method and parameters)
 * @param settings - validator settings that may contain custom messages
 * @return formatted error message
 */
export function getMessage(
  this: Validator,
  element: FormControlElement,
  rule: any,
  settings: Record<string, any>,
) {
  if (typeof rule === 'string') {
    rule = { method: rule };
  }

  let message = findDefined(
    customMessage(element.name, rule.method, settings),
    customDataMessage(element, rule.method),
    element.title || undefined,
    store.get(rule.method),
    `<strong>Warning: No message defined for ${element.name}</strong>`,
  );

  const regex = /\$?\{(\d+)}/g;

  if (typeof message === 'function') {
    message = message.call(this, rule.parameters, element);
  } else if (regex.test(message)) {
    message = format(message.replace(regex, '{$1}'), rule.parameters);
  }

  return message;
}

/**
 * Gets a custom error message from validator settings.
 * @param name - element name
 * @param method - validation method name
 * @param settings - validator settings that may contain custom messages
 * @return custom message if defined
 */
function customMessage(
  name: string,
  method: string,
  settings: Record<string, any>,
) {
  const m = settings[name];
  return m && (m.constructor === String ? m : m[method]);
}

/**
 * Gets a custom error message from element's data attributes.
 * Checks data-msg-{method} first, then falls back to data-msg.
 * @param element - form element
 * @param method - validation method name
 * @return custom message from data attribute if present
 */
function customDataMessage(element: FormControlElement, method: string): string | undefined {
  const dataSetKey =
    'msg' + method.charAt(0).toUpperCase() + method.substring(1).toLowerCase();

  if (!element?.dataset) {
    return;
  }

  return element.dataset[dataSetKey] || element.dataset['msg'];
}
