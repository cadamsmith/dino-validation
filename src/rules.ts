import { validatorStore } from './validatorStore.js';
import { store as methodStore } from './methods.js';

/**
 * Gets all validation rules for an element from multiple sources.
 * Merges rules from CSS classes, HTML attributes, data attributes, and programmatic settings.
 * @param {HTMLElement} element - form element to get rules for
 * @return {Object} - object containing all validation rules with the required rule first
 */
export function getRules(element) {
  // If nothing is selected, return empty object; can't chain anyway
  if (element == null || element.form == null) {
    return;
  }

  let data = normalizeRules(
    {
      ...classRules(element),
      ...attributeRules(element),
      ...dataRules(element),
      ...staticRules(element),
    },
    element,
  );

  // Make sure required is at front
  if (data.required) {
    const param = data.required;
    delete data.required;
    data = { required: param, ...data };
  }

  return data;
}

/**
 * Default mapping of CSS class names to validation rules.
 * Allows class-based rule declaration like class="required email".
 */
let classRuleSettings: Record<string, any> = {
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
 * @param {string|Object} className - class name to associate with rules, or object of className: rules pairs
 * @param {Object} [rules] - validation rules object (only used if className is a string)
 */
export function addClassRules(className, rules) {
  if (typeof className === 'string') {
    classRuleSettings[className] = rules;
  } else {
    classRuleSettings = { ...classRuleSettings, ...className };
  }
}

/**
 * Normalizes and processes validation rules for an element.
 * Removes false rules, evaluates function parameters, and converts string/number values.
 * @param {Object} rules - raw validation rules object
 * @param {HTMLElement} element - element the rules apply to
 * @return {Object} - normalized rules object
 */
function normalizeRules(rules: Record<string, any>, element) {
  Object.entries(rules).forEach(([key, value]) => {
    // Ignore rule when param is explicitly false, eg. required:false
    if (value === false) {
      delete rules[key];
      return;
    }

    if (value.param) {
      rules[key] = value.param;
    }
  });

  // Evaluate parameters
  Object.entries(rules).forEach(([key, value]) => {
    rules[key] = typeof value === 'function' ? value(element) : value;
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
        const parts = rules[ruleKey].replace(/[\[\]]/g, '').split(/[\s,]+/);
        rules[ruleKey] = [parts[0], parts[1]].map(Number);
      }
    }
  });

  return rules;
}

/**
 * Extracts validation rules from an element's CSS classes.
 * @param {HTMLElement} element - element to extract rules from
 * @return {Object} - validation rules derived from CSS classes
 */
function classRules(element) {
  let rules = {};
  const classes = element.getAttribute('class');

  if (classes) {
    classes.split(' ').forEach((className) => {
      if (className in classRuleSettings) {
        rules = { ...rules, ...classRuleSettings[className] };
      }
    });
  }

  return rules;
}

/**
 * Extracts validation rules from HTML attributes (required, minlength, etc.).
 * @param {HTMLElement} element - element to extract rules from
 * @return {Object} - validation rules derived from HTML attributes
 */
function attributeRules(element) {
  const rules: Record<string, any> = {};
  const type = element.getAttribute('type');

  for (const method of methodStore.keys()) {
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
  if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
    delete rules.maxlength;
  }

  return rules;
}

/**
 * Extracts validation rules from data attributes (data-rule-required, etc.).
 * @param {HTMLElement} element - element to extract rules from
 * @return {Object} - validation rules derived from data attributes
 */
function dataRules(element) {
  const rules = {};
  const type = element.getAttribute('type');

  for (const method of methodStore.keys()) {
    const datasetKey =
      'rule' +
      method.charAt(0).toUpperCase() +
      method.substring(1).toLowerCase();
    let value = element.dataset[datasetKey];

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
 * @param {HTMLElement} element - element to get rules for
 * @return {Object} - validation rules from validator settings
 */
export function staticRules(element) {
  let rules = {};
  const validator = validatorStore.get(element.form);

  if (validator.settings.rules) {
    rules = normalizeRule(validator.settings.rules[element.name]) || {};
  }

  return rules;
}

/**
 * Normalizes a single attribute rule and adds it to the rules object.
 * Handles type coercion and special cases for different input types.
 * @param {Object} rules - rules object to add the rule to
 * @param {string} type - input type attribute value
 * @param {string} method - validation method name
 * @param {*} value - attribute value
 */
function normalizeAttributeRule(rules, type, method, value) {
  // Convert the value to a number for number inputs, and for text for backwards compability
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
 * @param {string|Object} data - rule string or object
 * @return {Object} - normalized rule object
 */
export function normalizeRule(data) {
  if (typeof data !== 'string') {
    return data;
  }

  const transformed = {};
  data.split(/\s/).forEach((token) => {
    transformed[token] = true;
  });

  return transformed;
}
