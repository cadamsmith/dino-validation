// @ts-check
import { test, expect } from '@playwright/test';

test('constructor', async ({ page }) => {
  await page.goto('');

  const [v1, v2, v1Elements] = await page.evaluate(() => {
    const v1 = dv.validate('#testForm1');
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
    const form = document.querySelector('#testForm1');
    const validator = dv.validate(form);
    const inputs = [...form.querySelectorAll('input')];

    const tests = [dv.valid(inputs)];

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
    const checkable = document.querySelector('#checkable2');
    const tests = [dv.valid(checkable)];

    checkable.checked = true;
    tests.push(dv.valid(checkable));

    checkable.checked = false;
    tests.push(dv.valid(checkable));

    document.querySelector('#checkable3').checked = true;
    tests.push(dv.valid(checkable));

    return tests;
  });

  expect(tests).toEqual([false, true, false, true]);
});

test('valid() ???', async ({ page }) => {
  await page.goto('');

  const tests = await page.evaluate(() => {
    const errorList = [
      {
        name: 'meal',
        message: 'foo',
        element: document.querySelector('#meal'),
      },
    ];
    let v = dv.validate('#testForm3');

    const tests = [v.valid()];

    v.errorList = errorList;
    tests.push(v.valid());

    v.destroy();
    v = dv.validate('#testForm3');
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
    const form = document.querySelector('#testForm28');
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
    const form = document.querySelector('#testForm28');

    // 2. Test using another form outside of validated one
    form.parentElement.insertAdjacentHTML(
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
    const form = document.querySelector('#testForm28');
    const v = dv.validate(form);

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
    const form = document.querySelector('#testForm28');

    // 2. Test using another form outside of validated one
    form.parentElement.insertAdjacentHTML(
      'afterend',
      "<form id='testForm28-other'>" +
        "   <input type='text' name='f28otherinput' required>" +
        "   <input type='text' name='f28input' form='testForm28' required>" +
        '</form>',
    );

    const v = dv.validate(form);

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
    const form = document.querySelector('#testForm28');
    const v = dv.validate(form);

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
    const form = document.querySelector('#testForm28');

    // 2. Test using another form outside of validated one
    form.parentElement.insertAdjacentHTML(
      'afterend',
      "<form id='testForm28-other'>" +
        "   <input type='text' name='f28otherinput' required>" +
        "   <input type='text' name='f28input' form='testForm28' required>" +
        '</form>',
    );

    const v = dv.validate('#testForm28-other');

    return v.elements().length;
  });

  expect(result2).toBe(1);
});

test('Ignore elements that have form attribute set to other forms', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm28');

    // Append a form that contains an input with form attribute set to "testForm28"
    form.parentElement.insertAdjacentHTML(
      'afterend',
      "<form id='testForm28-other'>" +
        "   <input type='text' name='f28otherinput' required>" +
        "   <input type='text' name='f28input' form='testForm28' required>" +
        '</form>',
    );

    // Attach the plugin to the appended form
    const appendedForm = document.querySelector('#testForm28-other');
    dv.validate(appendedForm);

    // 1. simulate typing
    appendedForm
      .querySelector("[name='f28input']")
      .dispatchEvent(new Event('keyup'));
    // 2. simulate focussing in the input
    appendedForm
      .querySelector("[name='f28input']")
      .dispatchEvent(new Event('focusin'));
    // 3. simulate focussing out of the input
    appendedForm
      .querySelector("[name='f28input']")
      .dispatchEvent(new Event('focusout'));

    return true;
  });

  expect(result).toBe(true);
});

// TODO: validate elements outside form with form attribute

// TODO: validate checkboxes outside form with form attribute

test('addMethod', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.addMethod(
      'hi',
      function (blank, value) {
        return value === 'hi';
      },
      'hi me too',
    );

    const method = dv.methods.get('hi');
    const e = document.querySelector('#text1');

    const ret = [method(!!e.value, e.value)];

    e.value = 'hi';
    ret.push(method(!!e.value, e.value), dv.messages.get('hi'));

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
      function (blank, value) {
        return blank || (/\D/.test(value) && /\d/.test(value));
      },
      'Your password must contain at least one number and one letter',
    );

    const v = dv.validate('#form', {
      rules: {
        action: { complicatedPassword: true },
      },
    });

    const e = document.querySelector('#text1');
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
    const v = dv.validate('#testForm1');
    const fnInput = document.querySelector('#firstname');
    const lnInput = document.querySelector('#lastname');

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
    const v = dv.validate('#testForm6');

    const ret = [v.form()];

    document.querySelector('#form6check1').checked = true;
    ret.push(v.form());
    document.querySelector('#form6check2').checked = true;
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
    });

    const radio1 = document.querySelector('#testForm10Radio1');
    const radio2 = document.querySelector('#testForm10Radio2');

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
    const v = dv.validate('#testForm7');

    const optionXA = document.querySelector('#optionxa');
    const optionXB = document.querySelector('#optionxb');

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
    const v = dv.validate('#testForm5');

    const ret = [v.form()];

    [...document.querySelectorAll('#x1, #x2')].forEach((e) => {
      e.value = 'hi';
    });
    ret.push(v.form());

    return ret;
  });

  expect(result).toEqual([false, true]);
});

// TODO: form(): with equalTo and onfocusout=false

test('check(): simple', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm1');
    const firstName = document.querySelector('#firstname');

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
    });

    dv.messages.set('required', '');
    v.form();

    return [v.errorList.length, v.numberOfInvalids()];
  });

  expect(result).toEqual([2, 2]);
});

test('hide(): input', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorLabel = document.querySelector('#errorFirstname');
    const element = document.querySelector('#firstname');

    // TODO: needs to adjust with how the validator shows/hides error labels
    element.value = 'bla';
    const v = dv.validate('#testForm1');
    errorLabel.style.display = 'block';

    return [
      errorLabel.style.display,
      v.element(element),
      errorLabel.style.display,
    ];
  });

  expect(result).toEqual(['block', true, 'none']);
});

test('hide(): radio', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorLabel = document.querySelector('#agreeLabel');
    const element = document.querySelector('#agb');

    element.checked = true;
    const v = dv.validate('#testForm2', { errorClass: 'xerror' });
    errorLabel.style.display = 'block';

    const ret = [errorLabel.style.display];

    v.element(element);
    ret.push(errorLabel.style.display);

    return ret;
  });

  expect(result).toEqual(['block', 'none']);
});

test('hide(): errorWrapper', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorLabel = document.querySelector('#errorWrapper');
    const element = document.querySelector('#meal');

    element.selectedIndex = 1;
    errorLabel.style.display = 'block';

    const ret = [errorLabel.style.display];

    const v = dv.validate('#testForm3', {
      wrapper: 'li',
      errorLabelContainer: '#errorContainer',
    });
    v.element(element);

    ret.push(errorLabel.style.display);

    return ret;
  });

  expect(result).toEqual(['block', 'none']);
});

test('hide(): container', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorLabel = document.querySelector('#errorContainer');
    const mealSelect = document.querySelector('#meal');
    const v = dv.validate('#testForm3', {
      wrapper: 'li',
      errorContainer: '#errorContainer',
    });

    const isVisible = (el) => el.style.display !== 'none';

    v.form();
    const ret = [isVisible(errorLabel)];

    mealSelect.selectedIndex = 1;
    v.form();
    ret.push(isVisible(errorLabel));

    mealSelect.selectedIndex = -1;
    v.element(mealSelect);
    ret.push(isVisible(errorLabel));

    mealSelect.selectedIndex = 1;
    v.element(mealSelect);
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

    let input = document.querySelector('#form [type="radio"]');
    for (const event of events) {
      input.dispatchEvent(event);
    }

    input = document.querySelector("#form [type='checkbox']");
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

    const v = dv.validate('#form', {
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

    const inputs = [...document.querySelectorAll('#formButton1, #formButton2')];
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

    let input = document.querySelector("#form [type='radio']");
    input.dispatchEvent(event);

    input = document.querySelector("#form [type='checkbox']");
    input.dispatchEvent(event);

    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(triggeredEvents);
      });
    });
  });

  expect(result).toBe(2);
});

// TODO: showErrors()

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

    const ret = [dv.valid('#username')];

    const usernameError =
      document.querySelector('#username').nextElementSibling;
    ret.push(
      usernameError.matches('.error:not(input)'),
      usernameError.innerText,
    );

    document.querySelector('#username').value = 'ab';
    ret.push(
      dv.valid('#username'),
      usernameError.matches('.error:not(input)'),
      usernameError.innerText,
    );

    document.querySelector('#username').value = 'abc';
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

    let f1Next = document.querySelector('#testForm4 #f1').nextElementSibling;
    let f2Next = document.querySelector('#testForm4 #f2').nextElementSibling;

    const ret = [f1Next.matches('.error:not(input)'), f2Next];

    const form = document.querySelector('#testForm4');
    const v = dv.validate(form, {
      messages: {
        f1: 'Please!',
        f2: 'Wohoo!',
      },
    });
    v.form();

    f1Next = document.querySelector('#testForm4 #f1').nextElementSibling;
    f2Next = document.querySelector('#testForm4 #f2').nextElementSibling;

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
    const e = document.querySelector('#firstname');

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
    const e = document.querySelector('#firstname');

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

    const e = document.querySelector('#firstnamec');
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
        element.classList.add(errorClass);
        if (element.nextElementSibling.matches('.error:not(input)')) {
          element.nextElementSibling.classList.add(errorClass);
        }
      },
      unhighlight: function (element, errorClass) {
        element.classList.remove(errorClass);
        if (element.nextElementSibling.matches('.error:not(input)')) {
          element.nextElementSibling.classList.remove(errorClass);
        }
      },
      errorClass: 'invalid',
    });

    const e = document.querySelector('#firstname');
    const l = document.querySelector('#errorFirstname');

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
      });

      v.form();
    });
  });

  expect(result).toBe(true);
});

test('option: focusCleanup default false', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm');
    dv.validate(form);
    dv.valid(form);

    const isVisible = (el) => el.style.display !== 'none';

    const usernameError = form.querySelector('#username').nextElementSibling;
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
    const form = document.querySelector('#userForm');
    dv.validate(form, { focusCleanup: true });
    dv.valid(form);

    const isVisible = (el) => el.style.display !== 'none';

    const usernameError = form.querySelector('#username').nextElementSibling;
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
    const form = document.querySelector('#userForm');
    dv.validate(form, {
      focusCleanup: true,
      wrapper: 'span',
    });
    dv.valid(form);

    const username = document.querySelector('#username');

    function isVisible(el) {
      return !!(
        el.offsetWidth ||
        el.offsetHeight ||
        el.getClientRects().length
      );
    }

    function hasVisibleErrors() {
      const wrappers = [...form.querySelectorAll('span')]
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
    const form = document.querySelector('#userForm');
    dv.validate(form, {
      focusCleanup: true,
      wrapper: 'span',
      errorClass: 'error error1 error2',
    });
    dv.valid(form);

    function isVisible(el) {
      return !!(
        el.offsetWidth ||
        el.offsetHeight ||
        el.getClientRects().length
      );
    }

    function containsErrorClass(name) {
      const matches = [...form.querySelectorAll('span')]
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

    const username = document.querySelector('#username');
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
    const v = dv.validate('#userForm');

    const element = document.querySelector('#username');

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
    const v = dv.validate('#testForm22');
    const input = document.querySelector('#tF22Input');

    const ret = [v.getMessage(input, { method: 'minlength', parameters: 5 })];
    input.value = 'abc';
    v.form();
    ret.push(v.errorList[0].message);

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
    const v = dv.validate(form);
    const fakeElement = { form, name: 'bar' };

    v.formatAndAdd(fakeElement, { method: 'maxlength', parameters: 2 });
    const ret = [v.errorList[0].message, v.errorList[0].element.name];

    v.formatAndAdd(fakeElement, { method: 'range', parameters: [2, 4] });
    ret.push(v.errorList[1].message);

    v.formatAndAdd(fakeElement, { method: 'range', parameters: [0, 4] });
    ret.push(v.errorList[2].message);

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
    const v = dv.validate(form);
    const fakeElement = { form, name: 'bar' };

    let scoped = {};

    dv.messages.set('test1', function (param, element) {
      scoped.this = this;
      scoped.param = param;

      return `element ${element.name} is not valid`;
    });

    v.formatAndAdd(fakeElement, { method: 'test1', parameters: 0 });

    return [v.errorList[0].message, scoped.this === v, scoped.param];
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
    });

    document.querySelector('#firstnamec').value = 'abc';
    v.form();
    return v.errorList[0].message;
  });

  expect(result).toBe('at least 5, up to 10');
});

// TODO: elementValue() finds radio/checkboxes only within the current form

// TODO: elementValue() returns the file input's name without the prefix 'C:\\fakepath\\'

// TODO: Required rule should not take precedence over number & digits rules

// TODO: validating multiple checkboxes with 'required'

// TODO: dynamic form

// TODO: idOrName()

// TODO: resetForm()

// TODO: message from title

// TODO: success option

// TODO: success option2

// TODO: success option3

// TODO: successList

// TODO: success isn't called for optional elements with no other rules

// TODO: success is called for optional elements with other rules

// TODO: success callback with element

// TODO: all rules are evaluated

// TODO: messages

// TODO: option: ignore

// TODO: option: subformRequired

test('ignore hidden elements', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm');
    const v = dv.validate(form, {
      rules: { username: 'required' },
    });

    form.reset();
    const ret = [v.form()];

    const username = document.querySelector('#userForm [name=username]');
    dvTestHelpers.hideElement(username);
    ret.push(v.form());

    return ret;
  });

  expect(result).toEqual([false, true]);
});

test('ignore hidden elements at start', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm');
    const v = dv.validate(form, {
      rules: { username: 'required' },
    });

    const username = document.querySelector('#userForm [name=username]');

    form.reset();
    dvTestHelpers.hideElement(username);
    const ret = [v.form()];

    dvTestHelpers.showElement(username);
    ret.push(v.form());

    return ret;
  });

  expect(result).toEqual([true, false]);
});

test('Specify error messages through data attributes', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#dataMessages');
    const name = document.querySelector('#dataMessagesName');
    dv.validate(form);

    form.reset();
    dv.valid(name);

    const label = document.querySelector('#dataMessages .error:not(input)');
    return label.innerText;
  });

  expect(result).toBe('You must enter a value here');
});

// TODO: Specify error messages through data attributes

// TODO: Updates pre-existing label if has error class

// TODO: Min date set by attribute

// TODO: Max date set by attribute

// TODO: Min and Max date set by attributes greater

// TODO: Min and Max date set by attributes less

// TODO: Min date set by attribute valid

// TODO: Max date set by attribute valid

// TODO: Min and max date set by attributes valid

// TODO: Min and max strings set by attributes greater

// TODO: Min and max strings set by attributes less

// TODO: Min, Max strings set by attributes valid

// TODO: Min, Max set by data-rule valid

// TODO: Calling blur on ignored element

// TODO: Min and max type absent set by attributes greater

// TODO: Min and max type absent set by attributes less

// TODO: Min and max type absent set by attributes valid

// TODO: Min and max range absent set by attributes valid

// TODO: Min and max number absent set by attributes valid

// TODO: Min and max number absent set by attributes greater

// TODO: Min and max number absent set by attributes less

// TODO: Rules allowed to have a value of zero invalid

// TODO: Rules allowed to have a value of zero valid equal

// TODO: Rules allowed to have a value of zero valid greater

// TODO: Validation triggered on radio and checkbox via click

// TODO: destroy()

// TODO: #1618: Errorlist containing more errors than it should
