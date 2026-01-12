import { format } from './helpers';
import { Validator } from './validator';
import { FormControlElement } from './types';
import { ObjectStore } from './objectStore';

/**
 * Public API for accessing and managing error messages.
 */
export const store = new ObjectStore<string>({
  required: 'This field is required.',
  email: 'Please enter a valid email address.',
  url: 'Please enter a valid URL.',
  date: 'Please enter a valid date.',
  number: 'Please enter a valid number.',
  digits: 'Please enter only digits.',
  equalto: 'Please enter the same value again.',
  maxlength: 'Please enter no more than {0} characters.',
  minlength: 'Please enter at least {0} characters.',
  rangelength: 'Please enter a value between {0} and {1} characters long.',
  range: 'Please enter a value between {0} and {1}.',
  max: 'Please enter a value less than or equal to {0}.',
  min: 'Please enter a value greater than or equal to {0}.',

  regex: 'Please enter a value that matches the pattern {0}.',
  nonalphamin: 'Please enter at least {0} non-alphabetic characters.',
  creditcard: 'Please enter a valid credit card number.',
});

/**
 * Gets the appropriate error message for a validation rule failure.
 * Checks custom messages, data attributes, element title, and default messages in order.
 * @param element - form element that failed validation
 * @param rule - validation rule (string method name or object with method and parameters)
 * @param ignoreTitle - whether to ignore element title
 * @param customMessage - validator settings that may contain custom messages
 * @return formatted error message
 */
export function getMessage(
  this: Validator,
  element: FormControlElement,
  rule: { method: string; parameters?: any },
  ignoreTitle: boolean,
  customMessage?: string,
): string {
  let message: string = [
    customMessage,
    customDataMessage(element, rule.method),
    (!ignoreTitle && element.title) || undefined,
    store.get(rule.method),
    `<strong>Warning: No message defined for ${element.name}</strong>`,
  ].find((x) => x !== undefined) as string;

  const regex = /\$?\{(\d+)}/g;

  if (/\$?\{(\d+)}/g.test(message)) {
    return format(message.replace(regex, '{$1}'), rule.parameters) as string;
  } else {
    return message;
  }
}

/**
 * Gets a custom error message from element's data attributes.
 * Checks data-msg-{method} first, then falls back to data-msg.
 * @param element - form element
 * @param method - validation method name
 * @return custom message from data attribute if present
 */
function customDataMessage(
  element: FormControlElement,
  method: string,
): string | undefined {
  const dataSetKey =
    'msg' + method.charAt(0).toUpperCase() + method.substring(1).toLowerCase();

  if (!element?.dataset) {
    return;
  }

  return element.dataset[dataSetKey] || element.dataset['msg'];
}
