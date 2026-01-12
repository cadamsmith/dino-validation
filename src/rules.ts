import { store as methodStore } from './methods';
import { FormControlElement, ValidationRuleset } from './types';

/**
 * Gets all validation rules for an element from multiple sources.
 * Merges rules from CSS classes, HTML attributes, data attributes, and programmatic settings.
 * @param element - form element to get rules for
 * @param settings - validator rule settings
 * @return {Object} - object containing all validation rules with the required rule first
 */
export function getRules(
  element: FormControlElement,
  settings: Record<string, ValidationRuleset>,
): ValidationRuleset {
  // If nothing is selected, return empty object; can't chain anyway
  if (element == null || element.form == null) {
    return {};
  }

  let data = normalizeRules({
    ...classRules(element),
    ...attributeRules(element),
    ...dataRules(element),
    ...staticRules(element, settings),
  });

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
const classRuleSettings: Record<string, ValidationRuleset> = {
  required: { required: true },
  email: { email: true },
  url: { url: true },
  date: { date: true },
  number: { number: true },
  digits: { digits: true },
  creditcard: { creditcard: true },
};

/**
 * Adds or updates validation rules for a CSS class name.
 * @param className - class name to associate with rules
 */
export function addClassRule(className: string): void {
  classRuleSettings[className] = normalizeRule(className);
}

/**
 * Normalizes and processes validation rules for an element.
 * Removes false rules, evaluates function parameters, and converts string/number values.
 * @param rules - raw validation rules object
 * @return normalized rules object
 */
function normalizeRules(rules: ValidationRuleset): ValidationRuleset {
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
        rules[ruleKey] = [rules[ruleKey][0], rules[ruleKey][1]].map(Number) as [
          number,
          number,
        ];
      } else {
        const parts = rules[ruleKey]
          .toString()
          .replace(/[\[\]]/g, '')
          .split(/[\s,]+/);
        rules[ruleKey] = [parts[0], parts[1]].map(Number) as [number, number];
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
function classRules(element: FormControlElement): ValidationRuleset {
  let rules = {};
  const classes = element.getAttribute('class');

  if (classes) {
    classes
      .trim()
      .split(/\s/)
      .map((className) => className.toLowerCase())
      .forEach((className: string) => {
        if (className in classRuleSettings) {
          rules = { ...rules, ...classRuleSettings[className] };
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
function attributeRules(element: FormControlElement): ValidationRuleset {
  const rules: ValidationRuleset = {};
  const type = element.type;

  for (const method of methodStore.keys()) {
    let value: string | null | boolean = element.getAttribute(method);

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
function dataRules(element: FormControlElement): ValidationRuleset {
  const rules = {};
  const type = element.type;

  for (const method of methodStore.keys()) {
    const datasetKey =
      'rule' +
      method.charAt(0).toUpperCase() +
      method.substring(1).toLowerCase();
    let value: string | null | boolean = element.dataset[datasetKey] ?? null;

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
export function staticRules(
  element: FormControlElement,
  settings: Record<string, ValidationRuleset>,
): ValidationRuleset {
  if (!settings || !settings[element.name]) {
    return {};
  }

  return normalizeRule(settings[element.name]!) || {};
}

/**
 * Normalizes a single attribute rule and adds it to the rules object.
 * Handles type coercion and special cases for different input types.
 * @param rules - rules object to add the rule to
 * @param type - input type attribute value
 * @param method - validation method name
 * @param value - attribute value
 */
function normalizeAttributeRule(
  rules: ValidationRuleset,
  type: string,
  method: string,
  value: string | number | boolean | null,
): void {
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
    rules[method] = true;
  }
}

/**
 * Converts string-based rule declarations to rule objects.
 * Transforms "required email" to {required: true, email: true}.
 * @param data - rule string or object
 * @return normalized rule object
 */
export function normalizeRule(
  data: ValidationRuleset | string,
): ValidationRuleset {
  if (typeof data !== 'string') {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key.toLowerCase(), value]),
    );
  }

  const transformed: ValidationRuleset = {};
  data
    .trim()
    .split(/\s/)
    .map((token) => token.toLowerCase())
    .forEach((token) => {
      transformed[token] = true;
    });

  return transformed;
}
