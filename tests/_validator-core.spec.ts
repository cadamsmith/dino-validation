import { expect, test } from '@playwright/test';
import { FormControlElement } from '../src/types';

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
