import { test, expect } from '@playwright/test';

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
