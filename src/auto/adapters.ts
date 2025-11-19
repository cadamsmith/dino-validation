import {
  appendModelPrefix,
  escapeAttributeValue,
  getModelPrefix,
} from './helpers.js';

function setValidationValues(options: any, ruleName: string, value: any) {
  options.rules[ruleName] = value;
  if (options.message) {
    options.messages[ruleName] = options.message;
  }
}

const adapters = {
  _: [] as any[],

  add: function (adapterName: string, params: any, fn?: any) {
    // Called with no params, just a function
    if (!fn) {
      fn = params;
      params = [];
    }

    this._.push({ name: adapterName, params, adapt: fn });
    return this;
  },

  addBool: function (adapterName: string, ruleName: string) {
    return this.add(adapterName, function (options: any) {
      setValidationValues(options, ruleName || adapterName, true);
    });
  },

  addMinMax: function (
    adapterName: string,
    minRuleName: string,
    maxRuleName: string,
    minMaxRuleName: string,
    minAttribute: any,
    maxAttribute: any,
  ) {
    return this.add(
      adapterName,
      [minAttribute || 'min', maxAttribute || 'max'],
      function (options: any) {
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

  addSingleVal: function (
    adapterName: string,
    attribute: string,
    ruleName?: any,
  ) {
    return this.add(adapterName, [attribute || 'val'], function (options: any) {
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

adapters.add('equalto', ['other'], function (options: any) {
  const prefix = getModelPrefix(options.element.name);
  const other = options.params.other;
  const fullOtherName = escapeAttributeValue(appendModelPrefix(other, prefix));
  const element = [
    ...options.form.querySelectorAll('input, textarea, select, button'),
  ].filter((el) => el.matches(`[name='${fullOtherName}']`))[0];

  setValidationValues(options, 'equalTo', element);
});

adapters.add('required', function (options: any) {
  if (
    options.element.tagName.toUpperCase() !== 'INPUT' ||
    options.element.type.toUpperCase() !== 'CHECKBOX'
  ) {
    setValidationValues(options, 'required', true);
  }
});

adapters.add(
  'password',
  ['min', 'nonalphamin', 'regex'],
  function (options: any) {
    if (options.params.min) {
      setValidationValues(options, 'minlength', options.params.min);
    }
    if (options.params.nonalphamin) {
      setValidationValues(options, 'nonalphamin', options.params.nonalphamin);
    }
    if (options.params.regex) {
      setValidationValues(options, 'regex', options.params.regex);
    }
  },
);

adapters.add('fileextensions', ['extensions'], function (options: any) {
  setValidationValues(options, 'extension', options.params.extensions);
});

export default adapters;
