import { test, expect } from '@playwright/test';
import { FormControlElement } from '../src/types';

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
    dv.addMethod(
      'verifytest',
      function () {
        executed = true;
        return true;
      },
      '',
      false,
    );

    const v = dv.validate('#form', {
      rules: {
        action: { verifytest: true },
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

test('rules(), class and attribute combinations', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.addMethod(
      'custommethod1',
      function () {
        return false;
      },
      '',
    );
    dv.addMethod(
      'custommethod2',
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
          custommethod: true,
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
    { required: true, minlength: 2, maxlength: 5, custommethod1: '123' },
    { required: true, minlength: 2, custommethod: true },
  ]);
});

test('rules(), rangelength attribute as array', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.validate('#testForm13');
    return dv.rules('#cars-select');
  });

  expect(result).toEqual({ required: true, rangelength: [2, 3] });
});

test('rules() - returns date for input type=date', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.validate('#rangesMinDateInvalid');
    return dv.rules('#minDateInvalid');
  });

  expect(result).toEqual({ date: true, min: '2012-12-21' });
});

test('all rules are evaluated', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const firstName = document.querySelector(
      '#firstname',
    ) as FormControlElement;
    firstName.removeAttribute('data-rule-required');
    firstName.removeAttribute('data-rule-minlength');

    const ret: any[] = [firstName.value];

    document.querySelector('#lastname')!.remove();
    document.querySelector('#errorFirstname')!.remove();

    let timesCalled = 0;
    dv.addMethod(
      'custom1',
      function () {
        timesCalled++;
        return true;
      },
      '',
    );

    const v = dv.validate('#testForm1', {
      rules: {
        firstname: {
          email: true,
          custom1: true,
        },
      },
    })!;

    ret.push(document.querySelector('#testForm1 .error:not(input)'));

    v.form();
    ret.push(document.querySelector('#testForm1 .error:not(input)'));

    dv.valid(firstName);
    ret.push(
      document.querySelector('#testForm1 .error:not(input)'),
      timesCalled,
    );

    return ret;
  });

  expect(result).toEqual(['', null, null, null, 2]);
});

test('Min date set by attribute', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector(
      '#rangesMinDateInvalid',
    ) as HTMLFormElement;
    const name = document.querySelector(
      '#minDateInvalid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#rangesMinDateInvalid .error:not(input)',
    ) as HTMLElement;
    return label.textContent;
  });

  expect(result).toBe(
    'Please enter a value greater than or equal to 2012-12-21.',
  );
});

test('Max date set by attribute', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#maxDateInvalid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#ranges .error:not(input)',
    ) as HTMLElement;
    return label.textContent;
  });

  expect(result).toBe('Please enter a value less than or equal to 2012-12-21.');
});

test('Min and max date set by attributes greater', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeDateInvalidGreater',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#ranges .error:not(input)',
    ) as HTMLElement;
    return label.textContent;
  });

  expect(result).toBe('Please enter a value less than or equal to 2013-01-21.');
});

test('Min and max date set by attributes less', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeDateInvalidLess',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#ranges .error:not(input)',
    ) as HTMLElement;
    return label.textContent;
  });

  expect(result).toBe(
    'Please enter a value greater than or equal to 2012-11-21.',
  );
});

test('Min date set by attribute valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector(
      '#rangeMinDateValid',
    ) as HTMLFormElement;
    const name = document.querySelector('#minDateValid') as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#rangeMinDateValid .error:not(input)',
    );
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Max date set by attribute valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector('#maxDateValid') as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Min and max date set by attributes valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeDateValid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Min and max strings set by attributes greater', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeTextInvalidGreater',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return label?.textContent;
  });

  expect(result).toBe('Please enter a value less than or equal to 200.');
});

test('Min and max strings set by attributes less', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeTextInvalidLess',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#ranges .error:not(input)',
    ) as HTMLElement;
    return label?.innerText;
  });

  expect(result).toBe('Please enter a value greater than or equal to 200.');
});

test('Min and max strings set by attributes valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeTextValid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#ranges .error:not(input)',
    ) as HTMLElement;
    return !!label?.innerText;
  });

  expect(result).toBe(false);
});

test('Min, Max set by data-rule valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeTextDataRuleValid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector(
      '#ranges .error:not(input)',
    ) as HTMLElement;
    return !!label?.innerText;
  });

  expect(result).toBe(false);
});

test('Min and Max type absent set by attributes greater', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeAbsentInvalidGreater',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return label?.textContent;
  });

  expect(result).toBe('Please enter a value less than or equal to 200.');
});

test('Min and Max type absent set by attributes less', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeAbsentInvalidLess',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return label?.textContent;
  });

  expect(result).toBe('Please enter a value greater than or equal to 200.');
});

test('Min and Max type absent set by attributes valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeAbsentValid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Min and Max range set by attributes valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeRangeValid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Min and Max number set by attributes valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeNumberValid',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Min and Max number set by attributes greater', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeNumberInvalidGreater',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return label?.textContent;
  });

  expect(result).toBe('Please enter a value less than or equal to 200.');
});

test('Min and Max number set by attributes less', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeNumberInvalidLess',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return label?.textContent;
  });

  expect(result).toBe('Please enter a value greater than or equal to 50.');
});

test('Rules allowed to have a value of zero invalid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeMinZeroInvalidLess',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return label?.textContent;
  });

  expect(result).toBe('Please enter a value greater than or equal to 0.');
});

test('Rules allowed to have a value of zero valid equal', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeMinZeroValidEqual',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Rules allowed to have a value of zero valid greater', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#ranges') as HTMLFormElement;
    const name = document.querySelector(
      '#rangeMinZeroValidGreater',
    ) as FormControlElement;

    dv.validate(form);
    form.reset();
    dv.valid(name);

    const label = document.querySelector('#ranges .error:not(input)');
    return !!label?.textContent;
  });

  expect(result).toBe(false);
});

test('Required rule should not take precedence over number & digits rules', async ({
  page,
}) => {
  await page.goto('');

  const [numberResult, digitsResult, expectedNumber, expectedDigits] =
    await page.evaluate(() => {
      const form = document.querySelector('#form') as HTMLFormElement;

      // Test number rule
      const input1 = document.createElement('input');
      input1.type = 'text';
      input1.name = 'testInput1';
      input1.value = 'abc'; // Invalid for number
      form.appendChild(input1);

      const v1 = dv.validate(form, {
        rules: {
          testInput1: {
            required: true,
            number: true,
          },
        },
      })!;

      v1.form();
      const numberMessage = v1.errorList[0]?.message;
      form.removeChild(input1);
      v1.destroy();

      // Test digits rule
      const input2 = document.createElement('input');
      input2.type = 'text';
      input2.name = 'testInput2';
      input2.value = '12.34'; // Invalid for digits (contains decimal)
      form.appendChild(input2);

      const v2 = dv.validate(form, {
        rules: {
          testInput2: {
            required: true,
            digits: true,
          },
        },
      })!;

      v2.form();
      const digitsMessage = v2.errorList[0]?.message;
      form.removeChild(input2);

      return [
        numberMessage,
        digitsMessage,
        dv.messages.get('number'),
        dv.messages.get('digits'),
      ];
    });

  // Should get number validation error, not required error
  expect(numberResult).toBe(expectedNumber);

  // Should get digits validation error, not required error
  expect(digitsResult).toBe(expectedDigits);
});
