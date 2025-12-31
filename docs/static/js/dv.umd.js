(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
      ? define(['exports'], factory)
      : ((global =
          typeof globalThis !== 'undefined' ? globalThis : global || self),
        factory((global.dv = {})));
})(this, function (exports) {
  'use strict';

  /**
   * Returns true if the element is visible in the DOM.
   * @param el - element to check visibility
   * @return true if element is visible, false otherwise
   */
  function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }
  /**
   * Returns the number of truthy properties in an object.
   * @param obj - object to count properties
   * @return count of truthy properties
   */
  function objectLength(obj) {
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
  function findByName(form, name) {
    const selector = `[name='${escapeCssMeta(name)}']`;
    const elements = Array.from(form.querySelectorAll(selector));
    if (form.id) {
      const outsideElements = Array.from(
        document.querySelectorAll(selector),
      ).filter((el) => el.matches(`[form="${escapeCssMeta(form.id)}"]`));
      elements.push(...outsideElements);
    }
    return elements;
  }
  /**
   * Returns true if the element is a radio button or checkbox.
   * @param element - element to check
   * @return true if element is radio or checkbox, false otherwise
   */
  function isCheckableElement(element) {
    return /radio|checkbox/i.test(element.type || '');
  }
  /**
   * Escapes CSS meta-characters in a string for use in CSS selectors.
   * See https://api.jquery.com/category/selectors/ for CSS meta-characters that should be escaped.
   * @param text - text to escape
   * @return escaped text safe for CSS selectors
   */
  function escapeCssMeta(text) {
    if (text === undefined) {
      return '';
    }
    return text.replace(/([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, '\\$1');
  }
  /**
   * Gets the value of a form element, handling special cases for different input types.
   * @param element - form control element to get value of
   * @param form - current html form being validated
   * @return element value or array of values for checkboxes/radios
   */
  function elementValue(element, form) {
    if (element.type === 'radio' || element.type === 'checkbox') {
      const checked = findByName(form, element.name).filter((el) =>
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
    return element.value.replace(/\r/g, '');
  }
  /**
   * Get the value of a file input element.
   * @param element - file input element
   * @return file path or file name
   */
  function fileInputValue(element) {
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
   * Formats a string by replacing {0}, {1}, etc. placeholders with provided parameters.
   * @param source - template string with placeholders
   * @param params - parameters to substitute into placeholders
   * @return formatted string or curried function if only source provided
   */
  function format(source, params) {
    // If no params provided, return a curried function
    if (params === undefined) {
      return function (args) {
        return formatString(source, args);
      };
    }
    if (!Array.isArray(params)) {
      params = [params];
    }
    return formatString(source, params);
  }
  /**
   * Internal helper to format a string with parameters.
   * @param source - template string with placeholders
   * @param params - parameters to substitute
   * @return formatted string
   */
  function formatString(source, params) {
    if (!Array.isArray(params)) {
      params = [params];
    }
    params.forEach((param, index) => {
      source = source.replace(new RegExp(`\\{${index}\\}`, 'g'), String(param));
    });
    return source;
  }
  /**
   * Returns the id or name attribute of an element, preferring name for checkable elements.
   * @param element - element to get identifier from
   * @return element id or name
   */
  function idOrName(element) {
    return (
      (isCheckableElement(element) ? element.name : element.id) || element.name
    );
  }
  /**
   * Gets the length of a form element's value, handling special cases for selects and checkables.
   * @param element - form control element
   * @param form - html form element
   * @return length of the element's value
   */
  function getValueLength(element, form) {
    const nodeName = element.nodeName.toLowerCase();
    const value = elementValue(element, form);
    if (nodeName === 'select') {
      return element.querySelectorAll('option:checked').length;
    } else if (nodeName === 'input' && isCheckableElement(element)) {
      return findByName(form, element.name).filter((el) =>
        el.matches(':checked'),
      ).length;
    }
    return value.length;
  }
  /**
   * Returns true if the element has no value or is considered blank.
   * @param element - form control element to check
   * @param form - current form element
   * @return true if element is blank, false otherwise
   */
  function isBlankElement(element, form) {
    const value = elementValue(element, form);
    if (
      element.nodeName.toLowerCase() === 'select' &&
      element.selectedOptions
    ) {
      const selected = Array.from(element.selectedOptions).map((o) => o.value);
      return selected.length === 0 || !selected[0];
    }
    if (isCheckableElement(element)) {
      return getValueLength(element, form) === 0;
    }
    return value === undefined || value === null || value.length === 0;
  }
  const displayDataMap = new WeakMap();
  /**
   * Shows an element by restoring its original display value.
   * Matches jQuery's .show() behavior.
   * @param element - Element to show
   */
  function showElement(element) {
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
  function hideElement(element) {
    if (element.style.display !== 'none') {
      // Store current display value
      displayDataMap.set(
        element,
        element.style.display || getComputedStyle(element).display,
      );
      element.style.display = 'none';
    }
  }

  class ObjectStore {
    constructor(data) {
      this._store = {};
      this._store = data;
    }
    keys() {
      return Object.keys(this._store);
    }
    get(key) {
      return this._store[key];
    }
    set(key, value) {
      this._store[key] = value;
    }
    replace(data) {
      Object.entries(data).forEach(([key, value]) => {
        if (key in this._store) {
          this._store[key] = value;
        }
      });
    }
  }

  /**
   * Public API for accessing and managing validation methods.
   */
  const store$1 = new ObjectStore({
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
  function required({ blank }) {
    return !blank;
  }
  /**
   * Validates that the field value has at least the minimum length.
   * @return true if blank or length meets minimum
   */
  function minLength({ blank, length, param }) {
    return blank || length >= param;
  }
  /**
   * Validates that the field value does not exceed the maximum length.
   * @return true if blank or length within maximum
   */
  function maxLength({ blank, length, param }) {
    return blank || length <= param;
  }
  /**
   * Validates that the field value length is within a specified range.
   * @return true if blank or length within range
   */
  function rangeLength({ blank, length, param }) {
    return blank || (length >= param[0] && length <= param[1]);
  }
  /**
   * Validates that the field value is greater than or equal to a minimum value.
   * @return true if blank or value meets minimum
   */
  function min({ blank, value, param }) {
    return blank || value >= param;
  }
  /**
   * Validates that the field value is less than or equal to a maximum value.
   * @return true if blank or value within maximum
   */
  function max({ blank, value, param }) {
    return blank || value <= param;
  }
  /**
   * Validates that the field value is within a specified numeric range.
   * @return true if blank or value within range
   */
  function range({ blank, value, param }) {
    if (blank) {
      return true;
    }
    return value >= param[0] && value <= param[1];
  }
  /**
   * Validates that the field value is a valid email address format.
   * @param blank - whether the field is blank
   * @param value - field value
   * @return true if blank or valid email format
   */
  function email({ blank, value }) {
    if (blank) {
      return true;
    }
    const re =
      /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(value);
  }
  /**
   * Validates that the field value is a valid URL format.
   * @param blank - whether the field is blank
   * @param value - field value
   * @return true if blank or valid URL format
   */
  function url({ blank, value }) {
    if (blank) {
      return true;
    }
    const re =
      /^(?:(?:https?|ftp):)?\/\/(?:(?:[^\]\[?\/<~#`!@$^&*()+=}|:";',>{ ]|%[0-9A-Fa-f]{2})+(?::(?:[^\]\[?\/<~#`!@$^&*()+=}|:";',>{ ]|%[0-9A-Fa-f]{2})*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4])|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+[a-z\u00a1-\uffff]{2,}\.?)(?::\d{2,5})?(?:[\/?#]\S*)?$/i;
    return re.test(value);
  }
  /**
   * Validates that the field value is a valid date string
   * @param blank - whether the field is blank
   * @param value - field value
   * @return true if blank or valid date string
   */
  function date({ blank, value }) {
    if (blank) {
      return true;
    }
    return !/Invalid|NaN/.test(new Date(value).toString());
  }
  /**
   * Validates that the field value is a valid ISO date format (YYYY-MM-DD or YYYY/MM/DD).
   * @param blank - whether the field is blank
   * @param value - field value
   * @return true if blank or valid ISO date format
   */
  function dateISO({ blank, value }) {
    if (blank) {
      return true;
    }
    const re = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
    return re.test(value);
  }
  /**
   * Validates that the field value is a valid number (including decimals and comma-separated thousands).
   * @param blank - whether the field is blank
   * @param value - field value
   * @return true if blank or valid number format
   */
  function number({ blank, value }) {
    if (blank) {
      return true;
    }
    const re = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:-?\.\d+)?$/;
    return re.test(value);
  }
  /**
   * Validates that the field value contains only digits (no decimals or special characters).
   * @param blank - whether the field is blank
   * @param value - field value
   * @return true if blank or contains only digits
   */
  function digits({ blank, value }) {
    if (blank) {
      return true;
    }
    return /^\d+$/.test(value);
  }
  /**
   * Validates that the field value equals the value of another field (e.g., password confirmation).
   * @return true if values match
   */
  function equalTo({ value, param }) {
    const target = document.querySelector(param);
    return value === target.value;
  }
  /**
   * Validates that the field value matches a regular expression.
   * @return true if blank or value matches pattern
   */
  function regex({ blank, value, param }) {
    if (blank) {
      return true;
    }
    const match = new RegExp(param).exec(value);
    return !!match && match.index === 0 && match[0].length === value.length;
  }
  /**
   * Validates that the field value contains at least a minimum number of non-alphanumeric characters.
   * Used for password strength validation.
   * @return true if blank or value has enough non-alphanumeric characters
   */
  function nonAlphaMin({ blank, value, param }) {
    if (blank || !param) {
      return true;
    }
    const match = value.match(/\W/g);
    return !!match && match.length >= param;
  }
  /**
   * Validates that the field value matches a credit card number.
   * based on https://en.wikipedia.org/wiki/Luhn_algorithm
   * @return true if blank or value is a valid credit card number
   */
  function creditCard({ blank, value }) {
    if (blank) {
      return true;
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

  /**
   * Gets all validation rules for an element from multiple sources.
   * Merges rules from CSS classes, HTML attributes, data attributes, and programmatic settings.
   * @param element - form element to get rules for
   * @param settings - validator rule settings
   * @return {Object} - object containing all validation rules with the required rule first
   */
  function getRules(element, settings) {
    // If nothing is selected, return empty object; can't chain anyway
    if (element == null || element.form == null) {
      return {};
    }
    let data = normalizeRules(
      Object.assign(
        Object.assign(
          Object.assign(
            Object.assign({}, classRules(element)),
            attributeRules(element),
          ),
          dataRules(element),
        ),
        staticRules(element, settings),
      ),
    );
    // Make sure required is at front
    if (data.required) {
      const param = data.required;
      delete data.required;
      data = Object.assign({ required: param }, data);
    }
    return data;
  }
  /**
   * Default mapping of CSS class names to validation rules.
   * Allows class-based rule declaration like class="required email".
   */
  const classRuleSettings = {
    required: { required: true },
    email: { email: true },
    url: { url: true },
    date: { date: true },
    dateISO: { dateISO: true },
    number: { number: true },
    digits: { digits: true },
    creditcard: { creditcard: true },
  };
  /**
   * Adds or updates validation rules for a CSS class name.
   * @param className - class name to associate with rules
   */
  function addClassRule(className) {
    classRuleSettings[className] = normalizeRule(className);
  }
  /**
   * Normalizes and processes validation rules for an element.
   * Removes false rules, evaluates function parameters, and converts string/number values.
   * @param rules - raw validation rules object
   * @return normalized rules object
   */
  function normalizeRules(rules) {
    Object.entries(rules).forEach(([key, value]) => {
      // Ignore rule when param is explicitly false, eg. required:false
      if (value === false) {
        delete rules[key];
        return;
      }
      if (typeof value === 'object' && 'param' in value && value.param) {
        rules[key] = value.param;
      }
    });
    // Clean number parameters
    ['minlength', 'maxlength'].forEach((ruleKey) => {
      if (rules[ruleKey]) {
        rules[ruleKey] = Number(rules[ruleKey]);
      }
    });
    ['rangelength', 'range'].forEach((ruleKey) => {
      if (rules[ruleKey]) {
        if (Array.isArray(rules[ruleKey])) {
          rules[ruleKey] = [rules[ruleKey][0], rules[ruleKey][1]].map(Number);
        } else {
          const parts = rules[ruleKey]
            .toString()
            .replace(/[\[\]]/g, '')
            .split(/[\s,]+/);
          rules[ruleKey] = [parts[0], parts[1]].map(Number);
        }
      }
    });
    return rules;
  }
  /**
   * Extracts validation rules from an element's CSS classes.
   * @param element - element to extract rules from
   * @return validation rules derived from CSS classes
   */
  function classRules(element) {
    let rules = {};
    const classes = element.getAttribute('class');
    if (classes) {
      classes.split(' ').forEach((className) => {
        if (className in classRuleSettings) {
          rules = Object.assign(
            Object.assign({}, rules),
            classRuleSettings[className],
          );
        }
      });
    }
    return rules;
  }
  /**
   * Extracts validation rules from HTML attributes (required, minlength, etc.).
   * @param element - element to extract rules from
   * @return validation rules derived from HTML attributes
   */
  function attributeRules(element) {
    const rules = {};
    const type = element.type;
    for (const method of store$1.keys()) {
      let value = element.getAttribute(method);
      // Support for <input required> in both html5 and older browsers
      if (method === 'required') {
        // Some browsers return an empty string for the required attribute
        // and non-HTML5 browsers might have required="" markup
        if (value === '') {
          value = true;
        }
        // Force non-HTML5 browsers to return bool
        value = !!value;
      }
      normalizeAttributeRule(rules, type, method, value);
    }
    // 'maxlength' may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs
    if (
      rules.maxlength &&
      /-1|2147483647|524288/.test(rules.maxlength.toString())
    ) {
      delete rules.maxlength;
    }
    return rules;
  }
  /**
   * Extracts validation rules from data attributes (data-rule-required, etc.).
   * @param element - element to extract rules from
   * @return validation rules derived from data attributes
   */
  function dataRules(element) {
    var _a;
    const rules = {};
    const type = element.type;
    for (const method of store$1.keys()) {
      const datasetKey =
        'rule' +
        method.charAt(0).toUpperCase() +
        method.substring(1).toLowerCase();
      let value =
        (_a = element.dataset[datasetKey]) !== null && _a !== void 0
          ? _a
          : null;
      // Cast empty attributes like `data-rule-required` to `true`
      if (value === '' || value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
      normalizeAttributeRule(rules, type, method, value);
    }
    return rules;
  }
  /**
   * Gets validation rules defined programmatically in validator settings.
   * @param element - element to get rules for
   * @param settings - Validator rule settings
   * @return validation rules from validator settings
   */
  function staticRules(element, settings) {
    if (!settings || !settings[element.name]) {
      return {};
    }
    return normalizeRule(settings[element.name]) || {};
  }
  /**
   * Normalizes a single attribute rule and adds it to the rules object.
   * Handles type coercion and special cases for different input types.
   * @param rules - rules object to add the rule to
   * @param type - input type attribute value
   * @param method - validation method name
   * @param value - attribute value
   */
  function normalizeAttributeRule(rules, type, method, value) {
    // Convert the value to a number for number inputs, and for text for backwards compatability
    // allows type="date" and others to be compared as strings
    if (
      /min|max|step/.test(method) &&
      (type === null || /number|range|text/.test(type)) &&
      value !== null
    ) {
      value = Number(value);
    }
    if (value || value === 0) {
      rules[method] = value;
    } else if (type === method && type !== 'range') {
      // Exception: the jquery validate 'range' method
      // does not test for the html5 'range' type
      rules[type === 'date' ? 'dateISO' : method] = true;
    }
  }
  /**
   * Converts string-based rule declarations to rule objects.
   * Transforms "required email" to {required: true, email: true}.
   * @param data - rule string or object
   * @return normalized rule object
   */
  function normalizeRule(data) {
    if (typeof data !== 'string') {
      return data;
    }
    const transformed = {};
    data.split(/\s/).forEach((token) => {
      transformed[token] = true;
    });
    return transformed;
  }

  /**
   * Public API for accessing and managing error messages.
   */
  const store = new ObjectStore({
    required: 'This field is required.',
    email: 'Please enter a valid email address.',
    url: 'Please enter a valid URL.',
    date: 'Please enter a valid date.',
    dateISO: 'Please enter a valid date (ISO).',
    number: 'Please enter a valid number.',
    digits: 'Please enter only digits.',
    equalTo: 'Please enter the same value again.',
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
  function getMessage(element, rule, ignoreTitle, customMessage) {
    let message = [
      customMessage,
      customDataMessage(element, rule.method),
      (!ignoreTitle && element.title) || undefined,
      store.get(rule.method),
      `<strong>Warning: No message defined for ${element.name}</strong>`,
    ].find((x) => x !== undefined);
    const regex = /\$?\{(\d+)}/g;
    if (/\$?\{(\d+)}/g.test(message)) {
      return format(message.replace(regex, '{$1}'), rule.parameters);
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
  function customDataMessage(element, method) {
    const dataSetKey =
      'msg' +
      method.charAt(0).toUpperCase() +
      method.substring(1).toLowerCase();
    if (!(element === null || element === void 0 ? void 0 : element.dataset)) {
      return;
    }
    return element.dataset[dataSetKey] || element.dataset['msg'];
  }

  const validatorStore = new WeakMap();

  /**
   * CSS selectors for different types of form elements that should receive validation events
   */
  const EVENT_TARGETS = {
    FOCUS_TARGETS: [
      "[type='text']",
      "[type='password']",
      "[type='file']",
      'select',
      'textarea',
      "[type='number']",
      "[type='search']",
      "[type='tel']",
      "[type='url']",
      "[type='email']",
      "[type='datetime']",
      "[type='date']",
      "[type='month']",
      "[type='week']",
      "[type='time']",
      "[type='datetime-local']",
      "[type='range']",
      "[type='color']",
      "[type='radio']",
      "[type='checkbox']",
      'button',
      "input[type='button']",
    ],
    CLICK_TARGETS: ['select', 'option', "[type='radio']", "[type='checkbox']"],
  };
  /**
   * Manages event delegation for form validation.
   * Handles attaching and removing event listeners with proper delegation logic.
   */
  class FormEventManager {
    constructor(
      form,
      settings,
      validateCallback,
      focusInvalidCallback,
      shouldIgnoreElement,
    ) {
      this.form = form;
      this.settings = settings;
      this.validateCallback = validateCallback;
      this.focusInvalidCallback = focusInvalidCallback;
      this.shouldIgnoreElement = shouldIgnoreElement;
      this.boundEventHandlers = {
        onFocusIn: null,
        onFocusOut: null,
        onKeyUp: null,
        onClick: null,
      };
    }
    /**
     * Attaches all validation event listeners to the form
     */
    attachEventHandlers() {
      this.boundEventHandlers.onFocusIn = this.createDelegate(
        EVENT_TARGETS.FOCUS_TARGETS,
        this.settings.onfocusin,
      );
      this.boundEventHandlers.onFocusOut = this.createDelegate(
        EVENT_TARGETS.FOCUS_TARGETS,
        this.settings.onfocusout,
      );
      this.boundEventHandlers.onKeyUp = this.createDelegate(
        EVENT_TARGETS.FOCUS_TARGETS,
        this.settings.onkeyup,
      );
      this.boundEventHandlers.onClick = this.createDelegate(
        EVENT_TARGETS.CLICK_TARGETS,
        this.settings.onclick,
      );
      this.form.addEventListener('focusin', this.boundEventHandlers.onFocusIn);
      this.form.addEventListener(
        'focusout',
        this.boundEventHandlers.onFocusOut,
      );
      this.form.addEventListener('keyup', this.boundEventHandlers.onKeyUp);
      this.form.addEventListener('click', this.boundEventHandlers.onClick);
      if (this.settings.onsubmit) {
        this.form.addEventListener('submit', (e) => this.handleSubmitForm(e));
      }
      const invalidHandler = this.settings.invalidHandler;
      if (invalidHandler) {
        this.form.addEventListener('invalid-form', (e) => {
          if (!this.isCustomEvent(e)) {
            return;
          }
          invalidHandler(e);
        });
      }
    }
    triggerInvalidForm(errorList) {
      const event = new CustomEvent('invalid-form', {
        detail: errorList,
        cancelable: true,
      });
      this.form.dispatchEvent(event);
    }
    isCustomEvent(event) {
      return 'detail' in event;
    }
    handleSubmitForm(e) {
      if (this.settings.debug) {
        e.preventDefault();
      }
      const isValid = this.validateCallback();
      if (!isValid) {
        this.focusInvalidCallback();
        e.preventDefault();
        e.stopPropagation();
      }
    }
    /**
     * Removes all validation event listeners from the form
     */
    detachEventHandlers() {
      if (this.boundEventHandlers.onFocusIn) {
        this.form.removeEventListener(
          'focusin',
          this.boundEventHandlers.onFocusIn,
        );
      }
      if (this.boundEventHandlers.onFocusOut) {
        this.form.removeEventListener(
          'focusout',
          this.boundEventHandlers.onFocusOut,
        );
      }
      if (this.boundEventHandlers.onKeyUp) {
        this.form.removeEventListener('keyup', this.boundEventHandlers.onKeyUp);
      }
      if (this.boundEventHandlers.onClick) {
        this.form.removeEventListener('click', this.boundEventHandlers.onClick);
      }
      // Clear references
      this.boundEventHandlers.onFocusIn = null;
      this.boundEventHandlers.onFocusOut = null;
      this.boundEventHandlers.onKeyUp = null;
      this.boundEventHandlers.onClick = null;
    }
    /**
     * Creates a delegated event handler for the specified targets and handler
     */
    createDelegate(targets, handler) {
      return (event) => {
        // Skip if handler is disabled (boolean false)
        if (typeof handler === 'boolean') {
          return;
        }
        const element = event.target;
        // Check if element matches any of the target selectors
        if (!element.matches(targets.join(', '))) {
          return;
        }
        // Ensure element belongs to the correct form
        if (!this.isElementInForm(element)) {
          return;
        }
        // Check if element should be ignored based on validator settings
        if (this.shouldIgnoreElement(element)) {
          return;
        }
        // Call the handler with the element and event
        handler(element, event);
      };
    }
    /**
     * Checks if an element belongs to the validator's form
     */
    isElementInForm(element) {
      const elementForm = element.form;
      return this.form === elementForm;
    }
  }

  class Validator {
    /**
     * Initializes a new validator instance for the given form with optional configuration settings.
     * @param form - form element to validate
     * @param options - optional user configuration settings
     */
    constructor(form, options) {
      this.submitted = {};
      this.invalid = {};
      this.successList = [];
      this.errorList = [];
      this.errorMap = {};
      this.toShow = [];
      this.toHide = [];
      this.currentElements = [];
      this.labelContainer = null;
      this.containers = [];
      this.lastActive = null;
      /** normalized rules */
      this.rules = {};
      this.settings = {
        ignore: ':hidden',
        errorClass: 'error',
        validClass: 'valid',
        errorElement: 'label',
        wrapper: null,
        errorLabelContainer: null,
        errorContainer: null,
        onfocusin: this.onFocusIn,
        onfocusout: this.onFocusOut,
        onkeyup: this.onKeyUp,
        onclick: this.onClick,
        highlight: this.highlight,
        unhighlight: this.unhighlight,
        errorPlacement: null,
        focusCleanup: false,
        rules: {},
        messages: {},
        escapeHtml: false,
        showErrors: null,
        ignoreTitle: false,
        success: null,
        onsubmit: true,
        debug: false,
        invalidHandler: null,
      };
      this.currentForm = form;
      this.settings = Object.assign(Object.assign({}, this.settings), options);
      this.normalizeSettings();
      this.init();
    }
    /**
     * Normalizes Validator settings.
     * Currently, this only binds function settings to validator instance.
     */
    normalizeSettings() {
      // bind function settings to this validator instance
      [
        'onfocusin',
        'onfocusout',
        'onkeyup',
        'onclick',
        'highlight',
        'unhighlight',
        'errorPlacement',
        'invalidHandler',
      ].forEach((key) => {
        const setting = this.settings[key];
        if (setting && typeof setting === 'function') {
          this.settings[key] = setting.bind(this);
        }
      });
    }
    /**
     * Sets up DOM references and attaches event handlers to the form.
     */
    init() {
      if (this.settings.errorLabelContainer) {
        this.labelContainer = document.querySelector(
          this.settings.errorLabelContainer,
        );
      }
      this.errorContext = this.labelContainer || this.currentForm;
      const containers = [this.labelContainer];
      if (this.settings.errorContainer) {
        containers.push(document.querySelector(this.settings.errorContainer));
      }
      this.containers = containers.filter(Boolean);
      this.rules = {};
      Object.entries(this.settings.rules).forEach(([key, value]) => {
        this.rules[key] = normalizeRule(value);
      });
      this.eventManager = new FormEventManager(
        this.currentForm,
        this.settings,
        () => this.form(),
        () => this.focusInvalid(),
        (element) => this.shouldIgnore(element),
      );
      this.eventManager.attachEventHandlers();
    }
    /**
     * Resets the validator state.
     */
    reset() {
      this.successList = [];
      this.errorList = [];
      this.errorMap = {};
      this.toShow = [];
      this.toHide = [];
      this.currentElements = [];
    }
    /**
     * Validates all form elements.
     * @return true if the form is valid, false otherwise
     */
    form() {
      this.prepareForm();
      this.currentElements = this.elements();
      for (const element of this.currentElements) {
        this.check(element);
      }
      this.submitted = Object.assign(
        Object.assign({}, this.submitted),
        this.errorMap,
      );
      this.invalid = Object.assign({}, this.errorMap);
      if (!this.valid()) {
        this.eventManager.triggerInvalidForm(this.errorList);
      }
      this.showErrors();
      return this.valid();
    }
    /**
     * Validates a single element within the form.
     * @param element - element to validate
     * @return true if the element is valid, false otherwise
     */
    element(element) {
      const target = this.validationTargetFor(element);
      if (target === undefined) {
        delete this.invalid[element.name];
        return true;
      }
      this.prepareElement(target);
      this.currentElements = [target];
      const result = this.check(target);
      if (result) {
        delete this.invalid[element.name];
      } else {
        this.invalid[target.name] = 'Invalid';
      }
      if (!this.numberOfInvalids()) {
        this.toHide.push(...this.containers);
      }
      this.showErrors();
      // add aria-invalid status for screen readers
      element.setAttribute('aria-invalid', (!result).toString());
      return result;
    }
    prepareElement(element) {
      this.reset();
      this.toHide = this.errorsFor(element);
    }
    /**
     * Returns true if there are currently no validation errors.
     * @return {boolean} - true if there are no validation errors, false otherwise
     */
    valid() {
      return this.size() === 0;
    }
    /**
     * Returns the number of validation errors.
     * @return number of validation errors
     */
    size() {
      return this.errorList.length;
    }
    /**
     * Returns a list of all form elements that need to be validated.
     * @return list of form elements
     */
    elements() {
      const rulesCache = {};
      const selector = 'input, select, textarea';
      const notSelector =
        'input[type="submit"], [type="reset"], [type="image"], [disabled]';
      const elements = Array.from(
        this.currentForm.querySelectorAll(selector),
      ).filter((el) => !el.matches(notSelector) && !this.shouldIgnore(el));
      const formId = this.currentForm.id;
      if (formId) {
        const escapedId = escapeCssMeta(formId);
        const outsideElements = Array.from(
          document.querySelectorAll(selector),
        ).filter(
          (el) =>
            el.matches(`[form="${escapedId}"]`) &&
            !el.matches(notSelector) &&
            !this.shouldIgnore(el),
        );
        elements.push(...outsideElements);
      }
      return elements.filter((el) => {
        const form = el.form;
        if (form !== this.currentForm) {
          return false;
        }
        const name = el.name || el.getAttribute('name');
        if (
          !name ||
          name in rulesCache ||
          !objectLength(getRules(el, this.rules))
        ) {
          return false;
        }
        rulesCache[name] = true;
        return true;
      });
    }
    /**
     * Returns an array of currently valid elements from the last validation.
     * @return list of valid form elements
     */
    validElements() {
      const invalid = this.invalidElements();
      return this.currentElements.filter((el) => !invalid.includes(el));
    }
    /**
     * Returns an array of currently invalid elements from the last validation.
     * @return list of invalid form elements
     */
    invalidElements() {
      return this.errorList.map((e) => e.element);
    }
    /**
     * Runs all validation rules against an element and returns true if valid.
     * @param element - element to validate
     * @return true if the element is valid, false otherwise
     */
    check(element) {
      var _a;
      element = this.validationTargetFor(element);
      const rules = getRules(element, this.rules);
      const elValue = elementValue(element, this.currentForm);
      const value =
        (_a = Array.isArray(elValue) ? elValue[0] : elValue) !== null &&
        _a !== void 0
          ? _a
          : '';
      const values = Array.isArray(elValue) ? elValue : [elValue];
      const length = getValueLength(element, this.currentForm);
      const blank = isBlankElement(element, this.currentForm);
      for (const method in rules) {
        const rule = { method, parameters: rules[method] };
        const methodFunc = store$1.get(method);
        if (!methodFunc) {
          console.warn(`Validation method "${method}" not found. Skipping.`);
          continue;
        }
        try {
          const result = methodFunc({
            blank,
            value: value,
            values,
            length,
            element,
            param: rule.parameters,
          });
          if (!result) {
            this.formatAndAdd(element, rule);
            return false;
          }
        } catch (e) {
          throw e;
        }
      }
      if (objectLength(rules)) {
        this.successList.push(element);
      }
      return true;
    }
    /**
     * Returns all error label elements currently in the DOM.
     * @return array of error label elements
     */
    errors() {
      const errorClass = this.errorClasses.join('.');
      return Array.from(
        this.errorContext.querySelectorAll(
          `${this.settings.errorElement}.${errorClass}`,
        ),
      );
    }
    showErrors(errors) {
      if (errors) {
        // Add items to error list and map
        this.errorMap = Object.assign(Object.assign({}, this.errorMap), errors);
        this.errorList = Object.entries(this.errorMap).map(
          ([name, message]) => ({
            message,
            method: message,
            element: findByName(this.currentForm, name)[0],
          }),
        );
        // Remove items from success list
        this.successList = this.successList.filter((e) => !(e.name in errors));
      }
      if (this.settings.showErrors) {
        return this.settings.showErrors.call(
          this,
          this.errorMap,
          this.errorList,
        );
      }
      return this.defaultShowErrors();
    }
    defaultShowErrors() {
      for (const error of this.errorList) {
        if (typeof this.settings.highlight !== 'boolean') {
          this.settings.highlight(
            error.element,
            this.errorClasses,
            this.validClasses,
          );
        }
        this.showLabel(error.element, error.message);
      }
      if (this.errorList.length) {
        this.toShow = this.toShow.concat(this.containers);
      }
      if (this.settings.success) {
        for (const element of this.successList) {
          this.showLabel(element);
        }
      }
      if (typeof this.settings.unhighlight !== 'boolean') {
        for (const element of this.validElements()) {
          this.settings.unhighlight(
            element,
            this.errorClasses,
            this.validClasses,
          );
        }
      }
      this.toHide = this.toHide.filter((el) => !this.toShow.includes(el));
      this.hideErrors();
      this.addWrapper(...this.toShow).forEach(showElement);
    }
    formatAndAdd(element, rule) {
      const message = this.getMessage(element, rule);
      this.errorList.push({ message, element, method: rule.method });
      this.errorMap[element.name] = message;
      this.submitted[element.name] = message;
    }
    prepareForm() {
      this.reset();
      this.toHide = this.errors().concat(this.containers);
    }
    highlight(element, errorClasses, validClasses) {
      let targets = [element];
      if (element.type === 'radio') {
        targets = findByName(this.currentForm, element.name);
      }
      targets.forEach((el) => {
        el.classList.add(...errorClasses);
        el.classList.remove(...validClasses);
      });
    }
    unhighlight(element, errorClasses, validClasses) {
      let targets = [element];
      if (element.type === 'radio') {
        targets = findByName(this.currentForm, element.name);
      }
      targets.forEach((el) => {
        el.classList.remove(...errorClasses);
        el.classList.add(...validClasses);
      });
    }
    onFocusIn(element) {
      this.lastActive = element;
      if (this.settings.focusCleanup) {
        if (typeof this.settings.unhighlight !== 'boolean') {
          this.settings.unhighlight(
            element,
            this.errorClasses,
            this.validClasses,
          );
        }
        this.hideErrors(element);
      }
    }
    onFocusOut(element) {
      if (isCheckableElement(element)) {
        return;
      }
      if (
        !(element.name in this.submitted) &&
        isBlankElement(element, this.currentForm)
      ) {
        return;
      }
      this.element(element);
    }
    onKeyUp(element, event) {
      const keyboardEvent = event;
      if (
        keyboardEvent.which === 9 &&
        elementValue(element, this.currentForm) === ''
      ) {
        return;
      }
      // Avoid revalidate the field when pressing one of the following keys
      // Shift       => 16
      // Ctrl        => 17
      // Alt         => 18
      // Caps lock   => 20
      // End         => 35
      // Home        => 36
      // Left arrow  => 37
      // Up arrow    => 38
      // Right arrow => 39
      // Down arrow  => 40
      // Insert      => 45
      // Num lock    => 144
      // AltGr key   => 225
      const excludedKeys = [
        16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225,
      ];
      if (excludedKeys.includes(keyboardEvent.keyCode)) {
        return;
      }
      if (
        !(element.name in this.submitted) &&
        !(element.name in this.invalid)
      ) {
        return;
      }
      this.element(element);
    }
    onClick(element) {
      // Click on selects, radiobuttons and checkboxes
      if (element.name in this.submitted) {
        this.element(element);
      }
      // Or option elements, check parent select in that case
      else if (element.parentNode && element.parentElement) {
        const name = element.parentElement.getAttribute('name');
        if (name && name in this.submitted) {
          this.element(element.parentNode);
        }
      }
    }
    hideErrors(element) {
      // we're either hiding all errors, or just the errors for a specific element
      let targets = this.toHide;
      if (element) {
        targets = this.errorsFor(element);
      }
      for (const el of targets) {
        if (!this.containers.includes(el)) {
          el.innerText = '';
        }
        this.addWrapper(el).forEach(hideElement);
      }
    }
    addWrapper(...elements) {
      const result = Array.isArray(elements) ? elements : [elements];
      if (!this.settings.wrapper) {
        return result;
      }
      const wrappers = result
        .map((el) => el.parentElement)
        .filter((el) => el && el.matches(this.settings.wrapper));
      result.push(...wrappers);
      return result;
    }
    showLabel(element, message) {
      let errors = this.errorsFor(element);
      const elementID = idOrName(element);
      const describedBy = element.getAttribute('aria-describedby');
      if (errors.length) {
        // Non-label error exists but is not currently associated with element via aria-describedby
        const labelSelector = `label[for='${escapeCssMeta(elementID)}']`;
        const nonLabelExists = errors
          .map((e) => e.closest(labelSelector))
          .every((e) => e === null);
        const noDescriberAssociation = () => {
          var _a, _b;
          if (describedBy === null) {
            return true;
          }
          const firstErrorId =
            (_b =
              (_a = errors[0]) === null || _a === void 0
                ? void 0
                : _a.getAttribute('id')) !== null && _b !== void 0
              ? _b
              : null;
          if (firstErrorId === null) {
            return true;
          }
          const split = describedBy.split(' ');
          return split.indexOf(firstErrorId) === -1;
        };
        if (nonLabelExists && noDescriberAssociation()) {
          const firstErrorId = errors[0].getAttribute('id');
          this.addErrorAriaDescribedBy(element, firstErrorId);
        }
        // Refresh error/success class
        errors.forEach((el) => {
          el.classList.remove(this.settings.validClass);
          el.classList.add(...this.errorClasses);
          if (this.settings.escapeHtml) {
            el.innerText = message || '';
          } else {
            el.innerHTML = message || '';
          }
        });
      } else {
        const newError = document.createElement(this.settings.errorElement);
        newError.setAttribute('id', `${elementID}-error`);
        newError.classList.add(...this.errorClasses);
        if (this.settings.escapeHtml) {
          newError.innerText = message || '';
        } else {
          newError.innerHTML = message || '';
        }
        // Maintain reference to the element(s) to be placed into the DOM
        let insert = newError;
        if (this.settings.wrapper) {
          const wrapper = document.createElement(this.settings.wrapper);
          wrapper.appendChild(newError);
          insert = wrapper;
        }
        if (this.labelContainer) {
          this.labelContainer.appendChild(insert);
        } else if (this.settings.errorPlacement) {
          this.settings.errorPlacement(insert, element);
        } else {
          element.after(insert);
        }
        const labelSelector = `label[for='${escapeCssMeta(elementID)}']`;
        const notLabelChild = errors
          .map((e) => e.parentElement)
          .every((e) => e !== null && !e.matches(labelSelector));
        if (newError.matches('label')) {
          newError.setAttribute('for', elementID);
        } else if (notLabelChild) {
          this.addErrorAriaDescribedBy(element, newError.getAttribute('id'));
        }
        errors = [newError];
      }
      if (!message && this.settings.success) {
        errors.forEach((e) => (e.innerText = ''));
        const successSetting = this.settings.success;
        if (typeof successSetting === 'string') {
          errors.forEach((e) => e.classList.add(successSetting));
        } else {
          successSetting(errors, element);
        }
      }
      this.toShow.push(...errors);
    }
    addErrorAriaDescribedBy(element, errorId) {
      let describedBy = element.getAttribute('aria-describedby');
      if (!describedBy) {
        describedBy = errorId;
      } else if (
        !describedBy.match(new RegExp(`\\b${escapeCssMeta(errorId)}\\b`))
      ) {
        describedBy += ` ${errorId}`;
      }
      element.setAttribute('aria-describedby', describedBy);
    }
    errorsFor(element) {
      const name = escapeCssMeta(idOrName(element));
      const describer = element.getAttribute('aria-describedby');
      let selector = `label[for='${name}'], label[for='${name}'] *`;
      if (describer) {
        const escapedDescriber = escapeCssMeta(describer).replace(
          /\s+/g,
          ', #',
        );
        selector += `, #${escapedDescriber}`;
      }
      return this.errors().filter((el) => el.matches(selector));
    }
    numberOfInvalids() {
      return objectLength(this.invalid);
    }
    destroy() {
      this.resetForm();
      validatorStore.delete(this.currentForm);
      this.eventManager.detachEventHandlers();
    }
    resetForm() {
      this.invalid = {};
      this.submitted = {};
      this.prepareForm();
      this.hideErrors();
      this.elements().forEach((el) => el.removeAttribute('aria-invalid'));
      this.resetElements();
    }
    resetElements() {
      if (this.settings.unhighlight) {
        for (const element of this.elements()) {
          this.unhighlight(element, this.errorClasses, []);
          findByName(this.currentForm, element.name).forEach((el) =>
            el.classList.remove(...this.validClasses),
          );
        }
      } else {
        this.elements().forEach((el) => {
          el.classList.remove(...this.errorClasses);
          el.classList.remove(...this.validClasses);
        });
      }
    }
    validationTargetFor(element) {
      let targets = [element];
      if (isCheckableElement(element)) {
        targets = findByName(this.currentForm, element.name);
      }
      return targets.filter((t) => !this.shouldIgnore(t))[0];
    }
    /**
     * Returns true if the element should be skipped from receiving validation.
     * @param element - element to check
     * @return true if the element should be skipped, false otherwise
     */
    shouldIgnore(element) {
      if (!this.settings.ignore) {
        return false;
      }
      if (this.settings.ignore === ':hidden') {
        return !isVisible(element);
      }
      return element.matches(this.settings.ignore);
    }
    getMessage(element, rule) {
      if (typeof rule === 'string') {
        rule = { method: rule };
      }
      let customMessage;
      const msgSettings = this.settings.messages[element.name];
      if (msgSettings && typeof msgSettings === 'string') {
        customMessage = msgSettings;
      } else if (msgSettings && typeof msgSettings === 'object') {
        customMessage = msgSettings[rule.method];
      }
      return getMessage.call(
        this,
        element,
        rule,
        this.settings.ignoreTitle,
        customMessage,
      );
    }
    focusInvalid() {
      const lastActive = this.findLastActive();
      const firstErrorElement = this.errorList.length
        ? this.errorList[0].element
        : null;
      const el = lastActive || firstErrorElement;
      if (!el || !isVisible(el)) {
        return;
      }
      // Focus the element
      el.focus();
      // Manually dispatch "focusin"
      const focusInEvent = new Event('focusin', { bubbles: true });
      el.dispatchEvent(focusInEvent);
    }
    findLastActive() {
      const lastActive = this.lastActive;
      if (!lastActive) return;
      const matches = this.errorList.filter(
        (n) => n.element.name === lastActive.name,
      );
      return matches.length === 1 ? lastActive : undefined;
    }
    get errorClasses() {
      return this.settings.errorClass.split(' ').filter(Boolean);
    }
    get validClasses() {
      return this.settings.validClass.split(' ').filter(Boolean);
    }
  }

  /**
   * @fileoverview Core validation library for client-side form validation.
   * Provides programmatic API for validating forms and form elements.
   */
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
  function validate(selector, options) {
    if (!selector) {
      console.warn("No element selected, can't validate.");
      return;
    }
    const element =
      selector instanceof Element ? selector : document.querySelector(selector);
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
   * @param selector - Element(s) to validate:
   * CSS selector, element, or array of elements
   * @returns True if all elements are valid, false otherwise
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
  function valid(selector) {
    var _a, _b;
    let elements = [];
    if (typeof selector === 'string') {
      elements = Array.from(document.querySelectorAll(selector));
    } else if (selector instanceof HTMLElement) {
      elements = [selector];
    } else if (Array.isArray(selector)) {
      elements = selector;
    }
    if (elements[0].matches('form')) {
      return (_b =
        (_a = validate(elements[0])) === null || _a === void 0
          ? void 0
          : _a.form()) !== null && _b !== void 0
        ? _b
        : false;
    }
    const errorList = [];
    let valid = true;
    const validator = validate(elements[0].form);
    if (!validator) {
      return false;
    }
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
   * @param selector - CSS selector string or HTMLElement
   * @returns Object containing validation rules for the element
   * @example
   * // Get rules for an input
   * const emailRules = dv.rules('#email');
   * console.log(emailRules); // { required: true, email: true }
   */
  function rules(selector) {
    const element =
      selector instanceof HTMLElement
        ? selector
        : document.querySelector(selector);
    const validator = validate(element.form);
    if (!validator) {
      return {};
    }
    return getRules(element, validator.rules);
  }
  /**
   * Adds a custom validation method.
   * The method can be used in validation rules by its name.
   *
   * @param name - Name of the validation method
   * @param method - Validation function that returns true if valid
   * @param message - Default error message for this validation method
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
  function addMethod(name, method, message) {
    store$1.set(name, method);
    if (message) {
      store.set(name, message);
    }
    if (method.length < 3) {
      addClassRule(name);
    }
  }
  /**
   * Default export containing all validation functions and stores.
   * @namespace
   */
  var index = {
    validate,
    valid,
    rules,
    addMethod,
    messages: store,
    methods: store$1,
  };

  exports.addMethod = addMethod;
  exports.default = index;
  exports.messages = store;
  exports.methods = store$1;
  exports.rules = rules;
  exports.valid = valid;
  exports.validate = validate;

  Object.defineProperty(exports, '__esModule', { value: true });
});
//# sourceMappingURL=dv.umd.js.map
