import { expect, test } from '@playwright/test';
import { FormControlElement } from '../src/types';

test('constructor', async ({ page }) => {
  await page.goto('');

  const [v1, v2, v1Elements] = await page.evaluate(() => {
    const v1 = dv.validate('#testForm1')!;
    const v2 = dv.validate('#testForm1');
    return [v1, v2, v1.elements()];
  });

  // Calling validate() multiple times must return the same validator instance
  expect(v1 === v2).toBe(true);
  expect(v1Elements.length).toBe(3);
});

test('validate() without elements, with non-form elements', async ({
  page,
}) => {
  await page.goto('');

  const output = await page.evaluate(() => {
    dv.validate('#doesntexist');
    return 0;
  });

  expect(output).toEqual(0);
});

test('valid() plugin method', async ({ page }) => {
  await page.goto('');

  const [isFormValid, isInputValid] = await page.evaluate(() => {
    const input = '#username';
    const form = '#userForm';

    dv.validate(form);

    return [dv.valid(form), dv.valid(input)];
  });

  expect(isFormValid).toBe(false);
  expect(isInputValid).toBe(false);
});

test('valid() plugin method, multiple inputs', async ({ page }) => {
  await page.goto('');

  const tests = await page.evaluate(() => {
    const form = document.querySelector('#testForm1')!;
    const validator = dv.validate(form)!;
    const inputs = Array.from(form.querySelectorAll('input'));

    const tests: any[] = [dv.valid(inputs)];

    inputs.slice(1).forEach((input) => (input.value = 'ok'));
    tests.push(validator.numberOfInvalids(), dv.valid(inputs));

    inputs.forEach((input) => (input.value = 'ok'));
    tests.push(dv.valid(inputs));

    return tests;
  });

  expect(tests[0]).toBe(false);
  expect(tests[1]).toBe(2);
  expect(tests[2]).toBe(false);
  expect(tests[3]).toBe(true);
});

test('valid() plugin method, special handling for checkable groups', async ({
  page,
}) => {
  await page.goto('');

  const tests = await page.evaluate(() => {
    const checkable2 = document.querySelector(
      '#checkable2',
    ) as HTMLInputElement;
    const tests = [dv.valid(checkable2)];

    checkable2.checked = true;
    tests.push(dv.valid(checkable2));

    checkable2.checked = false;
    tests.push(dv.valid(checkable2));

    let checkable3 = document.querySelector('#checkable3') as HTMLInputElement;
    checkable3.checked = true;
    tests.push(dv.valid(checkable2));

    return tests;
  });

  expect(tests).toEqual([false, true, false, true]);
});

test('valid() ???', async ({ page }) => {
  await page.goto('');

  const tests = await page.evaluate(() => {
    const errorList = [
      {
        method: 'required',
        message: 'foo',
        element: document.querySelector('#meal') as FormControlElement,
      },
    ];
    let v = dv.validate('#testForm3')!;

    const tests = [v.valid()];

    v.errorList = errorList;
    tests.push(v.valid());

    v.destroy();
    v = dv.validate('#testForm3')!;
    tests.push(v.valid());

    v.errorList = errorList;
    tests.push(v.valid());

    return tests;
  });

  expect(tests).toEqual([true, false, true, false]);
});

test('valid(), ignores ignored elements', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.validate('#testForm1clean', {
      ignore: '#firstnamec',
      rules: {
        firstnamec: 'required',
      },
    });

    return dv.valid('#firstnamec');
  });

  expect(result).toBe(true);
});

test('valid() should ignore elements that belong to other/nested forms', async ({
  page,
}) => {
  await page.goto('');

  const result1 = await page.evaluate(() => {
    const form = document.querySelector('#testForm28') as HTMLElement;
    dv.validate(form);

    // 1. Test with nested form
    form.insertAdjacentHTML(
      'afterend',
      "<form id='testForm28-nested'>" +
        "    <input type='text' name='f28nestedinput' required>" +
        '</form>',
    );

    try {
      dv.valid(form);
      return true;
    } catch (err) {
      return false;
    }
  });

  expect(result1).toBe(true);

  // reset test page
  await page.goto('');

  const result2 = await page.evaluate(() => {
    const form = document.querySelector('#testForm28')!;

    // 2. Test using another form outside of validated one
    form.parentElement!.insertAdjacentHTML(
      'afterend',
      "<form id='testForm28-other'>" +
        "   <input type='text' name='f28otherinput' required>" +
        "   <input type='text' name='f28input' form='testForm28' required>" +
        '</form>',
    );

    dv.validate('#testForm28-other');

    try {
      dv.valid('#testForm28-other');
      return true;
    } catch (err) {
      return false;
    }
  });

  expect(result2).toBe(true);
});

test('form() should ignore elements that belong to other/nested forms', async ({
  page,
}) => {
  await page.goto('');

  const result1 = await page.evaluate(() => {
    const form = document.querySelector('#testForm28')!;
    const v = dv.validate(form)!;

    // 1. Test with nested form
    form.insertAdjacentHTML(
      'afterend',
      "<form id='testForm28-nested'>" +
        "    <input type='text' name='f28nestedinput' required>" +
        '</form>',
    );

    try {
      v.form();
      return true;
    } catch (err) {
      return false;
    }
  });

  expect(result1).toBe(true);

  // reset test page
  await page.goto('');

  const result2 = await page.evaluate(() => {
    const form = document.querySelector('#testForm28')!;

    // 2. Test using another form outside of validated one
    form.parentElement!.insertAdjacentHTML(
      'afterend',
      "<form id='testForm28-other'>" +
        "   <input type='text' name='f28otherinput' required>" +
        "   <input type='text' name='f28input' form='testForm28' required>" +
        '</form>',
    );

    const v = dv.validate(form)!;

    try {
      v.form();
      return true;
    } catch (err) {
      return false;
    }
  });

  expect(result2).toBe(true);
});

test('elements() should ignore elements that belong to other/nested forms', async ({
  page,
}) => {
  await page.goto('');

  const result1 = await page.evaluate(() => {
    const form = document.querySelector('#testForm28')!;
    const v = dv.validate(form)!;

    // 1. Test with nested form
    form.insertAdjacentHTML(
      'afterend',
      "<form id='testForm28-nested'>" +
        "    <input type='text' name='f28nestedinput' required>" +
        '</form>',
    );

    return v.elements().length;
  });

  expect(result1).toBe(1);

  await page.goto('');

  const result2 = await page.evaluate(() => {
    const form = document.querySelector('#testForm28')!;

    // 2. Test using another form outside of validated one
    form.parentElement!.insertAdjacentHTML(
      'afterend',
      "<form id='testForm28-other'>" +
        "   <input type='text' name='f28otherinput' required>" +
        "   <input type='text' name='f28input' form='testForm28' required>" +
        '</form>',
    );

    const v = dv.validate('#testForm28-other')!;

    return v.elements().length;
  });

  expect(result2).toBe(1);
});

test('Ignore elements that have form attribute set to other forms', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm28')!;

    // Append a form that contains an input with form attribute set to "testForm28"
    form.parentElement!.insertAdjacentHTML(
      'afterend',
      "<form id='testForm28-other'>" +
        "   <input type='text' name='f28otherinput' required>" +
        "   <input type='text' name='f28input' form='testForm28' required>" +
        '</form>',
    );

    // Attach the plugin to the appended form
    const appendedForm = document.querySelector(
      '#testForm28-other',
    ) as HTMLElement;
    dv.validate(appendedForm);

    // 1. simulate typing
    appendedForm
      .querySelector("[name='f28input']")!
      .dispatchEvent(new Event('keyup'));
    // 2. simulate focussing in the input
    appendedForm
      .querySelector("[name='f28input']")!
      .dispatchEvent(new Event('focusin'));
    // 3. simulate focussing out of the input
    appendedForm
      .querySelector("[name='f28input']")!
      .dispatchEvent(new Event('focusout'));

    return true;
  });

  expect(result).toBe(true);
});

test('Validate elements outside form with form attribute', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm29')!;
    const v = dv.validate(form)!;

    return [v.elements().length, v.form(), v.numberOfInvalids()];
  });

  expect(result).toEqual([2, false, 2]);
});

test('Validate checkboxes outside form with form attribute', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm30')!;
    const v = dv.validate(form)!;

    return [v.elements().length, v.form(), v.numberOfInvalids()];
  });

  expect(result).toEqual([2, false, 2]);
});

test('addMethod', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.addMethod(
      'hi',
      function ({ value }) {
        return value === 'hi';
      },
      'hi me too',
    );

    const method = dv.methods.get('hi')!;
    const e = document.querySelector('#text1') as FormControlElement;

    const input = () => ({
      blank: !!e.value,
      value: e.value,
      values: [e.value],
      length: e.value.length,
      element: e,
      param: undefined,
    });

    const ret: any[] = [method(input())];

    e.value = 'hi';
    ret.push(method(input()), dv.messages.get('hi'));

    return ret;
  });

  expect(result).toEqual([false, true, 'hi me too']);
});

test('addMethod2', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const ret = [];

    dv.addMethod(
      'complicatedPassword',
      function ({ blank, value }) {
        return (
          blank || (value !== null && /\D/.test(value) && /\d/.test(value))
        );
      },
      'Your password must contain at least one number and one letter',
    );

    const v = dv.validate('#form', {
      rules: {
        action: { complicatedPassword: true },
      },
    })!;

    const e = document.querySelector('#text1') as FormControlElement;
    e.value = '';

    ret.push(v.element(e), v.size());
    e.value = 'ko';
    ret.push(v.element(e));
    e.value = 'ko1';
    ret.push(v.element(e));

    return ret;
  });

  expect(result).toEqual([true, 0, false, true]);
});

test('form(): simple', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm1')!;
    const fnInput = document.querySelector('#firstname') as FormControlElement;
    const lnInput = document.querySelector('#lastname') as FormControlElement;

    const ret = [v.form()];

    fnInput.value = 'hi';
    lnInput.value = 'hi';
    ret.push(v.form());

    return ret;
  });

  expect(result).toEqual([false, true]);
});

test('form(): checkboxes: min/required', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm6')!;

    const ret = [v.form()];

    const check1 = document.querySelector('#form6check1') as HTMLInputElement;
    const check2 = document.querySelector('#form6check2') as HTMLInputElement;

    check1.checked = true;
    ret.push(v.form());
    check2.checked = true;
    ret.push(v.form());

    return ret;
  });

  expect(result).toEqual([false, false, true]);
});

test('form(): radio buttons: required', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm10', {
      rules: {
        testForm10Radio: 'required',
      },
    })!;

    const radio1 = document.querySelector(
      '#testForm10Radio1',
    ) as HTMLInputElement;
    const radio2 = document.querySelector(
      '#testForm10Radio2',
    ) as HTMLInputElement;

    const ret = [v.form(), radio1.className, radio2.className];

    radio2.checked = true;

    ret.push(v.form(), radio1.className, radio2.className);

    return ret;
  });

  expect(result).toEqual([false, 'error', 'error', true, 'valid', 'valid']);
});

test('form(): selects: min/required', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm7')!;

    const optionXA = document.querySelector('#optionxa') as HTMLOptionElement;
    const optionXB = document.querySelector('#optionxb') as HTMLOptionElement;

    const ret = [v.form()];

    optionXA.selected = true;
    ret.push(v.form());

    optionXB.selected = true;
    ret.push(v.form());

    return ret;
  });

  expect(result).toEqual([false, false, true]);
});

test('form(): with equalTo', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm5')!;

    const ret = [v.form()];

    const elements = Array.from(
      document.querySelectorAll('#x1, #x2'),
    ) as FormControlElement[];

    elements.forEach((e) => {
      e.value = 'hi';
    });
    ret.push(v.form());

    return ret;
  });

  expect(result).toEqual([false, true]);
});

test('form(): with equalTo and onfocusout=false', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm5') as HTMLFormElement;
    let showErrorsCount = 0;
    const v = dv.validate(form, {
      onfocusout: false,
      showErrors: function () {
        showErrorsCount++;
        this.defaultShowErrors();
      },
    })!;

    const x1 = document.querySelector('#x1') as FormControlElement;
    const x2 = document.querySelector('#x2') as FormControlElement;

    x1.value = 'hi';
    x2.value = 'hi';
    const ret: any[] = [v.form()];

    x2.value = 'not equal';

    ret.push(v.form(), showErrorsCount);

    return ret;
  });

  expect(result).toEqual([true, false, 2]);
});

test('check(): simple', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm1')!;
    const firstName = document.querySelector(
      '#firstname',
    ) as FormControlElement;

    const ret = [v.size()];

    v.check(firstName);
    ret.push(v.size());

    v.errorList = [];
    firstName.value = 'hi';
    v.check(firstName);
    ret.push(v.size());

    return ret;
  });

  expect(result).toEqual([0, 1, 0]);
});

test('numberOfInvalids(): count invalid fields with empty message', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm23', {
      rules: {
        box1: {
          required: true,
        },
        box2: {
          required: true,
        },
      },
    })!;

    dv.messages.set('required', '');
    v.form();

    return [v.errorList.length, v.numberOfInvalids()];
  });

  expect(result).toEqual([2, 2]);
});

test('hide(): input', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorLabel = document.querySelector('#errorFirstname') as HTMLElement;
    const element = document.querySelector('#firstname') as FormControlElement;

    element.value = 'bla';
    const v = dv.validate('#testForm1')!;
    dv_testLib.showElement(errorLabel);

    return [
      dv_testLib.isVisible(errorLabel),
      v.element(element),
      dv_testLib.isVisible(errorLabel),
    ];
  });

  expect(result).toEqual([true, true, false]);
});

test('hide(): radio', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorLabel = document.querySelector('#agreeLabel') as HTMLElement;
    const element = document.querySelector('#agb') as HTMLInputElement;

    element.checked = true;
    const v = dv.validate('#testForm2', { errorClass: 'xerror' })!;
    dv_testLib.showElement(errorLabel);

    const ret = [dv_testLib.isVisible(errorLabel)];

    v.element(element as FormControlElement);
    ret.push(dv_testLib.isVisible(errorLabel));

    return ret;
  });

  expect(result).toEqual([true, false]);
});

test('hide(): errorWrapper', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorLabel = document.querySelector('#errorWrapper') as HTMLElement;
    const element = document.querySelector('#meal') as HTMLSelectElement;

    element.selectedIndex = 1;
    errorLabel.style.display = 'block';

    const ret = [errorLabel.style.display];

    const v = dv.validate('#testForm3', {
      wrapper: 'li',
      errorLabelContainer: '#errorContainer',
    })!;
    v.element(element as FormControlElement);

    ret.push(errorLabel.style.display);

    return ret;
  });

  expect(result).toEqual(['block', 'none']);
});

test('hide(): container', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorLabel = document.querySelector('#errorContainer') as HTMLElement;
    const mealSelect = document.querySelector('#meal') as HTMLSelectElement;
    const v = dv.validate('#testForm3', {
      wrapper: 'li',
      errorContainer: '#errorContainer',
    })!;

    const isVisible = (el: HTMLElement) => el.style.display !== 'none';

    v.form();
    const ret = [isVisible(errorLabel)];

    mealSelect.selectedIndex = 1;
    v.form();
    ret.push(isVisible(errorLabel));

    mealSelect.selectedIndex = -1;
    v.element(mealSelect as FormControlElement);
    ret.push(isVisible(errorLabel));

    mealSelect.selectedIndex = 1;
    v.element(mealSelect as FormControlElement);
    ret.push(isVisible(errorLabel));

    return ret;
  });

  expect(result).toEqual([true, false, true, false]);
});

test('validation triggered on radio.checkbox when using keyboard', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    let triggeredEvents = 0;

    dv.validate('#form', {
      onfocusin: function () {
        triggeredEvents++;
      },
      onfocusout: function () {
        triggeredEvents++;
      },
      onkeyup: function () {
        triggeredEvents++;
      },
    });

    const events = [
      new Event('focusin', { bubbles: true }),
      new Event('focusout', { bubbles: true }),
      new Event('keyup', { bubbles: true }),
    ];

    let input = document.querySelector('#form [type="radio"]') as HTMLElement;
    for (const event of events) {
      input.dispatchEvent(event);
    }

    input = document.querySelector(
      "#form [type='checkbox']",
    ) as HTMLInputElement;
    for (const event of events) {
      input.dispatchEvent(event);
    }

    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(triggeredEvents);
      });
    });
  });

  expect(result).toBe(6);
});

test('validation triggered on button', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    let triggeredEvents = 0;

    dv.validate('#form', {
      onfocusin: function () {
        triggeredEvents++;
      },
      onfocusout: function () {
        triggeredEvents++;
      },
      onkeyup: function () {
        triggeredEvents++;
      },
    });

    const events = [
      new Event('focusin', { bubbles: true }),
      new Event('focusout', { bubbles: true }),
      new Event('keyup', { bubbles: true }),
    ];

    const inputs = Array.from(
      document.querySelectorAll('#formButton1, #formButton2'),
    );
    for (const event of events) {
      inputs.forEach((i) => i.dispatchEvent(event));
    }

    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(triggeredEvents);
      });
    });
  });

  expect(result).toBe(6);
});

test('validation triggered on radio/checkbox when using mouseclick', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    let triggeredEvents = 0;
    dv.validate('#form', {
      onclick: function () {
        triggeredEvents++;
      },
    });

    const event = new Event('click', { bubbles: true });

    let input = document.querySelector("#form [type='radio']")!;
    input.dispatchEvent(event);

    input = document.querySelector("#form [type='checkbox']")!;
    input.dispatchEvent(event);

    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(triggeredEvents);
      });
    });
  });

  expect(result).toBe(2);
});

test('showErrors()', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorLabel = document.querySelector('#errorFirstname') as HTMLElement;
    dv_testLib.hideElement(errorLabel);
    const v = dv.validate('#testForm1')!;

    const lastNameHasError = () => {
      const next = document.querySelector('#lastname')?.nextElementSibling;
      if (!next) {
        return false;
      }

      return (
        next.matches('.error:not(input)') &&
        dv_testLib.isVisible(next as HTMLElement)
      );
    };

    const ret = [dv_testLib.isVisible(errorLabel), lastNameHasError()];

    v.showErrors({ firstname: 'required', lastname: 'bla' });

    ret.push(dv_testLib.isVisible(errorLabel), lastNameHasError());

    return ret;
  });

  expect(result).toEqual([false, false, true, true]);
});

test('showErrors(), allow empty string and null as default message', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.validate('#userForm', {
      rules: {
        username: {
          required: true,
          minlength: 3,
        },
      },
      messages: {
        username: {
          required: '',
          minlength: 'too short',
        },
      },
    });

    const username = document.getElementById('username') as FormControlElement;

    const ret: any[] = [dv.valid('#username')];

    const usernameError = username.nextElementSibling as HTMLElement;
    ret.push(
      usernameError.matches('.error:not(input)'),
      usernameError.innerText,
    );

    username.value = 'ab';
    ret.push(
      dv.valid('#username'),
      usernameError.matches('.error:not(input)'),
      usernameError.innerText,
    );

    username.value = 'abc';
    ret.push(
      dv.valid('#username'),
      usernameError.matches('.error:not(input)'),
      usernameError.style.display,
    );

    return ret;
  });

  expect(result).toEqual([
    false,
    true,
    '',
    false,
    true,
    'too short',
    true,
    true,
    'none',
  ]);
});

test('showErrors() - external messages', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.addMethod('foo', function () {
      return false;
    });
    dv.addMethod('bar', function () {
      return false;
    });

    let f1Next = document.querySelector('#testForm4 #f1')!
      .nextElementSibling as HTMLElement;
    let f2Next = document.querySelector('#testForm4 #f2')!
      .nextElementSibling as HTMLElement;

    const ret: any[] = [f1Next.matches('.error:not(input)'), f2Next];

    const form = document.querySelector('#testForm4');
    const v = dv.validate(form, {
      messages: {
        f1: 'Please!',
        f2: 'Wohoo!',
      },
    })!;
    v.form();

    f1Next = document.querySelector('#testForm4 #f1')!
      .nextElementSibling as HTMLElement;
    f2Next = document.querySelector('#testForm4 #f2')!
      .nextElementSibling as HTMLElement;

    ret.push(
      f1Next.matches('.error:not(input)'),
      f1Next.innerText,
      f2Next.matches('.error:not(input)'),
      f2Next.innerText,
    );

    return ret;
  });

  expect(result).toEqual([false, null, true, 'Please!', true, 'Wohoo!']);
});

test('option: (un)highlight, default', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.validate('#testForm1');
    const e = document.querySelector('#firstname') as FormControlElement;

    const ret = [e.classList.contains('error'), e.classList.contains('valid')];

    dv.valid(e);

    ret.push(e.classList.contains('error'), e.classList.contains('valid'));

    e.value = 'hithere';
    dv.valid(e);

    ret.push(e.classList.contains('error'), e.classList.contains('valid'));

    return ret;
  });

  expect(result).toEqual([false, false, true, false, false, true]);
});

test('option: (un)highlight, nothing', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.validate('#testForm1', {
      highlight: false,
      unhighlight: false,
    });
    const e = document.querySelector('#firstname') as FormControlElement;

    const ret = [e.classList.contains('error')];

    dv.valid(e);
    ret.push(e.classList.contains('error'));

    dv.valid(e);
    ret.push(e.classList.contains('error'));

    return ret;
  });

  expect(result).toEqual([false, false, false]);
});

test('option: (un)highlight, custom', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const ret = [];

    dv.validate('#testForm1clean', {
      highlight: function (element, errorClasses) {
        ret.unshift(...errorClasses);
        element.style.display = 'none';
      },
      unhighlight: function (element, errorClasses) {
        ret.unshift(...errorClasses);
        element.style.display = 'block';
      },
      ignore: '',
      errorClass: 'invalid',
      rules: {
        firstnamec: 'required',
      },
    });

    const e = document.querySelector('#firstnamec') as FormControlElement;
    ret.push(e.style.display !== 'none');

    dv.valid(e);
    ret.push(e.style.display);

    e.value = 'hithere';
    dv.valid(e);
    ret.push(e.style.display);

    return ret;
  });

  expect(result).toEqual(['invalid', 'invalid', true, 'none', 'block']);
});

test('option: (un)highlight, custom2', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.validate('#testForm1', {
      highlight: function (element, errorClass) {
        element.classList.add(...errorClass);
        if (element.nextElementSibling!.matches('.error:not(input)')) {
          element.nextElementSibling!.classList.add(...errorClass);
        }
      },
      unhighlight: function (element, errorClass) {
        element.classList.remove(...errorClass);
        if (element.nextElementSibling!.matches('.error:not(input)')) {
          element.nextElementSibling!.classList.remove(...errorClass);
        }
      },
      errorClass: 'invalid',
    });

    const e = document.querySelector('#firstname') as FormControlElement;
    const l = document.querySelector('#errorFirstname') as HTMLElement;

    const ret = [e.matches('.invalid'), l.matches('.invalid')];

    dv.valid(e);
    ret.push(e.matches('.invalid'), l.matches('.invalid'));

    e.value = 'hithere';
    dv.valid(e);
    ret.push(e.matches('.invalid'), l.matches('.invalid'));

    return ret;
  });

  expect(result).toEqual([false, false, true, true, false, false]);
});

test('option: errorPlacement', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    return new Promise((resolve) => {
      const v = dv.validate('#testForm1', {
        errorPlacement: function () {
          resolve(this === v);
        },
      })!;

      v.form();
    });
  });

  expect(result).toBe(true);
});

test('option: focusCleanup default false', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm') as HTMLFormElement;
    dv.validate(form);
    dv.valid(form);

    const isVisible = (el: HTMLElement) => el.style.display !== 'none';

    const usernameError = form.querySelector('#username')!
      .nextElementSibling as HTMLElement;
    const ret = [isVisible(usernameError)];

    usernameError.focus();
    ret.push(isVisible(usernameError));

    return ret;
  });

  expect(result).toEqual([true, true]);
});

test('option: focusCleanup true', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm') as HTMLFormElement;
    dv.validate(form, { focusCleanup: true });
    dv.valid(form);

    const isVisible = (el: HTMLElement) => el.style.display !== 'none';

    const usernameError = form.querySelector('#username')!
      .nextElementSibling as HTMLElement;
    const ret = [isVisible(usernameError)];

    usernameError.focus();
    usernameError.dispatchEvent(new Event('focusin'));
    ret.push(isVisible(usernameError));

    return ret;
  });

  expect(result).toEqual([true, false]);
});

test('option: focusCleanup with wrapper', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm') as HTMLFormElement;
    dv.validate(form, {
      focusCleanup: true,
      wrapper: 'span',
    });
    dv.valid(form);

    const username = document.querySelector('#username') as HTMLElement;

    function isVisible(el: HTMLElement) {
      return !!(
        el.offsetWidth ||
        el.offsetHeight ||
        el.getClientRects().length
      );
    }

    function hasVisibleErrors() {
      const wrappers = Array.from(form.querySelectorAll('span'))
        .filter((el) => isVisible(el))
        .map((el) => el.querySelectorAll('.error#username-error'))
        .flat();

      return wrappers.length > 0;
    }

    const ret = [hasVisibleErrors()];

    username.focus();
    username.dispatchEvent(new Event('focusin'));
    ret.push(hasVisibleErrors());

    return ret;
  });

  expect(result).toEqual([true, false]);
});

test('option: errorClass with multiple classes', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm') as HTMLFormElement;
    dv.validate(form, {
      focusCleanup: true,
      wrapper: 'span',
      errorClass: 'error error1 error2',
    });
    dv.valid(form);

    function isVisible(el: HTMLElement) {
      return !!(
        el.offsetWidth ||
        el.offsetHeight ||
        el.getClientRects().length
      );
    }

    function containsErrorClass(name: string) {
      const matches = Array.from(form.querySelectorAll('span'))
        .filter((el) => isVisible(el))
        .map((el) => el.querySelectorAll(`.${name}#username-error`))
        .flat();

      return matches.length > 0;
    }

    const ret = [
      containsErrorClass('error'),
      containsErrorClass('error1'),
      containsErrorClass('error2'),
    ];

    const username = document.querySelector('#username') as HTMLElement;
    username.focus();
    username.dispatchEvent(new Event('focusin'));
    ret.push(
      containsErrorClass('error'),
      containsErrorClass('error1'),
      containsErrorClass('error2'),
    );

    return ret;
  });

  expect(result).toEqual([true, true, true, false, false, false]);
});

test('defaultMessage(), empty title is ignored', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#userForm')!;

    const element = document.querySelector('#username') as FormControlElement;

    return [
      v.getMessage(element, { method: 'required', parameters: true }),
      v.getMessage(element, 'required'),
    ];
  });

  expect(result).toEqual([
    'This field is required.',
    'This field is required.',
  ]);
});

test('#741: move message processing from formatAndAdd to defaultMessage', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm22')!;
    const input = document.querySelector('#tF22Input') as FormControlElement;

    const ret: any[] = [
      v.getMessage(input, { method: 'minlength', parameters: 5 }),
    ];
    input.value = 'abc';
    v.form();
    ret.push(v.errorList[0]?.message);

    return ret;
  });

  expect(result).toEqual([
    'You should enter at least 5 characters.',
    'You should enter at least 5 characters.',
  ]);
});

test('formatAndAdd', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#form');
    const v = dv.validate(form)!;
    const fakeElement = { form, name: 'bar' } as FormControlElement;

    v.formatAndAdd(fakeElement, { method: 'maxlength', parameters: 2 });
    const ret = [v.errorList[0]!.message, v.errorList[0]!.element.name];

    v.formatAndAdd(fakeElement, { method: 'range', parameters: [2, 4] });
    ret.push(v.errorList[1]!.message);

    v.formatAndAdd(fakeElement, { method: 'range', parameters: [0, 4] });
    ret.push(v.errorList[2]!.message);

    return ret;
  });

  expect(result).toEqual([
    'Please enter no more than 2 characters.',
    'bar',
    'Please enter a value between 2 and 4.',
    'Please enter a value between 0 and 4.',
  ]);
});

test('formatAndAdd2', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#form');
    const v = dv.validate(form)!;
    const fakeElement = { form, name: 'bar' } as FormControlElement;

    let scoped: Record<string, any> = {};

    dv.messages.set('test1', function (param, element) {
      // @ts-ignore
      scoped.this = this;
      scoped.param = param;

      return `element ${element.name} is not valid`;
    });

    v.formatAndAdd(fakeElement, { method: 'test1', parameters: 0 });

    return [v.errorList[0]!.message, scoped.this === v, scoped.param];
  });

  expect(result).toEqual(['element bar is not valid', true, 0]);
});

test('formatAndAdd, auto detect substitution string', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm1clean', {
      rules: {
        firstnamec: {
          required: true,
          rangelength: [5, 10],
        },
      },
      messages: {
        firstnamec: {
          rangelength: 'at least ${0}, up to {1}',
        },
      },
    })!;

    let firstName = document.querySelector('#firstnamec') as FormControlElement;
    firstName.value = 'abc';
    v.form();
    return v.errorList[0]!.message;
  });

  expect(result).toBe('at least 5, up to 10');
});

test('elementValue() finds radios/checkboxes only within the current form', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#userForm')!;
    const foreignRadio = document.querySelector(
      '#radio2',
    ) as FormControlElement;

    return dv_testLib.isBlankElement(foreignRadio, v.currentForm);
  });

  expect(result).toBe(true);
});

test("elementValue() returns the file input's name without the prefix 'C:\\fakepath\\'", async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const dummyForm = document.querySelector('#userForm') as HTMLFormElement;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'testFile';
    document.body.appendChild(fileInput);

    // Simulate the browser's fakepath behavior
    Object.defineProperty(fileInput, 'value', {
      get: () => 'C:\\fakepath\\test-file.txt',
      configurable: true,
    });

    return dv_testLib.elementValue(fileInput as FormControlElement, dummyForm);
  });

  expect(result).toBe('test-file.txt');
});

test('Required rule should not take precedence over number & digits rules', async ({
  page,
}) => {
  await page.goto('');

  const [numberResult, digitsResult, expectedNumber, expectedDigits] =
    await page.evaluate(() => {
      const form = document.querySelector('#form') as HTMLFormElement;

      // Test number rule
      const input1 = document.createElement('input');
      input1.type = 'text';
      input1.name = 'testInput1';
      input1.value = 'abc'; // Invalid for number
      form.appendChild(input1);

      const v1 = dv.validate(form, {
        rules: {
          testInput1: {
            required: true,
            number: true,
          },
        },
      })!;

      v1.form();
      const numberMessage = v1.errorList[0]?.message;
      form.removeChild(input1);
      v1.destroy();

      // Test digits rule
      const input2 = document.createElement('input');
      input2.type = 'text';
      input2.name = 'testInput2';
      input2.value = '12.34'; // Invalid for digits (contains decimal)
      form.appendChild(input2);

      const v2 = dv.validate(form, {
        rules: {
          testInput2: {
            required: true,
            digits: true,
          },
        },
      })!;

      v2.form();
      const digitsMessage = v2.errorList[0]?.message;
      form.removeChild(input2);

      return [
        numberMessage,
        digitsMessage,
        dv.messages.get('number'),
        dv.messages.get('digits'),
      ];
    });

  // Should get number validation error, not required error
  expect(numberResult).toBe(expectedNumber);

  // Should get digits validation error, not required error
  expect(digitsResult).toBe(expectedDigits);
});

test("validating multiple checkboxes with 'required'", async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const checkboxes = Array.from(
      document.querySelectorAll('#form input[name=check3]'),
    ) as HTMLInputElement[];

    checkboxes.forEach((c) => (c.checked = false));

    const ret = [checkboxes.length];

    const v = dv.validate('#form', {
      rules: {
        check3: 'required',
      },
    })!;
    v.form();

    ret.push(v.size());

    checkboxes[checkboxes.length - 1]!.checked = true;
    v.form();
    ret.push(v.size());

    return ret;
  });

  expect(result).toEqual([5, 1, 0]);
});

test('dynamic form', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    let counter = 0;
    const form = document.querySelector('#testForm2') as HTMLFormElement;

    function add(): void {
      const newInput = document.createElement('input');
      newInput.setAttribute('data-rule-required', 'true');
      newInput.setAttribute('name', `list${counter++}`);

      form.appendChild(newInput);
    }

    const v = dv.validate(form)!;

    function checkErrors(expected: number) {
      return v.size() === expected;
    }

    v.form();
    const ret = [checkErrors(1)];

    add();
    v.form();
    ret.push(checkErrors(2));

    add();
    v.form();
    ret.push(checkErrors(3));

    document.querySelector('#testForm2 input[name=list1]')!.remove();
    v.form();
    ret.push(checkErrors(2));

    add();
    v.form();
    ret.push(checkErrors(3));

    Array.from(
      document.querySelectorAll('#testForm2 input[name^=list]'),
    ).forEach((i) => i.remove());
    v.form();
    ret.push(checkErrors(1));

    const agb = document.querySelector('#agb') as HTMLInputElement;

    agb.disabled = true;
    v.form();
    ret.push(checkErrors(0));

    agb.disabled = false;
    v.form();
    ret.push(checkErrors(1));

    return ret;
  });

  expect(result).toEqual(new Array(result.length).fill(true));
});

test('idOrName()', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form8Input = document.querySelector(
      '#form8input',
    ) as FormControlElement;
    const form6Check1 = document.querySelector(
      '#form6check1',
    ) as FormControlElement;
    const agb = document.querySelector('#agb') as FormControlElement;

    return [
      dv_testLib.idOrName(form8Input),
      dv_testLib.idOrName(form6Check1),
      dv_testLib.idOrName(agb),
    ];
  });

  expect(result).toEqual(['form8input', 'check', 'agree']);
});

test('resetForm()', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm1')!;
    const firstName = document.querySelector(
      '#firstname',
    ) as FormControlElement;
    const something = document.querySelector('#something') as HTMLElement;

    v.form();
    const ret = [
      v.size(),
      firstName.classList.contains('error'),
      something.classList.contains('valid'),
    ];

    firstName.value = 'hiy';
    v.resetForm();
    ret.push(
      v.size(),
      firstName.classList.contains('error'),
      something.classList.contains('valid'),
    );

    return ret;
  });

  expect(result).toEqual([2, true, true, 0, false, false]);
});

test('message from title', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#withTitle')!;
    v.form();
    return v.errorList[0]!.message;
  });

  expect(result).toBe('fromtitle');
});

test('ignoreTitle', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#withTitle', {
      ignoreTitle: true,
    })!;
    v.form();
    return v.errorList[0]!.message === dv.messages.get('required')!;
  });

  expect(result).toBe(true);
});

test('success option', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const firstName = document.querySelector(
      '#firstname',
    ) as FormControlElement;
    const ret: any[] = [firstName.value];

    const v = dv.validate('#testForm1', {
      success: 'valid',
    })!;
    const label = document.querySelector(
      '#testForm1 .error:not(input)',
    ) as HTMLElement;

    ret.push(
      label.classList.contains('error'),
      label.classList.contains('valid'),
    );

    v.form();
    ret.push(
      label.classList.contains('error'),
      label.classList.contains('valid'),
    );

    firstName.value = 'hi';
    v.form();
    ret.push(
      label.classList.contains('error'),
      label.classList.contains('valid'),
    );

    return ret;
  });

  expect(result).toEqual(['', true, false, true, false, true, true]);
});

test('success option2', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const firstName = document.querySelector(
      '#firstname',
    ) as FormControlElement;
    const ret: any[] = [firstName.value];

    const v = dv.validate('#testForm1', {
      success: 'valid',
    })!;
    const label = document.querySelector(
      '#testForm1 .error:not(input)',
    ) as HTMLElement;

    ret.push(
      label.classList.contains('error'),
      label.classList.contains('valid'),
    );

    firstName.value = 'hi';
    v.form();
    ret.push(
      label.classList.contains('error'),
      label.classList.contains('valid'),
    );

    return ret;
  });

  expect(result).toEqual(['', true, false, true, true]);
});

test('success option3', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const firstName = document.querySelector(
      '#firstname',
    ) as FormControlElement;
    const ret: any[] = [firstName.value];
    document.querySelector('#errorFirstname')!.remove();

    const v = dv.validate('#testForm1', {
      success: 'valid',
    })!;

    ret.push(document.querySelector('#testForm1 .error:not(input)'));

    firstName.value = 'hi';
    v.form();
    const labels = Array.from(
      document.querySelectorAll('#testForm1 .error:not(input)'),
    );

    ret.push(
      labels.length,
      labels[0]!.classList.contains('valid'),
      labels[1]!.classList.contains('valid'),
    );

    return ret;
  });

  expect(result).toEqual(['', null, 3, true, false]);
});

test('successList', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#form', {
      success: 'xyz',
    })!;
    v.form();

    return v.successList.length;
  });

  expect(result).toBe(0);
});

test("success isn't called for optional elements with no other rules", async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const firstName = document.querySelector(
      '#firstname',
    ) as FormControlElement;
    firstName.removeAttribute('data-rule-required');
    firstName.removeAttribute('data-rule-minlength');
    const ret: any[] = [firstName.value];

    document.querySelector('#something')!.remove();
    document.querySelector('#lastname')!.remove();
    document.querySelector('#errorFirstname')!.remove();

    let successCalled = false;
    const v = dv.validate('#form', {
      success: function () {
        successCalled = true;
      },
      rules: {
        firstname: { required: false },
      },
    })!;

    ret.push(document.querySelector('#testForm1 .error:not(input)'));

    v.form();
    ret.push(document.querySelector('#testForm1 .error:not(input)'));

    dv.valid(firstName);
    ret.push(
      document.querySelector('#testForm1 .error:not(input)'),
      successCalled,
    );

    return ret;
  });

  expect(result).toEqual(['', null, null, null, false]);
});

test('success is called for optional elements with other rules', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.addMethod(
      'custom1',
      function () {
        return true;
      },
      '',
    );

    let successCalled = false;
    dv.validate('#testForm1clean', {
      success: function () {
        successCalled = true;
      },
      rules: {
        firstnamec: {
          required: false,
          custom1: true,
        },
      },
    });

    dv.valid('#firstnamec');

    return successCalled;
  });

  expect(result).toBe(true);
});

test('success callback with element', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const username = document.querySelector('#username') as FormControlElement;

    let correctLabel = false;
    const v = dv.validate('#userForm', {
      success: function (_labels, element) {
        correctLabel = element === username;
      },
    })!;

    username.value = 'hi';
    v.form();

    return correctLabel;
  });

  expect(result).toBe(true);
});

test('all rules are evaluated', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const firstName = document.querySelector(
      '#firstname',
    ) as FormControlElement;
    firstName.removeAttribute('data-rule-required');
    firstName.removeAttribute('data-rule-minlength');

    const ret: any[] = [firstName.value];

    document.querySelector('#lastname')!.remove();
    document.querySelector('#errorFirstname')!.remove();

    let timesCalled = 0;
    dv.addMethod(
      'custom1',
      function () {
        timesCalled++;
        return true;
      },
      '',
    );

    const v = dv.validate('#testForm1', {
      rules: {
        firstname: {
          email: true,
          custom1: true,
        },
      },
    })!;

    ret.push(document.querySelector('#testForm1 .error:not(input)'));

    v.form();
    ret.push(document.querySelector('#testForm1 .error:not(input)'));

    dv.valid(firstName);
    ret.push(
      document.querySelector('#testForm1 .error:not(input)'),
      timesCalled,
    );

    return ret;
  });

  expect(result).toEqual(['', null, null, null, 2]);
});

test('messages', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const messages = dv.messages;

    const maxLength = messages.get('maxlength') as (params: any) => string;
    const minLength = messages.get('minlength') as (params: any) => string;
    const rangeLength = messages.get('rangelength') as (params: any) => string;
    const max = messages.get('max') as (params: any) => string;
    const min = messages.get('min') as (params: any) => string;
    const range = messages.get('range') as (params: any) => string;

    return [
      maxLength(0) === 'Please enter no more than 0 characters.',
      minLength(1) === 'Please enter at least 1 characters.',
      rangeLength([1, 2]) ===
        'Please enter a value between 1 and 2 characters long.',
      max(1) === 'Please enter a value less than or equal to 1.',
      min(0) === 'Please enter a value greater than or equal to 0.',
      range([1, 2]) === 'Please enter a value between 1 and 2.',
    ];
  });

  expect(result).toEqual(Array(result.length).fill(true));
});

test('option: ignore', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm1', {
      ignore: '[name=lastname]',
    })!;
    v.form();

    return v.size();
  });

  expect(result).toBe(1);
});

test('option: subformRequired', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const billToCo = document.querySelector('#bill_to_co') as HTMLInputElement;

    dv.addMethod(
      'billingRequired',
      function ({ blank, element }) {
        if (billToCo && billToCo.checked) {
          return !!element.closest('#subform');
        }
        return !blank;
      },
      '',
    );

    const v = dv.validate('#subformRequired')!;
    v.form();

    const ret = [v.size()];

    billToCo.checked = false;
    v.form();
    ret.push(v.size());

    return ret;
  });

  expect(result).toEqual([1, 2]);
});

test('ignore hidden elements', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm') as HTMLFormElement;
    const v = dv.validate(form, {
      rules: { username: 'required' },
    })!;

    form.reset();
    const ret = [v.form()];

    const username = document.querySelector(
      '#userForm [name=username]',
    ) as FormControlElement;
    dv_testLib.hideElement(username);
    ret.push(v.form());

    return ret;
  });

  expect(result).toEqual([false, true]);
});

test('ignore hidden elements at start', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm') as HTMLFormElement;
    const v = dv.validate(form, {
      rules: { username: 'required' },
    })!;

    const username = document.querySelector(
      '#userForm [name=username]',
    ) as FormControlElement;

    form.reset();
    dv_testLib.hideElement(username);
    const ret = [v.form()];

    dv_testLib.showElement(username);
    ret.push(v.form());

    return ret;
  });

  expect(result).toEqual([true, false]);
});

test('Specify error messages through data attributes', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#dataMessages') as HTMLFormElement;
    const name = document.querySelector(
      '#dataMessagesName',
    ) as FormControlElement;
    dv.validate(form);

    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#dataMessages .error:not(input)',
    ) as HTMLElement;
    return label.innerText;
  });

  expect(result).toBe('You must enter a value here');
});

test('Updates pre-existing label if has error class', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#updateLabel') as HTMLFormElement;
    const input = document.querySelector(
      '#updateLabelInput',
    ) as FormControlElement;
    const label = document.querySelector('#targetLabel') as HTMLElement;
    const labelsBefore = form.querySelectorAll('.error:not(input)').length;

    dv.validate(form);
    input.value = '';
    dv.valid(input);
    const labelsAfter = form.querySelectorAll('.error:not(input)').length;

    return [
      label.textContent === input.getAttribute('data-msg-required'),
      labelsBefore === labelsAfter,
    ];
  });

  expect(result).toEqual([true, true]);
});

test('Min date set by attribute', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector(
      '#rangesMinDateInvalid',
    ) as HTMLFormElement;
    const name = document.querySelector(
      '#minDateInvalid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#rangesMinDateInvalid .error:not(input)',
    ) as HTMLElement;
    return label.textContent;
  });

  expect(result).toBe(
    'Please enter a value greater than or equal to 2012-12-21.',
  );
});

test('Max date set by attribute', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#maxDateInvalid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#ranges .error:not(input)',
    ) as HTMLElement;
    return label.textContent;
  });

  expect(result).toBe('Please enter a value less than or equal to 2012-12-21.');
});

test('Min and max date set by attributes greater', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeDateInvalidGreater',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#ranges .error:not(input)',
    ) as HTMLElement;
    return label.textContent;
  });

  expect(result).toBe('Please enter a value less than or equal to 2013-01-21.');
});

test('Min and max date set by attributes less', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeDateInvalidLess',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#ranges .error:not(input)',
    ) as HTMLElement;
    return label.textContent;
  });

  expect(result).toBe(
    'Please enter a value greater than or equal to 2012-11-21.',
  );
});

test('Min date set by attribute valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector(
      '#rangeMinDateValid',
    ) as HTMLFormElement;
    const name = document.querySelector('#minDateValid') as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#rangeMinDateValid .error:not(input)',
    );
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Max date set by attribute valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector('#maxDateValid') as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Min and max date set by attributes valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeDateValid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Min and max strings set by attributes greater', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeTextInvalidGreater',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return label?.textContent;
  });

  expect(result).toBe('Please enter a value less than or equal to 200.');
});

test('Min and max strings set by attributes less', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeTextInvalidLess',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#ranges .error:not(input)',
    ) as HTMLElement;
    return label?.innerText;
  });

  expect(result).toBe('Please enter a value greater than or equal to 200.');
});

test('Min and max strings set by attributes valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeTextValid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#ranges .error:not(input)',
    ) as HTMLElement;
    return !!label?.innerText;
  });

  expect(result).toBe(false);
});

test('Min, Max set by data-rule valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeTextDataRuleValid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#ranges .error:not(input)',
    ) as HTMLElement;
    return !!label?.innerText;
  });

  expect(result).toBe(false);
});

// TODO: Calling blur on ignored element

test('Min and Max type absent set by attributes greater', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeAbsentInvalidGreater',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return label?.textContent;
  });

  expect(result).toBe('Please enter a value less than or equal to 200.');
});

test('Min and Max type absent set by attributes less', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeAbsentInvalidLess',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return label?.textContent;
  });

  expect(result).toBe('Please enter a value greater than or equal to 200.');
});

test('Min and Max type absent set by attributes valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeAbsentValid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Min and Max range set by attributes valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeRangeValid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Min and Max number set by attributes valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeNumberValid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Min and Max number set by attributes greater', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeNumberInvalidGreater',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return label?.textContent;
  });

  expect(result).toBe('Please enter a value less than or equal to 200.');
});

test('Min and Max number set by attributes less', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeNumberInvalidLess',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return label?.textContent;
  });

  expect(result).toBe('Please enter a value greater than or equal to 50.');
});

test('Rules allowed to have a value of zero invalid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeMinZeroInvalidLess',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return label?.textContent;
  });

  expect(result).toBe('Please enter a value greater than or equal to 0.');
});

test('Rules allowed to have a value of zero valid equal', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeMinZeroValidEqual',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Rules allowed to have a value of zero valid greater', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeMinZeroValidGreater',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

// TODO: destroy()

test.only('#1618: Errorlist containing more errors than it should', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm24', {
      rules: {
        val1: 'required',
        val2: 'required',
        val3: 'required',
      },
    })!;

    const inputs = Array.from(
      document.querySelectorAll('#val1, #val2, #val3'),
    ) as HTMLElement[];
    dv.valid(inputs);
    const ret = [v.errorList.length];

    dv.valid(inputs);
    ret.push(v.errorList.length);

    return ret;
  });

  expect(result).toEqual([2, 2]);
});
