import adapters from './adapters.js';
import { valid, validate } from '../index.js';
import { onError, onErrors, onReset, onSuccess } from './callbacks.js';

const validationInfoStore = new WeakMap();

/**
 * Gets or creates validation info for a form.
 * Stores validator options, event handlers, and provides methods to attach validation.
 * @param {HTMLFormElement} form - The form element
 * @return {Object} - Validation info object with options, attachValidation(), and validate() methods
 */
function getValidationInfo(form) {
  const storedInfo = validationInfoStore.get(form);
  if (storedInfo) {
    return storedInfo;
  }

  const options = {
    errorClass: "input-validation-error",
    errorElement: "span",
    messages: {},
    rules: {},
    errorPlacement: function(error, element) {
      onError.call(form, error, element);
    },
    invalidHandler: function(event, validator) {
      onErrors.call(form, event, validator);
    },
    success: function(error) {
      onSuccess.call(form, error);
    }
  };

  const onResetProxy = onReset.bind(form);

  const info = {
    options,
    attachValidation: function() {
      form.removeEventListener("reset", onResetProxy);
      form.addEventListener("reset", onResetProxy);

      validate(form, this.options);
    },
    validate: function() {
      validate(form);
      return valid(form);
    }
  };

  validationInfoStore.set(form, info);
  return info;
}

const unobtrusive = {
  adapters,

  parseElement: function(element) {
    const form = element.closest("form");
    // Cannot do client-side validation without a form
    if (!form) {
      return;
    }

    const info = getValidationInfo(form);
    const rules = info.options.rules[element.name] = {};
    const messages = info.options.messages[element.name] = {};

    adapters._.forEach(adapter => {
      let prefix = `data-val-${adapter.name}`;
      const message = element.getAttribute(prefix);

      if (message === null) {
        return;
      }

      const paramValues = {};

      adapter.params.forEach(param => {
        paramValues[param] = element.getAttribute(`${prefix}-${param}`);
      });

      adapter.adapt({ element, form, message, params: paramValues, rules, messages });
    });
  },

  parse: function() {
    const forms = [...document.querySelectorAll("form")]
      .filter(f => f.querySelector("[data-val=true]") !== null);

    [...document.querySelectorAll("[data-val=true]")]
      .forEach(el => this.parseElement(el));

    forms.forEach(f => {
      const info = getValidationInfo(f);
      if (info) {
        info.attachValidation();
      }
    });
  }
};

// Auto-parse on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    unobtrusive.parse(document);
  });
} else {
  // DOM already loaded
  unobtrusive.parse();
}

export default unobtrusive;
