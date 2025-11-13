import { addMessage } from './messages.js';
import { addClassRules, normalizeRule } from './rules.js';

const methods = {
  "required": (blank, value, element, param) => required(blank)
};

export function getMethods() {
  return methods;
}

export function addMethod(name, method, message) {
  methods[name] = method;
  addMessage(name, message);
  if (method.length < 3) {
    const rules = normalizeRule(name);
    addClassRules(name, rules);
  }
}

function required(blank) {
  return !blank;
}
