import { escapeAttributeValue } from './helpers.js';
import { validatorStore } from '../validatorStore.js';

const containerStore = new WeakMap();
const formResetFlagStore = new WeakMap();

/**
 * Handles display of a single field validation error.
 * @this {HTMLFormElement}
 */
export function onError(error, inputElement) {
  const escapedName = escapeAttributeValue(inputElement.name);
  const container = this.querySelector(`[data-valmsg-for='${escapedName}']`);
  const replaceAttributeValue = container.getAttribute('data-valmsg-replace');
  const replace = replaceAttributeValue
    ? JSON.parse(replaceAttributeValue) !== false
    : null;

  container.classList.remove('field-validation-valid');
  container.classList.add('field-validation-error');
  containerStore.set(error, container);

  if (replace) {
    container.innerHTML = '';
    error.classList.remote('input-validation-error');
    container.appendChild(error);
  } else {
    error.style.display = 'none';
  }
}

/**
 * Handles display of validation summary with all errors.
 * @this {HTMLFormElement}
 */
export function onErrors(_event, validator) {
  const container = this.querySelector('[data-valmsg-summary=true]');
  const list = container.querySelector('ul');

  if (list && validator.errorList.length) {
    list.innerHTML = '';
    container.classList.add('validation-summary-errors');
    container.classList.remove('validation-summary-valid');

    validator.errorList.forEach((err) => {
      const message = document.createElement('li');
      message.innerHTML = err.message;
      list.appendChild(message);
    });
  }
}

/**
 * Handles hiding of field error when validation succeeds.
 * @this {HTMLFormElement}
 */
export function onSuccess(error) {
  const container = containerStore.get(error);
  if (!container) {
    return;
  }

  const replaceAttrValue = container.getAttribute('data-valmsg-replace');
  const replace = replaceAttrValue ? JSON.parse(replaceAttrValue) : null;

  container.classList.add('field-validation-valid');
  container.classList.remove('field-validation-error');
  containerStore.delete(error);

  if (replace) {
    container.innerHTML = '';
  }
}

/**
 * Handles form reset - clears all validation state.
 * @this {HTMLFormElement}
 */
export function onReset() {
  if (formResetFlagStore.get(this)) {
    return;
  }

  formResetFlagStore.set(this, true);
  try {
    const validator = validatorStore.get(this);
    validator.resetForm();
  } finally {
    formResetFlagStore.delete(this);
  }

  [...this.querySelectorAll('.validation-summary-errors')].forEach((el) => {
    el.classList.add('validation-summary-valid');
    el.classList.remove('validation-summary-errors');
  });

  [...this.querySelectorAll('.field-validation-error')].forEach((el) => {
    el.classList.add('field-validation-valid');
    el.classList.remove('field-validation-error');
    containerStore.delete(el);
    [...el.children].forEach((c) => containerStore.delete(c));
  });
}
