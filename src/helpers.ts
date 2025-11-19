/**
 * Returns true if the element is visible in the DOM.
 * @param {HTMLElement} el - element to check visibility
 * @return {boolean} - true if element is visible, false otherwise
 */
export function isVisible(el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

/**
 * Returns the number of truthy properties in an object.
 * @param {Object} obj - object to count properties
 * @return {number} - count of truthy properties
 */
export function objectLength(obj) {
  let count = 0;
  for (const key in obj) {
    // This check allows counting elements with empty error message as invalid elements
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== false) {
      count++;
    }
  }
  return count;
}

/**
 * Finds all form elements with the specified name attribute.
 * @param {HTMLFormElement} form - form element to search within
 * @param {string} name - name attribute to search for
 * @return {HTMLElement[]} - array of matching elements
 */
export function findByName(form, name) {
  return [...form.querySelectorAll(`[name='${escapeCssMeta(name)}']`)];
}

/**
 * Returns true if the element is a radio button or checkbox.
 * @param {HTMLElement} element - element to check
 * @return {boolean} - true if element is radio or checkbox, false otherwise
 */
export function isCheckableElement(element) {
  return /radio|checkbox/i.test(element.type);
}

/**
 * Escapes CSS meta-characters in a string for use in CSS selectors.
 * See https://api.jquery.com/category/selectors/ for CSS meta-characters that should be escaped.
 * @param {string} text - text to escape
 * @return {string} - escaped text safe for CSS selectors
 */
export function escapeCssMeta(text) {
  if (text === undefined) {
    return '';
  }

  return text.replace(/([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, '\\$1');
}

/**
 * Gets the value of a form element, handling special cases for different input types.
 * @param {HTMLElement} element - form element to get value from
 * @return {string|string[]} - element value or array of values for checkboxes/radios
 */
export function elementValue(element) {
  if (element.type === 'radio' || element.type === 'checkbox') {
    const checked = findByName(element.form, element.name).filter((el) =>
      el.matches(':checked'),
    );
    return checked.map((el) => el.value);
  }
  if (element.type === 'number' && typeof element.validity !== 'undefined') {
    return element.validity.badInput ? 'NaN' : element.value;
  }
  if (element.type === 'file') {
    return fileInputValue(element);
  }
  if (typeof element.value === 'string') {
    return element.value.replace(/\r/g, '');
  }

  return element.value;
}

/**
 * Get the value of a file input element.
 * @param element - file input element
 * @return {string} - file path or file name
 */
export function fileInputValue(element) {
  const value = element.value;

  // Modern browser (chrome & safari)
  if (value.substring(0, 12) === 'C:\\fakepath\\') {
    return value.substring(12);
  }

  // Legacy browsers
  // Unix-based path
  let idx = value.lastIndexOf('/');
  if (idx >= 0) {
    return value.substring(idx + 1);
  }

  // Windows-based path
  idx = value.lastIndexOf('\\');
  if (idx >= 0) {
    return value.substring(idx + 1);
  }

  // Just the file name
  return value;
}

/**
 * Returns the first defined (non-undefined) argument from the provided arguments.
 * @param {...*} args - arguments to check
 * @return {*} - first defined argument or undefined if none found
 */
export function findDefined(...args) {
  for (const arg of args) {
    if (arg !== undefined) {
      return arg;
    }
  }
  return undefined;
}

/**
 * Formats a string by replacing {0}, {1}, etc. placeholders with provided parameters.
 * @param {string} source - template string with placeholders
 * @param {...*} params - parameters to substitute into placeholders
 * @return {string|function} - formatted string or curried function if only source provided
 */
export function format(source, params?: any) {
  if (arguments.length === 1) {
    return function () {
      const args = [...arguments];
      args.unshift(source);
      return format.apply(null, args);
    };
  }

  if (params === undefined) {
    return source;
  }
  if (arguments.length > 2 && params.constructor !== Array) {
    params = [...arguments].slice(1);
  }
  if (params.constructor !== Array) {
    params = [params];
  }

  params.forEach((param, index) => {
    source = source.replace(new RegExp(`\\{${index}\\}`, 'g'), param);
  });

  return source;
}

/**
 * Returns the id or name attribute of an element, preferring name for checkable elements.
 * @param {HTMLElement} element - element to get identifier from
 * @return {string} - element id or name
 */
export function idOrName(element) {
  return (
    (isCheckableElement(element) ? element.name : element.id) || element.name
  );
}

/**
 * Gets the length of a form element's value, handling special cases for selects and checkables.
 * @param {*} value - element value
 * @param {HTMLElement} element - form element
 * @return {number} - length of the element's value
 */
export function getLength(value, element) {
  const nodeName = element.nodeName.toLowerCase();

  if (nodeName === 'select') {
    return element.querySelectorAll('option:checked').length;
  } else if (nodeName === 'input' && isCheckableElement(element)) {
    return findByName(element.form, element.name).filter((el) =>
      el.matches(':checked'),
    ).length;
  }

  return value.length;
}

/**
 * Returns true if the element has no value or is considered blank.
 * @param {HTMLElement} element - form element to check
 * @return {boolean} - true if element is blank, false otherwise
 */
export function isBlankElement(element) {
  const value = elementValue(element);

  if (element.nodeName.toLowerCase() === 'select') {
    const selected = [...element.selectedOptions].map((o) => o.value);

    return selected.length === 0 || !selected[0];
  }

  if (isCheckableElement(element)) {
    return getLength(value, element) === 0;
  }

  return value === undefined || value === null || value.length === 0;
}

const displayDataMap = new WeakMap();

/**
 * Shows an element by restoring its original display value.
 * Matches jQuery's .show() behavior.
 * @param {HTMLElement} element - Element to show
 */
export function showElement(element) {
  const storedDisplay = displayDataMap.get(element);
  if (storedDisplay) {
    element.style.display = storedDisplay;
    displayDataMap.delete(element);
  } else {
    element.style.display = '';
  }
}

/**
 * Hides an element by setting display to none, storing the original display value.
 * Matches jQuery's .hide() behavior.
 * @param {HTMLElement} element - Element to hide
 */
export function hideElement(element) {
  if (element.style.display !== 'none') {
    // Store current display value
    displayDataMap.set(
      element,
      element.style.display || getComputedStyle(element).display,
    );
    element.style.display = 'none';
  }
}
