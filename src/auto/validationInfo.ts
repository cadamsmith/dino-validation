import { onError, onErrors, onReset, onSuccess } from './callbacks';
import * as dv from '../index';

const validationInfoStore = new WeakMap();

/**
 * Gets or creates validation info for a form.
 * Stores validator options, event handlers, and provides methods to attach validation.
 * @param {HTMLFormElement} form - The form element
 * @return {Object} - Validation info object with options, attachValidation(), and validate() methods
 */
export function validationInfo(form: any) {
  const storedInfo = validationInfoStore.get(form);
  if (storedInfo) {
    return storedInfo;
  }

  const options = {
    errorClass: 'input-validation-error',
    errorElement: 'span',
    messages: {},
    rules: {},
    errorPlacement: function (error: any, element: any) {
      onError.call(form, error, element);
    },
    invalidHandler: function (event: any, validator: any) {
      onErrors.call(form, event, validator);
    },
    success: function (error: any) {
      onSuccess.call(form, error);
    },
  };

  const onResetProxy = onReset.bind(form);

  const info = {
    options,
    attachValidation: function () {
      form.removeEventListener('reset', onResetProxy);
      form.addEventListener('reset', onResetProxy);

      dv.validate(form, this.options);
    },
    validate: function () {
      dv.validate(form);
      return dv.valid(form);
    },
  };

  validationInfoStore.set(form, info);
  return info;
}
