import { expect, test } from '@playwright/test';
import { FormControlElement } from '../src/types';

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
