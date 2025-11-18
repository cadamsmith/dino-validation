import {
  appendModelPrefix,
  escapeAttributeValue,
  getModelPrefix,
} from './helpers.js';

function setValidationValues(options, ruleName, value) {
  options.rules[ruleName] = value;
  if (options.message) {
    options.messages[ruleName] = options.message;
  }
}

const adapters = {
  _: [],

  add: function (adapterName, params, fn) {
    // Called with no params, just a function
    if (!fn) {
      fn = params;
      params = [];
    }

    this._.push({ name: adapterName, params, adapt: fn });
    return this;
  },

  addBool: function (adapterName, ruleName) {
    return this.add(adapterName, function (options) {
      setValidationValues(options, ruleName || adapterName, true);
    });
  },

  addMinMax: function (
    adapterName,
    minRuleName,
    maxRuleName,
    minMaxRuleName,
    minAttribute,
    maxAttribute,
  ) {
    return this.add(
      adapterName,
      [minAttribute || 'min', maxAttribute || 'max'],
      function (options) {
        const min = options.params.min;
        const max = options.params.max;

        if (min && max) {
          setValidationValues(options, minMaxRuleName, [min, max]);
        } else if (min) {
          setValidationValues(options, minRuleName, min);
        } else if (max) {
          setValidationValues(options, maxRuleName, max);
        }
      },
    );
  },

  addSingleVal: function (adapterName, attribute, ruleName) {
    return this.add(adapterName, [attribute || 'val'], function (options) {
      setValidationValues(
        options,
        ruleName || adapterName,
        options.params.value,
      );
    });
  },
};

adapters
  .addSingleVal('accept', 'mimtype')
  .addSingleVal('extension', 'extension')
  .addSingleVal('regex', 'pattern')
  .addBool('creditcard')
  .addBool('date')
  .addBool('digits')
  .addBool('email')
  .addBool('number')
  .addBool('url')
  .addMinMax('length', 'minlength', 'maxlength', 'rangelength')
  .addMinMax('range', 'min', 'max', 'range')
  .addMinMax('minlength', 'minlength')
  .addMinMax('maxlength', 'minlength', 'maxlength');

adapters.add('equalto', ['other'], function (options) {
  const prefix = getModelPrefix(options.element.name);
  const other = options.params.other;
  const fullOtherName = escapeAttributeValue(appendModelPrefix(other, prefix));
  const element = [
    ...options.form.querySelectorAll('input, textarea, select, button'),
  ].filter((el) => el.matches(`[name='${fullOtherName}']`))[0];

  setValidationValues(options, 'equalTo', element);
});

adapters.add('required', function (options) {
  if (
    options.element.tagName.toUpperCase() !== 'INPUT' ||
    options.element.type.toUpperCase() !== 'CHECKBOX'
  ) {
    setValidationValues(options, 'required', true);
  }
});

adapters.add('password', ['min', 'nonalphamin', 'regex'], function (options) {
  if (options.params.min) {
    setValidationValues(options, 'minlength', options.params.min);
  }
  if (options.params.nonalphamin) {
    setValidationValues(options, 'nonalphamin', options.params.nonalphamin);
  }
  if (options.params.regex) {
    setValidationValues(options, 'regex', options.params.regex);
  }
});

adapters.add('fileextensions', ['extensions'], function (options) {
  setValidationValues(options, 'extension', options.params.extensions);
});

export default adapters;
