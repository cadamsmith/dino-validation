/**
 * Returns true if the element is visible in the DOM.
 * @param el - element to check visibility
 * @return true if element is visible, false otherwise
 */
export function isVisible(el: any): boolean {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

/**
 * Returns the number of truthy properties in an object.
 * @param obj - object to count properties
 * @return count of truthy properties
 */
export function objectLength(obj: any): number {
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
 * @param form - form element to search within
 * @param name - name attribute to search for
 * @return array of matching elements
 */
export function findByName(form: any, name: string): any[] {
  return [...form.querySelectorAll(`[name='${escapeCssMeta(name)}']`)];
}

/**
 * Returns true if the element is a radio button or checkbox.
 * @param element - element to check
 * @return true if element is radio or checkbox, false otherwise
 */
export function isCheckableElement(element: any): boolean {
  return /radio|checkbox/i.test(element.type);
}

/**
 * Escapes CSS meta-characters in a string for use in CSS selectors.
 * See https://api.jquery.com/category/selectors/ for CSS meta-characters that should be escaped.
 * @param text - text to escape
 * @return escaped text safe for CSS selectors
 */
export function escapeCssMeta(text: string): string {
  if (text === undefined) {
    return '';
  }

  return text.replace(/([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, '\\$1');
}

/**
 * Gets the value of a form element, handling special cases for different input types.
 * @param element - form element to get value from
 * @return element value or array of values for checkboxes/radios
 */
export function elementValue(element: any): string | string[] {
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
 * @return file path or file name
 */
export function fileInputValue(element: any): string {
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
 * @param args - arguments to check
 * @return first defined argument or undefined if none found
 */
export function findDefined(...args: any[]): any {
  for (const arg of args) {
    if (arg !== undefined) {
      return arg;
    }
  }
  return undefined;
}

/**
 * Formats a string by replacing {0}, {1}, etc. placeholders with provided parameters.
 * @param source - template string with placeholders
 * @param params - parameters to substitute into placeholders
 * @return formatted string or curried function if only source provided
 */
export function format(
  source: string,
  params?: any[],
): ((...args: any[]) => string) | string {
  // If no params provided, return a curried function
  if (params === undefined) {
    return function (...args: any[]) {
      return formatString(source, args);
    };
  }

  return formatString(source, params);
}

/**
 * Internal helper to format a string with parameters.
 * @param source - template string with placeholders
 * @param params - parameters to substitute
 * @return formatted string
 */
function formatString(source: string, params: any[]): string {
  if (!Array.isArray(params)) {
    params = [params];
  }

  params.forEach((param: any, index: number) => {
    source = source.replace(new RegExp(`\\{${index}\\}`, 'g'), String(param));
  });

  return source;
}

/**
 * Returns the id or name attribute of an element, preferring name for checkable elements.
 * @param element - element to get identifier from
 * @return element id or name
 */
export function idOrName(element: any): string {
  return (
    (isCheckableElement(element) ? element.name : element.id) || element.name
  );
}

/**
 * Gets the length of a form element's value, handling special cases for selects and checkables.
 * @param value - element value
 * @param element - form element
 * @return length of the element's value
 */
export function getLength(value: any, element: any): number {
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
 * @param element - form element to check
 * @return true if element is blank, false otherwise
 */
export function isBlankElement(element: any): boolean {
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
 * @param element - Element to show
 */
export function showElement(element: any): void {
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
 * @param element - Element to hide
 */
export function hideElement(element: any): void {
  if (element.style.display !== 'none') {
    // Store current display value
    displayDataMap.set(
      element,
      element.style.display || getComputedStyle(element).display,
    );
    element.style.display = 'none';
  }
}
