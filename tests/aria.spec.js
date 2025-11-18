// @ts-check
import { test, expect } from '@playwright/test';

test('Invalid field adds aria-invalid=true', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const ariaInvalidFirstName = document.querySelector(
      '#ariaInvalidFirstName',
    );
    const form = document.querySelector('#ariaInvalid');

    dv.validate(form, {
      rules: {
        ariaInvalidFirstName: 'required',
      },
    });

    ariaInvalidFirstName.value = '';
    dv.valid(ariaInvalidFirstName);

    return ariaInvalidFirstName.getAttribute('aria-invalid');
  });

  expect(result).toBe('true');
});

test('Valid field adds aria-invalid=false', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const ariaInvalidFirstName = document.querySelector(
      '#ariaInvalidFirstName',
    );
    const form = document.querySelector('#ariaInvalid');

    dv.validate(form, {
      rules: {
        ariaInvalidFirstName: 'required',
      },
    });

    ariaInvalidFirstName.value = 'not empty';
    dv.valid(ariaInvalidFirstName);

    return [
      ariaInvalidFirstName.getAttribute('aria-invalid'),
      form.querySelectorAll('[aria-invalid=false]').length,
    ];
  });

  expect(result).toEqual(['false', 1]);
});

test('resetForm(): removes all aria-invalid attributes', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const ariaInvalidFirstName = document.querySelector(
      '#ariaInvalidFirstName',
    );
    const form = document.querySelector('#ariaInvalid');

    const v = dv.validate(form, {
      rules: {
        ariaInvalidFirstName: 'required',
      },
    });

    ariaInvalidFirstName.value = 'not empty';
    dv.valid(ariaInvalidFirstName);
    v.resetForm();

    return form.querySelectorAll('[aria-invalid=false]').length;
  });

  expect(result).toBe(0);
});
