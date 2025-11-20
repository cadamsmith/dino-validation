import { getValueLength } from './helpers';
import {
  FormControlElement,
  ValidationMethod
} from './types';

/**
 * Internal registry of all validation methods.
 * Each method receives (blank, value, element, param) and returns true if valid.
 */
const methods: Record<string, ValidationMethod> = {
  required,
  minlength: minLength,
  maxlength: maxLength,
  rangelength: rangeLength,
  min,
  max,
  range,
  email,
  url,
  date,
  dateISO,
  number,
  digits,
  equalTo,
  regex,
  nonalphamin: nonAlphaMin,
  creditcard: creditCard,
};

/**
 * Public API for accessing and managing validation methods.
 */
export const store = {
  /**
   * Returns all registered validation method names.
   * @return {string[]} - array of method names
   */
  keys: function (): string[] {
    return Object.keys(methods);
  },
  /**
   * Gets a validation method by name.
   * @param {string} key - method name
   * @return {Function} - validation method function
   */
  get: function (key: string): ValidationMethod | undefined {
    return methods[key];
  },
  /**
   * Adds or replaces a validation method.
   * @param {string} key - method name
   * @param {Function} value - validation method function
   */
  set: function (key: string, value: ValidationMethod): void {
    methods[key] = value;
  },
};

/**
 * Validates that the field has a value (is not blank).
 * @param blank - whether the field is blank
 * @return true if field is not blank
 */
function required(blank: boolean): boolean {
  return !blank;
}

/**
 * Validates that the field value has at least the minimum length.
 * @param blank - whether the field is blank
 * @param value - field value
 * @param element - form element
 * @param param - minimum length required
 * @return true if blank or length meets minimum
 */
function minLength(
  blank: boolean,
  value: string | string[],
  element: FormControlElement,
  param: any,
): boolean {
  if (blank) {
    return true;
  }

  const length = Array.isArray(value) ? value.length : getValueLength(element);
  return length >= param;
}

/**
 * Validates that the field value does not exceed the maximum length.
 * @param blank - whether the field is blank
 * @param value - field value
 * @param element - form element
 * @param param - maximum length allowed
 * @return true if blank or length within maximum
 */
function maxLength(
  blank: boolean,
  value: string | string[],
  element: FormControlElement,
  param: any,
): boolean {
  if (blank) {
    return true;
  }

  const length = Array.isArray(value) ? value.length : getValueLength(element);
  return length <= param;
}

/**
 * Validates that the field value length is within a specified range.
 * @param blank - whether the field is blank
 * @param value - field value
 * @param element - form element
 * @param param - array of [min, max] length values
 * @return true if blank or length within range
 */
function rangeLength(
  blank: boolean,
  value: string | string[],
  element: FormControlElement,
  param: any,
): boolean {
  const length = Array.isArray(value) ? value.length : getValueLength(element);
  return blank || (length >= param[0] && length <= param[1]);
}

/**
 * Validates that the field value is greater than or equal to a minimum value.
 * @param blank - whether the field is blank
 * @param value - field value
 * @param _element - form element
 * @param param - minimum value required
 * @return true if blank or value meets minimum
 */
function min(
  blank: boolean,
  value: string | string[],
  _element: FormControlElement,
  param: any,
): boolean {
  return blank || value >= param;
}

/**
 * Validates that the field value is less than or equal to a maximum value.
 * @param blank - whether the field is blank
 * @param value - field value
 * @param _element - form element
 * @param param - maximum value allowed
 * @return true if blank or value within maximum
 */
function max(
  blank: boolean,
  value: string | string[],
  _element: FormControlElement,
  param: any,
): boolean {
  return blank || value <= param;
}

/**
 * Validates that the field value is within a specified numeric range.
 * @param blank - whether the field is blank
 * @param value - field value
 * @param _element - form element
 * @param param - array of [min, max] values
 * @return true if blank or value within range
 */
function range(
  blank: boolean,
  value: string | string[],
  _element: FormControlElement,
  param: any,
): boolean {
  return blank || (value >= param[0] && value <= param[1]);
}

/**
 * Validates that the field value is a valid email address format.
 * @param blank - whether the field is blank
 * @param value - field value
 * @return true if blank or valid email format
 */
function email(blank: boolean, value: string | string[]): boolean {
  if (blank) {
    return true;
  }

  const val = Array.isArray(value) ? value[0]! : value;
  const re =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return re.test(val);
}

/**
 * Validates that the field value is a valid URL format.
 * @param blank - whether the field is blank
 * @param value - field value
 * @return true if blank or valid URL format
 */
function url(blank: boolean, value: string | string[]): boolean {
  if (blank) {
    return true;
  }

  const val = Array.isArray(value) ? value[0]! : value;
  const re =
    /^(?:(?:https?|ftp):)?\/\/(?:(?:[^\]\[?\/<~#`!@$^&*()+=}|:";',>{ ]|%[0-9A-Fa-f]{2})+(?::(?:[^\]\[?\/<~#`!@$^&*()+=}|:";',>{ ]|%[0-9A-Fa-f]{2})*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[\/?#]\S*)?$/i;

  return re.test(val);
}

/**
 * Validates that the field value is a valid date string
 * @param blank - whether the field is blank
 * @param value - field value
 * @return true if blank or valid date string
 */
function date(blank: boolean, value: string | string[]): boolean {
  if (blank) {
    return true;
  }

  const val = Array.isArray(value) ? value[0]! : value;
  return !/Invalid|NaN/.test(new Date(val).toString());
}

/**
 * Validates that the field value is a valid ISO date format (YYYY-MM-DD or YYYY/MM/DD).
 * @param blank - whether the field is blank
 * @param value - field value
 * @return true if blank or valid ISO date format
 */
function dateISO(blank: boolean, value: string | string[]): boolean {
  if (blank) {
    return true;
  }

  const val = Array.isArray(value) ? value[0]! : value;
  const re = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
  return re.test(val);
}

/**
 * Validates that the field value is a valid number (including decimals and comma-separated thousands).
 * @param blank - whether the field is blank
 * @param value - field value
 * @return true if blank or valid number format
 */
function number(blank: boolean, value: string | string[]): boolean {
  if (blank) {
    return true;
  }

  const val = Array.isArray(value) ? value[0]! : value;
  const re = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:-?\.\d+)?$/;
  return re.test(val);
}

/**
 * Validates that the field value contains only digits (no decimals or special characters).
 * @param blank - whether the field is blank
 * @param value - field value
 * @return true if blank or contains only digits
 */
function digits(blank: boolean, value: string | string[]): boolean {
  if (blank) {
    return true;
  }

  const val = Array.isArray(value) ? value[0]! : value;
  const re = /^\d+$/;
  return re.test(val);
}

/**
 * Validates that the field value equals the value of another field (e.g., password confirmation).
 * @param _blank - whether the field is blank
 * @param value - field value
 * @param _element - form element
 * @param param - CSS selector for the target element to compare against
 * @return true if values match
 */
function equalTo(
  _blank: boolean,
  value: string | string[],
  _element: FormControlElement,
  param: any,
): boolean {
  const target = document.querySelector(param);
  return value === target.value;
}

/**
 * Validates that the field value matches a regular expression.
 * @param blank - whether the field is blank
 * @param value - field value
 * @param _element - form element
 * @param param - regular expression pattern
 * @return true if blank or value matches pattern
 */
function regex(
  blank: boolean,
  value: string | string[],
  _element: FormControlElement,
  param: any,
): boolean {
  if (blank) {
    return true;
  }

  const val = Array.isArray(value) ? value[0]! : value;
  const match = new RegExp(param).exec(val);
  return !!match && match.index === 0 && match[0].length === val.length;
}

/**
 * Validates that the field value contains at least a minimum number of non-alphanumeric characters.
 * Used for password strength validation.
 * @param blank - whether the field is blank
 * @param value - field value
 * @param _element - form element
 * @param param - minimum number of non-alphanumeric characters required
 * @return true if blank or value has enough non-alphanumeric characters
 */
function nonAlphaMin(
  blank: boolean,
  value: string | string[],
  _element: FormControlElement,
  param: any,
): boolean {
  if (blank || !param) {
    return true;
  }

  const val = Array.isArray(value) ? value[0]! : value;
  const match = val.match(/\W/g);
  return !!match && match.length >= param;
}

/**
 * Validates that the field value matches a credit card number.
 * based on https://en.wikipedia.org/wiki/Luhn_algorithm
 * @param blank - whether the field is blank
 * @param value - field value
 * @return true if blank or value is a valid credit card number
 */
function creditCard(blank: boolean, value: string | string[]): boolean {
  if (blank) {
    return true;
  }

  const val = (Array.isArray(value) ? value[0]! : value).replace(/\D/g, '');

  let nCheck = 0;
  let bEven = false;

  // Basing min and max length on
  // https://dev.ean.com/general-info/valid-card-types/
  if (val.length < 13 || val.length > 19) {
    return false;
  }

  for (let n = val.length - 1; n >= 0; n--) {
    const cDigit = val.charAt(n);
    let nDigit = parseInt(cDigit, 10);
    if (bEven) {
      if ((nDigit *= 2) > 9) {
        nDigit -= 9;
      }
    }

    nCheck += nDigit;
    bEven = !bEven;
  }

  return nCheck % 10 === 0;
}
