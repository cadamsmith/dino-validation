import adapters from './adapters.js';
import { validationInfo } from './validationInfo.js';

export function parseDocument() {
  const forms = Array.from(document.querySelectorAll('form')).filter(
    (f) => f.querySelector('[data-val=true]') !== null,
  );

  Array.from(document.querySelectorAll('[data-val=true]')).forEach((el) =>
    parseElement(el),
  );

  forms.forEach((f) => {
    const info = validationInfo(f);
    if (info) {
      info.attachValidation();
    }
  });
}

export function parseElement(element: any) {
  const form = element.closest('form');
  // Cannot do client-side validation without a form
  if (!form) {
    return;
  }

  const info = validationInfo(form);
  const rules = (info.options.rules[element.name] = {});
  const messages = (info.options.messages[element.name] = {});

  adapters._.forEach((adapter) => {
    let prefix = `data-val-${adapter.name}`;
    const message = element.getAttribute(prefix);

    if (message === null) {
      return;
    }

    const paramValues: Record<string, any> = {};

    adapter.params.forEach((param: any) => {
      paramValues[param] = element.getAttribute(`${prefix}-${param}`);
    });

    adapter.adapt({
      element,
      form,
      message,
      params: paramValues,
      rules,
      messages,
    });
  });
}
