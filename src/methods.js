import { getLength, isCheckableElement } from './helpers.js';

export default {
  "required": (value, element, param) => required(value, element),
};

function required(value, element) {
  if (element.nodeName.toLowerCase() === "select") {
    const selected = [...element.selectedOptions].map(o => o.value);
    return selected && selected.length > 0;
  }

  if (isCheckableElement(element)) {
    return getLength(value, element) > 0;
  }

  return value !== undefined && value !== null && value.length > 0;
}
