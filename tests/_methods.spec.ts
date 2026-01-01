import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

interface TestData {
  expected: boolean;
  blank?: boolean;
  value?: string;
  element?: string;
  param?: unknown;
}

async function runMethodTests(
  page: Page,
  methodName: string,
  form: string,
  testData: TestData[],
): Promise<boolean[]> {
  return await page.evaluate(
    ({ methodName, form, testData }) => {
      const v = dv.validate(form)!;
      const method = dv.methods.get(methodName)!;

      const checks: boolean[] = [];

      for (const entry of testData) {
        const { expected, param } = entry;
        let blank: boolean;
        let value: string;
        let values: string[];
        let el: HTMLElement;

        if (!entry.element) {
          el = document.querySelector('#firstname') as HTMLInputElement;
          (el as HTMLInputElement).value = entry.value!;
          blank = entry.blank!;
          value = entry.value!;
          values = [entry.value!];
        } else {
          el = document.querySelector(entry.element) as HTMLElement;
          blank = dv_testLib.isBlankElement(el as any, v.currentForm);
          const rawValue = dv_testLib.elementValue(el as any, v.currentForm);
          if (Array.isArray(rawValue)) {
            value = rawValue.join(',');
            values = rawValue;
          } else {
            value = rawValue;
            values = [rawValue];
          }
        }

        const length = dv_testLib.getValueLength(el as any, v.currentForm);

        checks.push(
          method.call(v, {
            blank,
            value,
            values,
            length,
            element: el as any,
            param,
          }) === expected,
        );
      }

      return checks;
    },
    { methodName, form, testData },
  );
}

test('default messages', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const checks: boolean[] = [];
    dv.methods.keys().forEach((key) => {
      checks.push(!!dv.messages.get(key));
    });
    return checks;
  });

  for (let i = 0; i < result.length; i++) {
    expect(result[i]).toBe(true);
  }
});

test('digits', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'digits', '#form', [
    { blank: false, value: '123', expected: true },

    { blank: false, value: '123.000', expected: false },
    { blank: false, value: '123.00,00', expected: false },
    { blank: false, value: '123.0.0,0', expected: false },
    { blank: false, value: 'x123', expected: false },
    { blank: false, value: '100.100,0,0', expected: false },
  ]);

  for (let i = 0; i < results.length; i++) {
    expect(results[i]).toBe(true);
  }
});

test('url', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'url', '#form', [
    {
      blank: false,
      value: 'http://bassistance.de/jquery/plugin.php?bla=blu',
      expected: true,
    },
    {
      blank: false,
      value: 'https://bassistance.de/jquery/plugin.php?bla=blu',
      expected: true,
    },
    {
      blank: false,
      value: 'ftp://bassistance.de/jquery/plugin.php?bla=blu',
      expected: true,
    },
    { blank: false, value: 'http://www.føtex.dk/', expected: true },
    { blank: false, value: 'http://bösendorfer.de/', expected: true },
    { blank: false, value: 'http://142.42.1.1', expected: true },
    { blank: false, value: 'http://pro.photography', expected: true },
    {
      blank: false,
      value: '//code.jquery.com/jquery-1.11.3.min.js',
      expected: true,
    },
    { blank: false, value: '//142.42.1.1', expected: true },

    {
      blank: false,
      value: 'htp://code.jquery.com/jquery-1.11.3.min.js',
      expected: false,
    },
    { blank: false, value: 'http://192.168.8.', expected: false },
    { blank: false, value: 'http://bassistance', expected: false },
    { blank: false, value: 'http://bassistance.', expected: false },
    { blank: false, value: 'http://bassistance,de', expected: false },
    { blank: false, value: 'http://bassistance;de', expected: false },
    { blank: false, value: 'http://.bassistancede', expected: false },
    { blank: false, value: 'bassistance.de', expected: false },
  ]);

  for (let i = 0; i < results.length; i++) {
    expect(results[i]).toBe(true);
  }
});

test('email', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'email', '#form', [
    { blank: false, value: 'name@domain.tld', expected: true },
    { blank: false, value: 'name@domain.tl', expected: true },
    { blank: false, value: 'bart+bart@tokbox.com', expected: true },
    { blank: false, value: 'bart+bart@tokbox.travel', expected: true },
    { blank: false, value: 'n@d.tld', expected: true },
    { blank: false, value: 'bla.blu@g.mail.com', expected: true },
    { blank: false, value: 'name@domain', expected: true },
    { blank: false, value: 'name.@domain.tld', expected: true },
    { blank: false, value: 'name@website.a', expected: true },
    { blank: false, value: 'name@pro.photography', expected: true },

    { blank: false, value: 'ole@føtex.dk', expected: false },
    { blank: false, value: 'jörn@bassistance.de', expected: false },
    { blank: false, value: 'name', expected: false },
    { blank: false, value: 'test@test-.com', expected: false },
    { blank: false, value: 'name@', expected: false },
    { blank: false, value: 'name,@domain.tld', expected: false },
    { blank: false, value: 'name;@domain.tld', expected: false },
    { blank: false, value: 'name;@domain.tld.', expected: false },
  ]);

  for (let i = 0; i < results.length; i++) {
    expect(results[i]).toBe(true);
  }
});

test('number', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'number', '#form', [
    { blank: true, value: '', expected: true },
    { blank: false, value: '123', expected: true },
    { blank: false, value: '123000', expected: true },
    { blank: false, value: '-123', expected: true },
    { blank: false, value: '123,000', expected: true },
    { blank: false, value: '-123,000', expected: true },
    { blank: false, value: '123,000.00', expected: true },
    { blank: false, value: '-123,000.00', expected: true },
    { blank: false, value: '123000.12', expected: true },
    { blank: false, value: '-123000.12', expected: true },
    { blank: false, value: '123.000', expected: true },
    { blank: false, value: '123,000.00', expected: true },
    { blank: false, value: '-123,000.00', expected: true },
    { blank: false, value: '.100', expected: true },
    { blank: false, value: '-.100', expected: true },

    { blank: false, value: '-', expected: false },
    { blank: false, value: '123.000,00', expected: false },
    { blank: false, value: '123.0.0,0', expected: false },
    { blank: false, value: 'x123', expected: false },
    { blank: false, value: '100.100,0,0', expected: false },
    { blank: false, value: '1230,000.00', expected: false },
  ]);

  for (let i = 0; i < results.length; i++) {
    expect(results[i]).toBe(true);
  }
});

test('date', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'date', '#form', [
    { blank: false, value: '06/06/1990', expected: true },
    { blank: false, value: '6/6/06', expected: true },

    { blank: false, value: '1990x-06-06', expected: false },
  ]);

  for (let i = 0; i < results.length; i++) {
    expect(results[i]).toBe(true);
  }
});

test('dateISO', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'dateISO', '#form', [
    { blank: false, value: '1990-06-06', expected: true },
    { blank: false, value: '1990-01-01', expected: true },
    { blank: false, value: '1990-01-31', expected: true },
    { blank: false, value: '1990-12-01', expected: true },
    { blank: false, value: '1990-12-31', expected: true },
    { blank: false, value: '1990/06/06', expected: true },
    { blank: false, value: '1990-6-6', expected: true },
    { blank: false, value: '1990/6/6', expected: true },

    { blank: false, value: '1990-106-06', expected: false },
    { blank: false, value: '190-06-06', expected: false },
    { blank: false, value: '1990-00-06', expected: false },
    { blank: false, value: '1990-13-01', expected: false },
    { blank: false, value: '1990-01-00', expected: false },
    { blank: false, value: '1990-01-32', expected: false },
    { blank: false, value: '1990-13-32', expected: false },
  ]);

  for (let i = 0; i < results.length; i++) {
    expect(results[i]).toBe(true);
  }
});

test('required', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'required', '#form', [
    { element: '#text1', expected: true },
    { element: '#select2', expected: true },
    { element: '#area1', expected: true },
    { element: '#pw1', expected: true },
    { element: '#radio2', expected: true },
    { element: '#radio3', expected: true },
    { element: '#check1', expected: true },
    { element: '#select3', expected: true },
    { element: '#select4', expected: true },

    { element: '#text1b', expected: false },
    { element: '#hidden2', expected: false },
    { element: '#area2', expected: false },
    { element: '#pw2', expected: false },
    { element: '#radio1', expected: false },
    { element: '#check2', expected: false },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});

test('minlength', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'minlength', '#form', [
    { element: '#text1', param: 2, expected: true },
    { element: '#text1c', param: 2, expected: true },
    { element: '#text3', param: 2, expected: true },
    { element: '#check2', param: 2, expected: true },
    { element: '#check3', param: 2, expected: true },
    { element: '#select1', param: 2, expected: true },
    { element: '#select3', param: 2, expected: true },
    { element: '#select4', param: 2, expected: true },
    { element: '#select5', param: 2, expected: true },

    { element: '#text2', param: 2, expected: false },
    { element: '#check1', param: 2, expected: false },
    { element: '#select2', param: 2, expected: false },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});

test('maxlength', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'maxlength', '#form', [
    { element: '#text1', param: 4, expected: true },
    { element: '#text2', param: 4, expected: true },
    { element: '#text2', param: 4, expected: true },
    { element: '#check1', param: 4, expected: true },
    { element: '#check2', param: 4, expected: true },
    { element: '#select1', param: 4, expected: true },
    { element: '#select2', param: 4, expected: true },
    { element: '#select3', param: 4, expected: true },

    { element: '#text3', param: 4, expected: false },
    { element: '#check3', param: 4, expected: false },
    { element: '#select4', param: 4, expected: false },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});

test('rangelength', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'rangelength', '#form', [
    { element: '#text1', param: [2, 4], expected: true },

    { element: '#text2', param: [2, 4], expected: false },
    { element: '#text3', param: [2, 4], expected: false },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});

test('min', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'min', '#form', [
    { element: '#value2', param: 8, expected: true },
    { element: '#value3', param: 8, expected: true },

    { element: '#value1', param: 8, expected: false },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});

test('max', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'max', '#form', [
    { element: '#value1', param: 12, expected: true },
    { element: '#value2', param: 12, expected: true },

    { element: '#value3', param: 12, expected: false },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});

test('range', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'range', '#form', [
    { element: '#value2', param: [4, 12], expected: true },

    { element: '#value1', param: [4, 12], expected: false },
    { element: '#value3', param: [4, 12], expected: false },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});

test('equalTo', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'equalTo', '#form', [
    { blank: false, value: 'Test', param: '#text1', expected: true },
    { blank: false, value: 'T', param: '#text2', expected: true },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});

test('creditcard', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'creditcard', '#form', [
    { blank: false, value: '4111-1111-1111-1111', expected: true },
    { blank: false, value: '4111 1111 1111 1111', expected: true },

    { blank: false, value: '41111', expected: false },
    { blank: false, value: 'asdf', expected: false },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});

test('regex - basic pattern matching', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'regex', '#form', [
    {
      blank: false,
      value: 'ABC123',
      param: '^[A-Z]{3}\\d{3}$',
      expected: true,
    },
    {
      blank: false,
      value: '555-1234',
      param: '^\\d{3}-\\d{4}$',
      expected: true,
    },
    { blank: false, value: 'test', param: '^test$', expected: true },

    {
      blank: false,
      value: 'ABC123XYZ',
      param: '^[A-Z]{3}\\d{3}$',
      expected: false,
    },
    {
      blank: false,
      value: 'abc123',
      param: '^[A-Z]{3}\\d{3}$',
      expected: false,
    },
    {
      blank: false,
      value: 'AB123',
      param: '^[A-Z]{3}\\d{3}$',
      expected: false,
    },

    { blank: true, value: '', param: '^[A-Z]+$', expected: true },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});

test('regex - complex real-world patterns', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'regex', '#form', [
    {
      blank: false,
      value: '(555) 123-4567',
      param: '^\\(\\d{3}\\) \\d{3}-\\d{4}$',
      expected: true,
    },
    { blank: false, value: '12345', param: '^\\d{5}$', expected: true },
    {
      blank: false,
      value: '12345-6789',
      param: '^\\d{5}(-\\d{4})?$',
      expected: true,
    },
    {
      blank: false,
      value: 'user@example.com',
      param: '^[^@]+@[^@]+\\.[^@]+$',
      expected: true,
    },

    {
      blank: false,
      value: '(555)123-4567',
      param: '^\\(\\d{3}\\) \\d{3}-\\d{4}$',
      expected: false,
    },
    { blank: false, value: '1234', param: '^\\d{5}$', expected: false },
    {
      blank: false,
      value: 'userexample.com',
      param: '^[^@]+@[^@]+\\.[^@]+$',
      expected: false,
    },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});

test('regex - special characters and edge cases', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'regex', '#form', [
    {
      blank: false,
      value: 'test.com',
      param: '^[a-z]+\\.[a-z]+$',
      expected: true,
    },
    {
      blank: false,
      value: 'test[123]',
      param: '^[a-z]+\\[\\d+\\]$',
      expected: true,
    },
    { blank: false, value: 'a1b2c3', param: '^[a-z\\d]+$', expected: true },

    {
      blank: false,
      value: 'test@com',
      param: '^[a-z]+\\.[a-z]+$',
      expected: false,
    },
    {
      blank: false,
      value: 'test(123)',
      param: '^[a-z]+\\[\\d+\\]$',
      expected: false,
    },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});

test('nonalphamin - password strength validation', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'nonalphamin', '#form', [
    { blank: false, value: 'Pass@123', param: 1, expected: true },
    { blank: false, value: 'P@ss#word!', param: 3, expected: true },
    { blank: false, value: 'test!', param: 1, expected: true },
    { blank: false, value: '!!!###', param: 5, expected: true },
    { blank: false, value: '!!!###$$$', param: 6, expected: true },

    { blank: false, value: 'Password', param: 1, expected: false },
    { blank: false, value: 'Pass@123', param: 3, expected: false },
    { blank: false, value: 'NoSpecialChars', param: 1, expected: false },
    { blank: false, value: 'test!', param: 2, expected: false },

    { blank: true, value: '', param: 1, expected: true },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});

test('nonalphamin - various special character types', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'nonalphamin', '#form', [
    { blank: false, value: 'test@', param: 1, expected: true },
    { blank: false, value: 'test@#', param: 2, expected: true },
    { blank: false, value: 'test$%^', param: 3, expected: true },
    { blank: false, value: 'test&*()', param: 4, expected: true },
    { blank: false, value: 'test test', param: 1, expected: true },
    { blank: false, value: 'a b c d', param: 3, expected: true },

    { blank: false, value: 'test', param: 1, expected: false },
    { blank: false, value: 'test@', param: 2, expected: false },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});

test('nonalphamin - edge cases', async ({ page }) => {
  await page.goto('');

  const results = await runMethodTests(page, 'nonalphamin', '#form', [
    { blank: false, value: 'NoSpecialChars', param: 0, expected: true },
    { blank: false, value: 'test-test.test', param: 2, expected: true },
    { blank: false, value: 'hello.world', param: 1, expected: true },
    { blank: false, value: 'test,test;test', param: 2, expected: true },
    { blank: false, value: 'under_score', param: 0, expected: true },

    { blank: false, value: 'hello.world', param: 2, expected: false },
    { blank: false, value: 'test-test', param: 2, expected: false },
    { blank: false, value: 'under_score', param: 1, expected: false },
  ]);

  results.forEach((r) => expect(r).toBe(true));
});
