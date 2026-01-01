import { test, expect } from '@playwright/test';
import { FormControlElement } from '../src/types';

test('predefined message not overwritten by addMethod(a, b, undefined)', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const message = 'my custom message';
    dv.messages.set('custom', message);
    dv.addMethod('custom', () => true);

    return dv.messages.get('custom');
  });

  expect(result).toBe('my custom message');
});

test('read messages from metadata', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm9');
    dv.validate(form);
    const e = document.querySelector('#testEmail9') as HTMLInputElement;

    dv.valid(e);
    const ret = [(e.nextElementSibling as HTMLElement).innerText];

    e.value = 'bla';
    dv.valid(e);
    ret.push((e.nextElementSibling as HTMLElement).innerText);

    const g = document.querySelector('#testGeneric9') as HTMLInputElement;
    dv.valid(g);
    ret.push((g.nextElementSibling as HTMLElement).innerText);

    g.value = 'bla';
    dv.valid(g);
    ret.push((g.nextElementSibling as HTMLElement).innerText);

    return ret;
  });

  expect(result).toEqual(['required', 'email', 'generic', 'email']);
});

test('read messages from metadata, with meta option specified, but no metadata in there', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1clean') as HTMLElement;
    dv.validate(form, {
      rules: {
        firstnamec: 'required',
      },
    });

    return dv.valid(form);
  });

  expect(result).toBe(false);
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

test('message from title', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#withTitle')!;
    v.form();
    return v.errorList[0]!.message;
  });

  expect(result).toBe('fromtitle');
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
