import { ValidationMethod, ValidationMethodInput } from './types';
import { ObjectStore } from './objectStore';

/**
 * Public API for accessing and managing validation methods.
 */
export const store = new ObjectStore<ValidationMethod>({
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
});

/**
 * Validates that the field has a value (is not blank).
 * @return true if field is not blank
 */
function required({ blank }: ValidationMethodInput): boolean {
  return !blank;
}

/**
 * Validates that the field value has at least the minimum length.
 * @return true if blank or length meets minimum
 */
function minLength({ blank, length, param }: ValidationMethodInput): boolean {
  return blank || length >= param;
}

/**
 * Validates that the field value does not exceed the maximum length.
 * @return true if blank or length within maximum
 */
function maxLength({ blank, length, param }: ValidationMethodInput): boolean {
  return blank || length <= param;
}

/**
 * Validates that the field value length is within a specified range.
 * @return true if blank or length within range
 */
function rangeLength({ blank, length, param }: ValidationMethodInput): boolean {
  return blank || (length >= param[0] && length <= param[1]);
}

/**
 * Validates that the field value is greater than or equal to a minimum value.
 * @return true if blank or value meets minimum
 */
function min({ blank, value, param }: ValidationMethodInput): boolean {
  return blank || (value !== null && value >= param);
}

/**
 * Validates that the field value is less than or equal to a maximum value.
 * @return true if blank or value within maximum
 */
function max({ blank, value, param }: ValidationMethodInput): boolean {
  return blank || (value !== null && value <= param);
}

/**
 * Validates that the field value is within a specified numeric range.
 * @return true if blank or value within range
 */
function range({ blank, value, param }: ValidationMethodInput): boolean {
  if (blank) {
    return true;
  }

  return value !== null && value >= param[0] && value <= param[1];
}

/**
 * Validates that the field value is a valid email address format.
 * @param blank - whether the field is blank
 * @param value - field value
 * @return true if blank or valid email format
 */
function email({ blank, value }: ValidationMethodInput): boolean {
  if (blank) {
    return true;
  }

  const re =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return value !== null && re.test(value);
}

/**
 * Validates that the field value is a valid URL format.
 * @param blank - whether the field is blank
 * @param value - field value
 * @return true if blank or valid URL format
 */
function url({ blank, value }: ValidationMethodInput): boolean {
  if (blank) {
    return true;
  }

  const re =
    /^(?:(?:https?|ftp):)?\/\/(?:(?:[^\]\[?\/<~#`!@$^&*()+=}|:";',>{ ]|%[0-9A-Fa-f]{2})+(?::(?:[^\]\[?\/<~#`!@$^&*()+=}|:";',>{ ]|%[0-9A-Fa-f]{2})*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[\/?#]\S*)?$/i;

  return value !== null && re.test(value);
}

/**
 * Validates that the field value is a valid date string
 * @param blank - whether the field is blank
 * @param value - field value
 * @return true if blank or valid date string
 */
function date({ blank, value }: ValidationMethodInput): boolean {
  if (blank) {
    return true;
  }

  return value !== null && !/Invalid|NaN/.test(new Date(value).toString());
}

/**
 * Validates that the field value is a valid ISO date format (YYYY-MM-DD or YYYY/MM/DD).
 * @param blank - whether the field is blank
 * @param value - field value
 * @return true if blank or valid ISO date format
 */
function dateISO({ blank, value }: ValidationMethodInput): boolean {
  if (blank) {
    return true;
  }

  const re = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
  return value !== null && re.test(value);
}

/**
 * Validates that the field value is a valid number (including decimals and comma-separated thousands).
 * @param blank - whether the field is blank
 * @param value - field value
 * @return true if blank or valid number format
 */
function number({ blank, value }: ValidationMethodInput): boolean {
  if (blank) {
    return true;
  }

  const re = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:-?\.\d+)?$/;
  return value !== null && re.test(value);
}

/**
 * Validates that the field value contains only digits (no decimals or special characters).
 * @param blank - whether the field is blank
 * @param value - field value
 * @return true if blank or contains only digits
 */
function digits({ blank, value }: ValidationMethodInput): boolean {
  if (blank) {
    return true;
  }

  const re = /^\d+$/;
  return value !== null && re.test(value);
}

/**
 * Validates that the field value equals the value of another field (e.g., password confirmation).
 * @return true if values match
 */
function equalTo({ value, param }: ValidationMethodInput): boolean {
  const target = document.querySelector(param);
  return value === target.value;
}

/**
 * Validates that the field value matches a regular expression.
 * @return true if blank or value matches pattern
 */
function regex({ blank, value, param }: ValidationMethodInput): boolean {
  if (blank) {
    return true;
  }
  if (value === null) {
    return false;
  }

  const match = new RegExp(param).exec(value);
  return !!match && match.index === 0 && match[0].length === value.length;
}

/**
 * Validates that the field value contains at least a minimum number of non-alphanumeric characters.
 * Used for password strength validation.
 * @return true if blank or value has enough non-alphanumeric characters
 */
function nonAlphaMin({ blank, value, param }: ValidationMethodInput): boolean {
  if (blank || !param) {
    return true;
  }
  if (value === null) {
    return false;
  }

  const match = value.match(/\W/g);
  return !!match && match.length >= param;
}

/**
 * Validates that the field value matches a credit card number.
 * based on https://en.wikipedia.org/wiki/Luhn_algorithm
 * @return true if blank or value is a valid credit card number
 */
function creditCard({ blank, value }: ValidationMethodInput): boolean {
  if (blank) {
    return true;
  }
  if (value === null) {
    return false;
  }

  const strippedValue = value.replace(/\D/g, '');

  let nCheck = 0;
  let bEven = false;

  // Basing min and max length on
  // https://dev.ean.com/general-info/valid-card-types/
  if (strippedValue.length < 13 || strippedValue.length > 19) {
    return false;
  }

  for (let n = strippedValue.length - 1; n >= 0; n--) {
    const cDigit = strippedValue.charAt(n);
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
