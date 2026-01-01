import { expect, test } from '@playwright/test';
import { FormControlElement } from '../src/types';

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
