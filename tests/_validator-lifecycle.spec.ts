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

test('destroy() - cleans up validator instance', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1') as HTMLFormElement;
    const v = dv.validate(form)!;

    v.form();
    const visibleErrorsBeforeDestroy = v
      .errors()
      .filter((el) => dv_testLib.isVisible(el)).length;

    v.destroy();
    const validatorAfterDestroy = dv.validate(form);
    const visibleErrorsAfterDestroy = validatorAfterDestroy!
      .errors()
      .filter((el) => dv_testLib.isVisible(el)).length;

    return {
      visibleErrorsBeforeDestroy,
      isNewInstance: v !== validatorAfterDestroy,
      visibleErrorsAfterDestroy,
    };
  });

  expect(result.visibleErrorsBeforeDestroy).toBeGreaterThan(0);
  expect(result.isNewInstance).toBe(true);
  expect(result.visibleErrorsAfterDestroy).toBe(0);
});

test('destroy() - removes event handlers', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1') as HTMLFormElement;
    const input = document.querySelector('#firstname') as HTMLInputElement;

    const v = dv.validate(form, {
      onfocusout: function (element) {
        dv.valid(element);
      },
    })!;

    input.value = '';
    input.dispatchEvent(new Event('focusout', { bubbles: true }));
    const visibleErrorsAfterBlur = v
      .errors()
      .filter((el) => dv_testLib.isVisible(el)).length;

    v.destroy();

    input.value = 'valid';
    input.dispatchEvent(new Event('focusin', { bubbles: true }));
    input.value = '';
    input.dispatchEvent(new Event('focusout', { bubbles: true }));

    const v2 = dv.validate(form)!;
    const visibleErrorsAfterDestroy = v2
      .errors()
      .filter((el) => dv_testLib.isVisible(el)).length;

    return {
      visibleErrorsAfterBlur,
      visibleErrorsAfterDestroy,
    };
  });

  expect(result.visibleErrorsAfterBlur).toBeGreaterThan(0);
  expect(result.visibleErrorsAfterDestroy).toBe(0);
});

test('destroy() - clears aria-invalid attributes', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ariaInvalid') as HTMLFormElement;
    const input = document.querySelector(
      '#ariaInvalidFirstName',
    ) as HTMLInputElement;

    const v = dv.validate(form, {
      rules: {
        ariaInvalidFirstName: 'required',
      },
    })!;

    // Validate to set aria-invalid
    input.value = '';
    dv.valid(input);

    const hasAriaInvalidBefore = input.getAttribute('aria-invalid') === 'true';

    v.destroy();

    const hasAriaInvalidAfter = input.getAttribute('aria-invalid') === 'true';

    return { hasAriaInvalidBefore, hasAriaInvalidAfter };
  });

  expect(result.hasAriaInvalidBefore).toBe(true);
  expect(result.hasAriaInvalidAfter).toBe(false);
});

test('destroy() - can re-initialize after destroy', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1') as HTMLFormElement;
    const v1 = dv.validate(form)!;
    v1.destroy();

    const v2 = dv.validate(form)!;
    const isValid = v2.form();

    return {
      v2Exists: Boolean(v2),
      canValidate: typeof isValid === 'boolean',
      hasErrors: v2.size() > 0,
    };
  });

  expect(result.v2Exists).toBe(true);
  expect(result.canValidate).toBe(true);
  expect(result.hasErrors).toBe(true);
});

test('destroy() - removes validator from store', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1') as HTMLFormElement;
    const v1 = dv.validate(form)!;

    const validatorBeforeDestroy = dv.validate(form);
    const isSameBeforeDestroy = v1 === validatorBeforeDestroy;

    v1.destroy();

    const validatorAfterDestroy = dv.validate(form);
    const isDifferentAfterDestroy = v1 !== validatorAfterDestroy;

    return { isSameBeforeDestroy, isDifferentAfterDestroy };
  });

  expect(result.isSameBeforeDestroy).toBe(true);
  expect(result.isDifferentAfterDestroy).toBe(true);
});

test('destroy() - cleans up error labels and classes', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1') as HTMLFormElement;
    const v = dv.validate(form)!;
    v.form();

    const visibleErrorLabelsBeforeDestroy = Array.from(
      form.querySelectorAll('label.error'),
    ).filter((el) => dv_testLib.isVisible(el as HTMLElement)).length;
    const invalidInputsBeforeDestroy =
      form.querySelectorAll('input.error').length;

    v.destroy();

    const visibleErrorLabelsAfterDestroy = Array.from(
      form.querySelectorAll('label.error'),
    ).filter((el) => dv_testLib.isVisible(el as HTMLElement)).length;
    const invalidInputsAfterDestroy =
      form.querySelectorAll('input.error').length;

    return {
      visibleErrorLabelsBeforeDestroy,
      invalidInputsBeforeDestroy,
      visibleErrorLabelsAfterDestroy,
      invalidInputsAfterDestroy,
    };
  });

  expect(result.visibleErrorLabelsBeforeDestroy).toBeGreaterThan(0);
  expect(result.invalidInputsBeforeDestroy).toBeGreaterThan(0);
  expect(result.visibleErrorLabelsAfterDestroy).toBe(0);
  expect(result.invalidInputsAfterDestroy).toBe(0);
});

test('destroy() - multiple forms can be destroyed independently', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form1 = document.querySelector('#testForm1') as HTMLFormElement;
    const form2 = document.querySelector('#testForm2') as HTMLFormElement;

    const v1 = dv.validate(form1)!;
    const v2 = dv.validate(form2)!;

    v1.destroy();

    const v1AfterDestroy = dv.validate(form1);
    const v2AfterDestroy = dv.validate(form2);

    const form1IsNew = v1 !== v1AfterDestroy;
    const form2IsSame = v2 === v2AfterDestroy;

    return { form1IsNew, form2IsSame };
  });

  expect(result.form1IsNew).toBe(true);
  expect(result.form2IsSame).toBe(true);
});
