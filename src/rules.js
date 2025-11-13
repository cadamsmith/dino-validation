import methods from './methods.js';
import { validatorStore } from './validatorStore.js';

export function getRules(element) {
  // If nothing is selected, return empty object; can't chain anyway
  if (element == null || element.form == null) {
    return;
  }

  let data = normalizeRules({
    ...classRules(element),
    ...attributeRules(element),
    ...dataRules(element),
    ...staticRules(element)
  }, element);

  // Make sure required is at front
  if (data.required) {
    const param = data.required;
    delete data.required;
    data = { required: param, ...data };
  }

  return data;
}

function normalizeRules(rules, element) {
  Object.entries(rules).forEach(([key, value]) => {
    // Ignore rule when param is explicitly false, eg. required:false
    if (value === false) {
      delete rules[key];
      return;
    }

    if (value.param) {
      rules[key] = value.param !== undefined ? value.param : true;
    }
  });

  // Evaluate parameters
  Object.entries(rules).forEach(([key, value]) => {
    rules[key] = typeof value === "function" ? value(element) : value;
  });

  // Clean number parameters
  ["minlength", "maxlength"].forEach(ruleKey => {
    if (rules[ruleKey]) {
      rules[ruleKey] = Number(rules[ruleKey]);
    }
  });
  ["rangelength", "range"].forEach(ruleKey => {
    if (rules[ruleKey]) {
      if (Array.isArray(rules[ruleKey])) {
        rules[ruleKey] = [rules[ruleKey][0], rules[ruleKey][1]].map(Number);
      }
      else {
        const parts = rules[ruleKey].replace(/[\[\]]/g, "").split(/[\s,]+/);
        rules[ruleKey] = [parts[0], parts[1]].map(Number);
      }
    }
  });

  return rules;
}

function classRules(element) {
  let rules = {};
  const classes = element.getAttribute("class");

  const classRuleSettings = {
    required: { required: true },
    email: { email: true },
    url: { url: true },
    date: { date: true },
    dateISO: { dateISO: true },
    number: { number: true },
    digits: { digits: true },
    creditcard: { creditcard: true }
  };

  if (classes) {
    classes.split(" ").forEach(className => {
      if (className in classRuleSettings) {
        rules = { ...rules, ...classRuleSettings[className] };
      }
    });
  }

  return rules;
}

function attributeRules(element) {
  return {};
}

function dataRules(element) {
  const rules = {};
  const type = element.getAttribute("type");

  for (const method in methods) {
    const datasetKey = "rule" + method.charAt(0).toUpperCase() + method.substring(1).toLowerCase()
    let value = element.dataset[datasetKey];

    // Cast empty attributes like `data-rule-required` to `true`
    if (value === "") {
      value = true;
    }

    normalizeAttributeRule(rules, type, method, value);
  }

  return rules;
}

function staticRules(element) {
  let rules = {};
  const validator = validatorStore.get(element.form);

  if (validator.settings.rules) {
    rules = normalizeRule(validator.settings.rules[element.name]) || {};
  }

  return rules;
}

function normalizeAttributeRule(rules, type, method, value) {
  // Convert the value to a number for number inputs, and for text for backwards compability
  // allows type="date" and others to be compared as strings
  if (/min|max|step/.test(method) && (type === null || /number|range|text/.test(type))) {
    value = Number(value);
  }

  if (value || value === 0) {
    rules[method] = value;
  } else if (type === method && type !== "range") {
    // Exception: the jquery validate 'range' method
    // does not test for the html5 'range' type
    rules[type === "date" ? "dateISO" : method] = true;
  }
}

function normalizeRule(data) {
  if (typeof data !== "string") {
    return data;
  }

  const transformed = {};
  data.split(/\s/).forEach(token => {
    transformed[token] = true;
  });

  return transformed;
}
