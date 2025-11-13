export function isVisible(el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

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

export function validationTargetFor(element) {
  let targets = [element];
  if (isCheckableElement(element)) {
    targets = findByName(element.form, element.name);
  }

  return targets.filter(t => isVisible(t))[0];
}

export function findByName(form, name) {
  return [...form.querySelectorAll(`[name='${escapeCssMeta(name)}']`)];
}

export function isCheckableElement(element) {
  return (/radio|checkbox/i).test(element.type);
}

// See https://api.jquery.com/category/selectors/, for CSS
// meta-characters that should be escaped in order to be used with JQuery
// as a literal part of a name/id or any selector.
export function escapeCssMeta(text) {
  if (text === undefined) {
    return "";
  }

  return text.replace(/([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, "\\$1");
}

export function elementValue(element) {
  if (element.type === "radio" || element.type === "checkbox") {
    const first = findByName(element.form, element.name).filter(el => el.matches(":checked"));
    return first?.value;
  }
  else if (element.type === "number" && typeof element.validity !== "undefined") {
    return element.validity.badInput ? "NaN" : element.value;
  }

  if (typeof element.value === "string") {
    return element.value.replace(/\r/g, "");
  }

  return element.value;
}

export function findDefined(...args) {
  for (const arg of args) {
    if (arg !== undefined) {
      return arg;
    }
  }
  return undefined;
}

export function format(source, params) {
  if (arguments.length === 1) {
    return function() {
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
    source = source.replace(new RegExp(`\\{${index}\\}`, "g"), param);
  });

  return source;
}

export function idOrName(element) {
  return (isCheckableElement(element) ? element.name : element.id) || element.name;
}

export function getLength(value, element) {
  const nodeName = element.nodeName.toLowerCase();

  if (nodeName === "select") {
    return element.querySelectorAll("option:checked").length;
  }
  else if (nodeName === "input" && isCheckableElement(element)) {
    return findByName(element.form, element.name).filter(el => el.matches(":checked")).length;
  }

  return value.length;
}
