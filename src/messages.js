import { findDefined, format } from './helpers.js';

const messages = {
  required: 'This field is required.',
  remote: 'Please fix this field.',
  email: 'Please enter a valid email address.',
  url: 'Please enter a valid URL.',
  date: 'Please enter a valid date.',
  dateISO: 'Please enter a valid date (ISO).',
  number: 'Please enter a valid number.',
  digits: 'Please enter only digits.',
  equalTo: 'Please enter the same value again.',
  maxlength: format('Please enter no more than {0} characters.'),
  minlength: format('Please enter at least {0} characters.'),
  rangelength: format(
    'Please enter a value between {0} and {1} characters long.',
  ),
  range: format('Please enter a value between {0} and {1}.'),
  max: format('Please enter a value less than or equal to {0}.'),
  min: format('Please enter a value greater than or equal to {0}.'),
  step: format('Please enter a multiple of {0}.'),
};

export const store = {
  keys: function() {
    return Object.keys(messages);
  },
  get: function(key) {
    return messages[key];
  },
  set: function(key, value) {
    messages[key] = value;
  }
};

export function getMessage(element, rule) {
  if (typeof rule === "string") {
    rule = { method: rule };
  }

  let message = findDefined(
    customDataMessage(element, rule.method),
    element.title || undefined,
    store.get(rule.method),
    `<strong>Warning: No message defined for ${element.name}</strong>`
  );

  const regex = /\$?\{(\d+)}/g;

  if (typeof message === "function") {
    message = message(rule.parameters, element);
  }
  else if (regex.test(message)) {
    message = format(message.replace(regex, "{$1}"), rule.parameters);
  }

  return message;
}

// Return the custom message for the given element and validation method
// specified in the element's HTML5 data attribute
// return the generic message if present and no method specific message is present
function customDataMessage(element, method) {
  const dataSetKey = "msg" + method.charAt(0).toUpperCase() + method.substring(1).toLowerCase();

  return element.dataset[dataSetKey] || element.dataset["msg"];
}
