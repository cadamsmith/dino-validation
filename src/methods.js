import { setMessage } from './messages.js';
import { addClassRules, normalizeRule } from './rules.js';
import { getLength } from './helpers.js';

const methods = {
  "required": (blank, value, element, param) => required(blank),
  "minlength": (blank, value, element, param) => minLength(blank, value, element, param),
  "maxlength": (blank, value, element, param) => maxLength(blank, value, element, param),
  "rangelength": (blank, value, element, param) => rangeLength(blank, value, element, param),
  "min": (blank, value, element, param) => min(blank, value, element, param),
  "max": (blank, value, element, param) => max(blank, value, element, param),
  "range": (blank, value, element, param) => range(blank, value, element, param),
  "email": (blank, value, element, param) => email(blank, value),
  "url": (blank, value, element, param) => url(blank, value),
  "dateISO": (blank, value, element, param) => dateISO(blank, value),
  "number": (blank, value, element, param) => number(blank, value),
  "digits": (blank, value, element, param) => digits(blank, value),
  "equalTo": (blank, value, element, param) => equalTo(blank, value, element, param)
};

export function getMethods() {
  return methods;
}

export function addMethod(name, method, message) {
  methods[name] = method;
  setMessage(name, message);
  if (method.length < 3) {
    const rules = normalizeRule(name);
    addClassRules(name, rules);
  }
}

function required(blank) {
  return !blank;
}

function minLength(blank, value, element, param) {
  const length = Array.isArray(value) ? value.length : getLength(value, element);
  return blank || length >= param;
}

function maxLength(blank, value, element, param) {
  const length = Array.isArray(value) ? value.length : getLength(value, element);
  return blank || length <= param;
}

function rangeLength(blank, value, element, param) {
  const length = Array.isArray(value) ? value.length : getLength(value, element);
  return blank || (length >= param[0] && length <= param[1]);
}

function min(blank, value, element, param) {
  return blank || value >= param;
}

function max(blank, value, element, param) {
  return blank || value <= param;
}

function range(blank, value, element, param) {
  return blank || (value >= param[0] && value <= param[1]);
}

function email(blank, value) {
  const re = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return blank || re.test(value);
}

function url(blank, value) {
  const re = /^(?:(?:(?:https?|ftp):)?\/\/)(?:(?:[^\]\[?\/<~#`!@$^&*()+=}|:";',>{ ]|%[0-9A-Fa-f]{2})+(?::(?:[^\]\[?\/<~#`!@$^&*()+=}|:";',>{ ]|%[0-9A-Fa-f]{2})*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  return blank || re.test(value);
}

function dateISO(blank, value) {
  const re = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
  return blank || re.test(value);
}

function number(blank, value) {
  const re = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:-?\.\d+)?$/;
  return blank || re.test(value);
}

function digits(blank, value) {
  const re = /^\d+$/;
  return blank || re.test(value);
}

function equalTo(blank, value, element, param) {
  const target = document.querySelector(param);
  return value === target.value;
}
