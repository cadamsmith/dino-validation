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
    ret.push(method(!!e.value, e.value), dv.messages.get("hi"));

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

    v.form();
    const ret = [errorLabel.style.display];

    mealSelect.selectedIndex = 1;
    v.form();
    ret.push(errorLabel.style.display);

    mealSelect.selectedIndex = -1;
    v.element(mealSelect);
    ret.push(errorLabel.style.display);

    mealSelect.selectedIndex = 1;
    v.element(mealSelect);
    ret.push(errorLabel.style.display);

    return ret;
  });

  expect(result).toEqual(['block', 'none', 'block', 'none']);
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

    const inputs = [
      ...document.querySelectorAll("#formButton1, #formButton2")
    ];
    for (const event of events) {
      inputs.forEach(i => i.dispatchEvent(event));
    }

    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(triggeredEvents);
      });
    });
  });

  expect(result).toBe(6);
});

test("validation triggered on radio/checkbox when using mouseclick", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    let triggeredEvents = 0;
    dv.validate("#form", {
      onclick: function() {
        triggeredEvents++;
      }
    });

    const event = new Event("click", { bubbles: true });

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

test("showErrors(), allow empty string and null as default message", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    dv.validate("#userForm", {
      rules: {
        username: {
          required: true,
          minlength: 3
        }
      },
      messages: {
        username: {
          required: "",
          minlength: "too short"
        }
      }
    });

    const ret = [dv.valid("#username")];

    const usernameError = document.querySelector("#username").nextElementSibling;
    ret.push(usernameError.matches(".error:not(input)"), usernameError.innerText);

    document.querySelector("#username").value = "ab";
    ret.push(dv.valid("#username"), usernameError.matches(".error:not(input)"), usernameError.innerText);

    document.querySelector("#username").value = "abc";
    ret.push(dv.valid("#username"), usernameError.matches(".error:not(input)"), usernameError.style.display);

    return ret;
  });

  expect(result).toEqual([false, true, "", false, true, "too short", true, true, "none"]);
});

test("showErrors() - external messages", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    dv.addMethod("foo", function() { return false; });
    dv.addMethod("bar", function() { return false; });

    let f1Next = document.querySelector("#testForm4 #f1").nextElementSibling;
    let f2Next = document.querySelector("#testForm4 #f2").nextElementSibling;

    const ret = [
      f1Next.matches(".error:not(input)"),
      f2Next,
    ];

    const form = document.querySelector("#testForm4");
    const v = dv.validate(form, {
      messages: {
        f1: "Please!",
        f2: "Wohoo!"
      }
    });
    v.form();

    f1Next = document.querySelector("#testForm4 #f1").nextElementSibling;
    f2Next = document.querySelector("#testForm4 #f2").nextElementSibling;

    ret.push(
      f1Next.matches(".error:not(input)"),
      f1Next.innerText,
      f2Next.matches(".error:not(input)"),
      f2Next.innerText
    );

    return ret;
  });

  expect(result).toEqual([false, null, true, "Please!", true, "Wohoo!"]);
});

test("option: (un)highlight, default", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    dv.validate("#testForm1");
    const e = document.querySelector("#firstname");

    const ret = [
      e.classList.contains("error"),
      e.classList.contains("valid")
    ];

    dv.valid(e);

    ret.push(
      e.classList.contains("error"),
      e.classList.contains("valid")
    );

    e.value = "hithere";
    dv.valid(e);

    ret.push(
      e.classList.contains("error"),
      e.classList.contains("valid")
    );

    return ret;
  });

  expect(result).toEqual([false, false, true, false, false, true]);
});

test("option: (un)highlight, nothing", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    dv.validate("#testForm1", {
      highlight: false,
      unhighlight: false
    });
    const e = document.querySelector("#firstname");

    const ret = [e.classList.contains("error")];

    dv.valid(e);
    ret.push(e.classList.contains("error"));

    dv.valid(e);
    ret.push(e.classList.contains("error"));

    return ret;
  });

  expect(result).toEqual([false, false, false]);
});

test("option: (un)highlight, custom", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    const ret = [];

    dv.validate("#testForm1clean", {
      highlight: function(element, errorClass) {
        ret.unshift(errorClass);
        element.style.display = "none";
      },
      unhighlight: function(element, errorClass) {
        ret.unshift(errorClass);
        element.style.display = "block";
      },
      ignore: "",
      errorClass: "invalid",
      rules: {
        firstnamec: "required"
      }
    });

    const e = document.querySelector("#firstnamec");
    ret.push(e.style.display !== "none");

    dv.valid(e);
    ret.push(e.style.display);

    e.value = "hithere";
    dv.valid(e);
    ret.push(e.style.display);

    return ret;
  });

  expect(result).toEqual(["invalid", "invalid", true, "none", "block"]);
});

test("option: (un)highlight, custom2", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    dv.validate("#testForm1", {
      highlight: function(element, errorClass) {
        element.classList.add(errorClass);
        if (element.nextElementSibling.matches(".error:not(input)")) {
          element.nextElementSibling.classList.add(errorClass);
        }
      },
      unhighlight: function(element, errorClass) {
        element.classList.remove(errorClass);
        if (element.nextElementSibling.matches(".error:not(input)")) {
          element.nextElementSibling.classList.remove(errorClass);
        }
      },
      errorClass: "invalid"
    });

    const e = document.querySelector("#firstname");
    const l = document.querySelector("#errorFirstname");

    const ret = [e.matches(".invalid"), l.matches(".invalid")];

    dv.valid(e);
    ret.push(e.matches(".invalid"), l.matches(".invalid"));

    e.value = "hithere";
    dv.valid(e);
    ret.push(e.matches(".invalid"), l.matches(".invalid"));

    return ret;
  });

  expect(result).toEqual([false, false, true, true, false, false]);
});
