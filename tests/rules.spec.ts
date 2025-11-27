import { test, expect } from '@playwright/test';

test('rules() - internal - input', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const element = document.querySelector('#firstname') as HTMLElement;
    dv.validate('#testForm1');

    return dv.rules(element);
  });

  expect(result).toEqual({ required: true, minlength: 2 });
});

test('rules(), ignore method:false', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const element = document.querySelector('#firstnamec') as HTMLElement;
    dv.validate('#testForm1clean', {
      rules: {
        firstnamec: { required: false, minlength: 2 },
      },
    });

    return dv.rules(element);
  });

  expect(result).toEqual({ minlength: 2 });
});

test('rules() HTML5 required (no value)', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const element = document.querySelector('#testForm11text1') as HTMLElement;
    dv.validate('#testForm11');
    return dv.rules(element);
  });

  expect(result).toEqual({ required: true });
});

test('rules() - internal - select', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const element = document.querySelector('#meal') as HTMLElement;
    dv.validate('#testForm3');

    return dv.rules(element);
  });

  expect(result).toEqual({ required: true });
});

test('rules() - external', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const element = document.querySelector('#text1') as HTMLElement;

    dv.validate('#form', {
      rules: {
        action: { date: true, min: 5 },
      },
    });

    return dv.rules(element);
  });

  expect(result).toEqual({ date: true, min: 5 });
});

test('rules() - external - complete form', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    let executed = false;
    dv.addMethod('verifyTest', function () {
      executed = true;
      return true;
    });

    const v = dv.validate('#form', {
      rules: {
        action: { verifyTest: true },
      },
    })!;
    v.form();

    return executed;
  });

  expect(result).toBe(true);
});

test('rules() - internal - input (2)', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const element = document.querySelector('#form8input') as HTMLElement;
    dv.validate('#testForm8');

    return dv.rules(element);
  });

  expect(result).toEqual({ required: true, number: true, rangelength: [2, 8] });
});

// TODO: rules(), merge min/max to range, minlength/maxlength to rangelength

// TODO: rules(), guarantee that required is at front

// TODO: rules(), evaluate dynamic parameters

test('rules(), class and attribute combinations', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.addMethod(
      'customMethod1',
      function () {
        return false;
      },
      '',
    );
    dv.addMethod(
      'customMethod2',
      function () {
        return false;
      },
      '',
    );

    dv.validate('#v2', {
      rules: {
        'v2-i9': {
          required: true,
          minlength: 2,
          customMethod: true,
        },
      },
    });

    return [
      dv.rules('#v2-i1'),
      dv.rules('#v2-i2'),
      dv.rules('#v2-i3'),
      dv.rules('#v2-i4'),
      dv.rules('#v2-i5'),
      dv.rules('#v2-i9'),
    ];
  });

  expect(result).toEqual([
    { required: true },
    { required: true, email: true },
    { url: true },
    { required: true, minlength: 2 },
    { required: true, minlength: 2, maxlength: 5, customMethod1: '123' },
    { required: true, minlength: 2, customMethod: true },
  ]);
});

// TODO: rules(), dependency checks

// TODO: rules(), add and remove

// TODO: rules(), add and remove static rules

// TODO: rules(), add messages

test('rules(), rangelength attribute as array', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.validate('#testForm13');
    return dv.rules('#cars-select');
  });

  expect(result).toEqual({ required: true, rangelength: [2, 3] });
});

// TODO: rules(), global/local normalizer

// TODO: rules() - on unexpected input

test('rules() - returns dateISO for input type=date', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.validate('#rangesMinDateInvalid');
    return dv.rules('#minDateInvalid');
  });

  expect(result).toEqual({ dateISO: true, min: '2012-12-21' });
});
