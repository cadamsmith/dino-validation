import { getLength } from './helpers.js';

/**
 * Internal registry of all validation methods.
 * Each method receives (blank, value, element, param) and returns true if valid.
 */
const methods = {
  "required": required,
  "minlength": minLength,
  "maxlength": maxLength,
  "rangelength": rangeLength,
  "min": min,
  "max": max,
  "range": range,
  "email": email,
  "url": url,
  "date": date,
  "dateISO": dateISO,
  "number": number,
  "digits": digits,
  "equalTo": equalTo,
  "regex": regex,
  "nonalphamin": nonAlphaMin,
  "creditcard": creditCard
};

/**
 * Public API for accessing and managing validation methods.
 */
export const store = {
  /**
   * Returns all registered validation method names.
   * @return {string[]} - array of method names
   */
  keys: function () {
    return Object.keys(methods);
  },
  /**
   * Gets a validation method by name.
   * @param {string} key - method name
   * @return {Function} - validation method function
   */
  get: function (key) {
    return methods[key];
  },
  /**
   * Adds or replaces a validation method.
   * @param {string} key - method name
   * @param {Function} value - validation method function
   */
  set: function (key, value) {
    methods[key] = value;
  },
};

/**
 * Validates that the field has a value (is not blank).
 * @param {boolean} blank - whether the field is blank
 * @return {boolean} - true if field is not blank
 */
function required(blank) {
  return !blank;
}

/**
 * Validates that the field value has at least the minimum length.
 * @param {boolean} blank - whether the field is blank
 * @param {*} value - field value
 * @param {HTMLElement} element - form element
 * @param {number} param - minimum length required
 * @return {boolean} - true if blank or length meets minimum
 */
function minLength(blank, value, element, param) {
  const length = Array.isArray(value)
    ? value.length
    : getLength(value, element);
  return blank || length >= param;
}

/**
 * Validates that the field value does not exceed the maximum length.
 * @param {boolean} blank - whether the field is blank
 * @param {*} value - field value
 * @param {HTMLElement} element - form element
 * @param {number} param - maximum length allowed
 * @return {boolean} - true if blank or length within maximum
 */
function maxLength(blank, value, element, param) {
  const length = Array.isArray(value)
    ? value.length
    : getLength(value, element);
  return blank || length <= param;
}

/**
 * Validates that the field value length is within a specified range.
 * @param {boolean} blank - whether the field is blank
 * @param {*} value - field value
 * @param {HTMLElement} element - form element
 * @param {number[]} param - array of [min, max] length values
 * @return {boolean} - true if blank or length within range
 */
function rangeLength(blank, value, element, param) {
  const length = Array.isArray(value)
    ? value.length
    : getLength(value, element);
  return blank || (length >= param[0] && length <= param[1]);
}

/**
 * Validates that the field value is greater than or equal to a minimum value.
 * @param {boolean} blank - whether the field is blank
 * @param {number} value - field value
 * @param {HTMLElement} element - form element
 * @param {number} param - minimum value required
 * @return {boolean} - true if blank or value meets minimum
 */
function min(blank, value, element, param) {
  return blank || value >= param;
}

/**
 * Validates that the field value is less than or equal to a maximum value.
 * @param {boolean} blank - whether the field is blank
 * @param {number} value - field value
 * @param {HTMLElement} element - form element
 * @param {number} param - maximum value allowed
 * @return {boolean} - true if blank or value within maximum
 */
function max(blank, value, element, param) {
  return blank || value <= param;
}

/**
 * Validates that the field value is within a specified numeric range.
 * @param {boolean} blank - whether the field is blank
 * @param {number} value - field value
 * @param {HTMLElement} element - form element
 * @param {number[]} param - array of [min, max] values
 * @return {boolean} - true if blank or value within range
 */
function range(blank, value, element, param) {
  return blank || (value >= param[0] && value <= param[1]);
}

/**
 * Validates that the field value is a valid email address format.
 * @param {boolean} blank - whether the field is blank
 * @param {string} value - field value
 * @return {boolean} - true if blank or valid email format
 */
function email(blank, value) {
  const re =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return blank || re.test(value);
}

/**
 * Validates that the field value is a valid URL format.
 * @param {boolean} blank - whether the field is blank
 * @param {string} value - field value
 * @return {boolean} - true if blank or valid URL format
 */
function url(blank, value) {
  const re =
    /^(?:(?:https?|ftp):)?\/\/(?:(?:[^\]\[?\/<~#`!@$^&*()+=}|:";',>{ ]|%[0-9A-Fa-f]{2})+(?::(?:[^\]\[?\/<~#`!@$^&*()+=}|:";',>{ ]|%[0-9A-Fa-f]{2})*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[\/?#]\S*)?$/i;
  return blank || re.test(value);
}

/**
 * Validates that the field value is a valid date string
 * @param {boolean} blank - whether the field is blank
 * @param {string} value - field value
 * @return {boolean} - true if blank or valid date string
 */
function date(blank, value) {
  return blank || !/Invalid|NaN/.test(new Date(value).toString());
}

/**
 * Validates that the field value is a valid ISO date format (YYYY-MM-DD or YYYY/MM/DD).
 * @param {boolean} blank - whether the field is blank
 * @param {string} value - field value
 * @return {boolean} - true if blank or valid ISO date format
 */
function dateISO(blank, value) {
  const re = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
  return blank || re.test(value);
}

/**
 * Validates that the field value is a valid number (including decimals and comma-separated thousands).
 * @param {boolean} blank - whether the field is blank
 * @param {string} value - field value
 * @return {boolean} - true if blank or valid number format
 */
function number(blank, value) {
  const re = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:-?\.\d+)?$/;
  return blank || re.test(value);
}

/**
 * Validates that the field value contains only digits (no decimals or special characters).
 * @param {boolean} blank - whether the field is blank
 * @param {string} value - field value
 * @return {boolean} - true if blank or contains only digits
 */
function digits(blank, value) {
  const re = /^\d+$/;
  return blank || re.test(value);
}

/**
 * Validates that the field value equals the value of another field (e.g., password confirmation).
 * @param {boolean} blank - whether the field is blank
 * @param {string} value - field value
 * @param {HTMLElement} element - form element
 * @param {string} param - CSS selector for the target element to compare against
 * @return {boolean} - true if values match
 */
function equalTo(blank, value, element, param) {
  const target = document.querySelector(param);
  return value === target.value;
}

/**
 * Validates that the field value matches a regular expression.
 * @param {boolean} blank - whether the field is blank
 * @param {string} value - field value
 * @param {HTMLElement} element - form element
 * @param {string} param - regular expression pattern
 * @return {boolean} - true if blank or value matches pattern
 */
function regex(blank, value, element, param) {
  if (blank) {
    return true;
  }

  const match = new RegExp(param).exec(value);
  return match && match.index === 0 && match[0].length === value.length;
}

/**
 * Validates that the field value contains at least a minimum number of non-alphanumeric characters.
 * Used for password strength validation.
 * @param {boolean} blank - whether the field is blank
 * @param {string} value - field value
 * @param {HTMLElement} element - form element
 * @param {number} param - minimum number of non-alphanumeric characters required
 * @return {boolean} - true if blank or value has enough non-alphanumeric characters
 */
function nonAlphaMin(blank, value, element, param) {
  if (blank || !param) {
    return true;
  }

  const match = value.match(/\W/g);
  return match && match.length >= param;
}

/**
 * Validates that the field value matches a credit card number.
 * based on https://en.wikipedia.org/wiki/Luhn_algorithm
 * @param {boolean} blank - whether the field is blank
 * @param {string} value - field value
 * @return {boolean} - true if blank or value is a valid credit card number
 */
function creditCard(blank, value) {
  if (blank) {
    return true;
  }

  let nCheck = 0;
  let bEven = false;

  value = value.replace(/\D/g, '');

  // Basing min and max length on
  // https://dev.ean.com/general-info/valid-card-types/
  if (value.length < 13 || value.length > 19) {
    return false;
  }

  for (let n = value.length - 1; n >= 0; n--) {
    const cDigit = value.charAt(n);
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
