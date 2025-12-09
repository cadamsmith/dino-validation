import { test, expect } from '@playwright/test';

test('validate on blur', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorFirstname = document.querySelector(
      '#errorFirstname',
    ) as HTMLElement;
    dv_testLib.hideElement(errorFirstname);

    const e = document.querySelector('#firstname') as HTMLInputElement;
    const v = dv.validate('#testForm1')!;

    function checkErrors(expected: number) {
      return v.size() === expected;
    }
    function checkLabels(expected: number) {
      return (
        v.errors().filter((el) => dv_testLib.isVisible(el)).length === expected
      );
    }
    function blur(target: HTMLElement) {
      target.dispatchEvent(new Event('focusout', { bubbles: true }));
      target.dispatchEvent(new Event('blur', { bubbles: true }));
    }

    (document.querySelector('#something') as HTMLInputElement).value = '';
    blur(e);
    const ret = [checkErrors(0), checkLabels(0)];

    e.value = 'h';
    blur(e);
    ret.push(checkErrors(1), checkLabels(1));

    e.value = 'hh';
    blur(e);
    ret.push(checkErrors(0), checkLabels(0));

    e.value = '';
    v.form();
    ret.push(checkErrors(3), checkLabels(3));

    blur(e);
    ret.push(checkErrors(1), checkLabels(3));

    e.value = 'h';
    blur(e);
    ret.push(checkErrors(1), checkLabels(3));

    e.value = 'hh';
    blur(e);
    ret.push(checkErrors(0), checkLabels(2));

    return ret;
  });

  expect(result).toEqual(Array(result.length).fill(true));
});

test('validate on keyup', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const e = document.querySelector('#firstname') as HTMLInputElement;
    const v = dv.validate('#testForm1')!;

    function checkErrors(expected: number) {
      return v.size() === expected;
    }

    function keyup(target: HTMLElement) {
      target.dispatchEvent(new Event('keyup', { bubbles: true }));
    }

    keyup(e);
    const ret = [checkErrors(0)];

    e.value = 'a';
    keyup(e);
    ret.push(checkErrors(0));

    e.value = '';
    v.form();
    ret.push(checkErrors(2));

    keyup(e);
    ret.push(checkErrors(1));

    e.value = 'hh';
    keyup(e);
    ret.push(checkErrors(0));

    e.value = 'h';
    keyup(e);
    ret.push(checkErrors(1));

    e.value = 'hh';
    keyup(e);
    ret.push(checkErrors(0));

    return ret;
  });

  expect(result).toEqual(Array(result.length).fill(true));
});

test('validate on not keyup, only blur', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const e = document.querySelector('#firstname') as HTMLInputElement;
    const v = dv.validate('#testForm1', { onkeyup: false })!;

    function checkErrors(expected: number) {
      return v.size() === expected;
    }

    const ret = [checkErrors(0)];

    e.value = 'a';
    e.dispatchEvent(new Event('keyup', { bubbles: true }));
    ret.push(checkErrors(0));

    e.dispatchEvent(new Event('blur', { bubbles: true }));
    e.dispatchEvent(new Event('focusout', { bubbles: true }));
    ret.push(checkErrors(1));

    return ret;
  });

  expect(result).toEqual(Array(result.length).fill(true));
});

test('validate on keyup and blur', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const e = document.querySelector('#firstname') as HTMLInputElement;
    const v = dv.validate('#testForm1')!;

    function checkErrors(expected: number) {
      return v.size() === expected;
    }

    const ret = [checkErrors(0)];

    e.value = 'a';
    e.dispatchEvent(new Event('keyup', { bubbles: true }));
    ret.push(checkErrors(0));

    e.dispatchEvent(new Event('blur', { bubbles: true }));
    e.dispatchEvent(new Event('focusout', { bubbles: true }));
    ret.push(checkErrors(1));

    return ret;
  });

  expect(result).toEqual(Array(result.length).fill(true));
});

test('validate on keyup and blur (2)', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const e = document.querySelector('#firstname') as HTMLInputElement;
    const v = dv.validate('#testForm1')!;

    function checkErrors(expected: number) {
      return v.size() === expected;
    }

    v.form();
    const ret = [checkErrors(2)];

    e.value = 'a';
    e.dispatchEvent(new Event('keyup', { bubbles: true }));
    ret.push(checkErrors(1));

    e.value = 'aa';
    e.dispatchEvent(new Event('keyup', { bubbles: true }));
    ret.push(checkErrors(0));

    return ret;
  });

  expect(result).toEqual(Array(result.length).fill(true));
});

test("don't revalidate the field when pressing special characters", async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const e = document.querySelector('#firstname') as HTMLInputElement;
    const v = dv.validate('#testForm1')!;

    function checkErrors(expected: number) {
      return v.size() === expected;
    }

    function triggerKeyup(element: HTMLElement, keyCode: number) {
      const event = new KeyboardEvent('keyup', { bubbles: true, keyCode });
      element.dispatchEvent(event);
    }

    const excludedKeys = {
      Shift: 16,
      Ctrl: 17,
      Alt: 18,
      'Caps lock': 20,
      End: 35,
      Home: 36,
      'Left arrow': 37,
      'Up arrow': 38,
      'Right arrow': 39,
      'Down arrow': 40,
      Insert: 45,
      'Num lock': 144,
      'Alt GR': 225,
    };

    // To make sure there is only one error, that one of #firstname field
    e.value = '';
    (document.querySelector('#lastname') as HTMLInputElement).value =
      'something';
    (document.querySelector('#something') as HTMLInputElement).value =
      'something';

    // Validate the form
    v.form();
    const ret = [checkErrors(1)];

    e.value = 'aaa';
    Object.values(excludedKeys).forEach((code) => {
      triggerKeyup(e, code);
      ret.push(checkErrors(1));
    });

    e.value = 'aaaa';
    e.dispatchEvent(new Event('keyup', { bubbles: true }));
    ret.push(checkErrors(0));

    return ret;
  });

  expect(result).toEqual(Array(result.length).fill(true));
});

test('Validation triggered on radio and checkbox via click', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#radiocheckbox') as HTMLFormElement;
    dv.validate(form);

    const ret: any[] = [dv.valid(form)];

    const rc01 = document.querySelector('#radiocheckbox-0-1') as HTMLElement;
    const rc11 = document.querySelector('#radiocheckbox-1-1') as HTMLElement;

    rc01.click();
    rc11.click();

    ret.push(form.querySelector('input.error'));

    return ret;
  });

  expect(result).toEqual([false, null]);
});
