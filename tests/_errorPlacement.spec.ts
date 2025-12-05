import { test, expect } from '@playwright/test';

test('elements() order', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const container = document.querySelector('#orderContainer') as HTMLElement;
    const v = dv.validate('#elementsOrder', {
      errorLabelContainer: '#orderContainer',
    })!;

    const ret = [v.elements().map((el) => el.getAttribute('id'))];

    v.form();
    ret.push(Array.from(container.children).map((el) => el.getAttribute('id')));

    return ret;
  });

  expect(result[0]).toEqual([
    'order1',
    'order2',
    'order3',
    'order4',
    'order5',
    'order6',
  ]);
  expect(result[1]).toEqual([
    'order1-error',
    'order2-error',
    'order3-error',
    'order4-error',
    'order5-error',
    'order6-error',
  ]);
});

// TODO: error containers, simple

// TODO: error containers, with labelcontainer I

// TODO: errorcontainer, show/hide only on submit

// TODO: test label used as error container

// TODO: test error placed adjacent to descriptive label

// TODO: test descriptive label used alongside error label

test('test custom errorElement', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm') as HTMLFormElement;
    const field = document.querySelector('#username') as HTMLInputElement;

    const v = dv.validate(form, {
      messages: {
        username: 'missing',
      },
      errorElement: 'label',
    })!;

    function hasError(element: HTMLElement, text: string) {
      const errors = v.errorsFor(element as any);
      return errors.length === 1 && errors[0]!.innerText === text;
    }

    function noErrorsFor(element: HTMLElement) {
      const errors = v.errorsFor(element as any);
      return (
        errors.length === 0 ||
        (errors.every((e) => !dv_testLib.isVisible(e)) &&
          errors[0]!.innerText === '')
      );
    }

    const ret: boolean[] = [dv.valid(field), hasError(field, 'missing')];

    field.value = 'foo';
    ret.push(dv.valid(field), noErrorsFor(field));

    return ret;
  });

  expect(result).toEqual([false, true, true, true]);
});

test('test existing label used as error element', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm14') as HTMLFormElement;
    const field = document.querySelector('#testForm14text') as HTMLInputElement;

    const v = dv.validate(form, { errorElement: 'label' })!;

    function hasError(element: HTMLElement, text: string) {
      const errors = v.errorsFor(element as any);
      return errors.length === 1 && errors[0]!.innerText === text;
    }

    function noErrorsFor(element: HTMLElement) {
      const errors = v.errorsFor(element as any);
      return (
        errors.length === 0 ||
        (errors.every((e) => !dv_testLib.isVisible(e)) &&
          errors[0]!.innerText === '')
      );
    }

    const ret = [dv.valid(field), hasError(field, 'required')];

    field.value = 'foo';
    ret.push(dv.valid(field), noErrorsFor(field));

    return ret;
  });

  expect(result).toEqual([false, true, true, true]);
});

test('test existing non-label used as error element', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm15') as HTMLFormElement;
    const field = document.querySelector('#testForm15text') as HTMLInputElement;

    const v = dv.validate(form, { errorElement: 'span' })!;

    function hasError(element: HTMLElement, text: string) {
      const errors = v.errorsFor(element as any);
      return errors.length === 1 && errors[0]!.innerText === text;
    }

    function noErrorsFor(element: HTMLElement) {
      const errors = v.errorsFor(element as any);
      return (
        errors.length === 0 ||
        (errors.every((e) => !dv_testLib.isVisible(e)) &&
          errors[0]!.innerText === '')
      );
    }

    const ret = [dv.valid(field), hasError(field, 'required')];

    field.value = 'foo';
    ret.push(dv.valid(field), noErrorsFor(field));

    return ret;
  });

  expect(result).toEqual([false, true, true, true]);
});

test('test aria-describedby with input names contains CSS-selector meta-characters', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm21') as HTMLFormElement;
    const field = document.querySelector(
      "#testForm21\\!\\#\\$\\%\\&\\'\\(\\)\\*\\+\\,\\.\\/\\:\\;\\<\\=\\>\\?\\@\\[\\\\\\]\\^\\`\\{\\|\\}\\~",
    ) as HTMLInputElement;

    const ret: any[] = [field.getAttribute('aria-describedby')];

    dv.validate(form, {
      errorElement: 'span',
      errorPlacement: function () {
        // do something
      },
    });

    // Validate the element
    ret.push(dv.valid(field), field.getAttribute('aria-describedby'));

    // Re-run validation
    field.value = 'some';
    field.dispatchEvent(new Event('keyup', { bubbles: true }));

    field.value = 'something';
    field.dispatchEvent(new Event('keyup', { bubbles: true }));

    ret.push(field.getAttribute('aria-describedby'));

    field.value = 'something something';
    field.dispatchEvent(new Event('keyup', { bubbles: true }));

    ret.push(field.getAttribute('aria-describedby'));

    return ret;
  });

  const expectedDescriber = "testForm21!#$%&'()*+,./:;<=>?@[\\]^`{|}~-error";

  expect(result).toEqual([
    null,
    false,
    expectedDescriber,
    expectedDescriber,
    expectedDescriber,
  ]);
});

test('test existing non-error aria-describedby', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm17') as HTMLFormElement;
    const field = document.querySelector('#testForm17text') as HTMLInputElement;

    const ret: any[] = [field.getAttribute('aria-describedby')];

    const v = dv.validate(form, { errorElement: 'span' })!;

    function hasError(element: HTMLElement, text: string) {
      const errors = v.errorsFor(element as any);
      return errors.length === 1 && errors[0]!.innerText === text;
    }

    function noErrorsFor(element: HTMLElement) {
      const errors = v.errorsFor(element as any);
      return (
        errors.length === 0 ||
        (errors.every((e) => !dv_testLib.isVisible(e)) &&
          errors[0]!.innerText === '')
      );
    }

    ret.push(
      dv.valid(field),
      field.getAttribute('aria-describedby'),
      hasError(field, 'required'),
    );

    field.value = 'foo';

    ret.push(
      dv.valid(field),
      noErrorsFor(field),
      (document.querySelector('#testForm17text-description') as HTMLElement)
        .textContent,
      (document.querySelector('#testForm17text-error') as HTMLElement)
        .textContent,
    );

    return ret;
  });

  expect(result).toEqual([
    'testForm17text-description',
    false,
    'testForm17text-description testForm17text-error',
    true,
    true,
    true,
    'This is where you enter your data',
    '',
  ]);
});

test('test pre-assigned non-error aria-describedby', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm17') as HTMLFormElement;
    const field = document.querySelector('#testForm17text') as HTMLInputElement;

    // Pre-assign error identifier
    field.setAttribute(
      'aria-describedby',
      'testForm17text-description testForm17text-error',
    );
    const v = dv.validate(form, { errorElement: 'span' })!;

    function hasError(element: HTMLElement, text: string) {
      const errors = v.errorsFor(element as any);
      return errors.length === 1 && errors[0]!.innerText === text;
    }

    function noErrorsFor(element: HTMLElement) {
      const errors = v.errorsFor(element as any);
      return (
        errors.length === 0 ||
        (errors.every((e) => !dv_testLib.isVisible(e)) &&
          errors[0]!.innerText === '')
      );
    }

    const ret = [
      dv.valid(field),
      field.getAttribute('aria-describedby'),
      hasError(field, 'required'),
    ];

    field.value = 'foo';
    ret.push(
      dv.valid(field),
      noErrorsFor(field),
      (document.querySelector('#testForm17text-description') as HTMLElement)
        .textContent,
      (document.querySelector('#testForm17text-error') as HTMLElement)
        .textContent,
    );

    return ret;
  });

  expect(result).toEqual([
    false,
    'testForm17text-description testForm17text-error',
    true,
    true,
    true,
    'This is where you enter your data',
    '',
  ]);
});

test('test id/name containing brackets', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm18') as HTMLFormElement;
    const field = document.querySelector(
      '#testForm18\\[text\\]',
    ) as HTMLInputElement;

    const v = dv.validate(form, {
      errorElement: 'span',
      messages: {
        'testForm18[text]': {
          required: 'required',
        },
      },
    })!;

    function hasError(element: HTMLElement, text: string) {
      const errors = v.errorsFor(element as any);
      return errors.length === 1 && errors[0]!.innerText === text;
    }

    dv.valid(form);
    dv.valid(field);

    return hasError(field, 'required');
  });

  expect(result).toBe(true);
});

test('test id/name containing $', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm19') as HTMLFormElement;
    const field = document.querySelector(
      '#testForm19\\$text',
    ) as HTMLInputElement;

    const v = dv.validate(form, {
      errorElement: 'span',
      messages: {
        testForm19$text: {
          required: 'required',
        },
      },
    })!;

    function hasError(element: HTMLElement, text: string) {
      const errors = v.errorsFor(element as any);
      return errors.length === 1 && errors[0]!.innerText === text;
    }

    dv.valid(field);

    return hasError(field, 'required');
  });

  expect(result).toBe(true);
});

test('test id/name containing single quotes', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm20')!;
    const textElement = document.querySelector(
      "#testForm20\\[\\'textinput\\'\\]",
    ) as HTMLElement;
    const checkboxElement = document.querySelector(
      "#testForm20\\[\\'checkboxinput\\'\\]",
    ) as HTMLElement;
    const radioElement = document.querySelector(
      "#testForm20\\[\\'radioinput\\'\\]",
    ) as HTMLElement;

    v.form();

    return [
      v.numberOfInvalids(),
      v.invalidElements()[0] === textElement,
      v.invalidElements()[1] === checkboxElement,
      v.invalidElements()[2] === radioElement,
    ];
  });

  expect(result).toEqual([3, true, true, true]);
});

// TODO: #1632: Error hidden, but input error class not removed

test('test settings.escapeHtml undefined', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#escapeHtmlForm1') as HTMLFormElement;
    const field = document.querySelector(
      '#escapeHtmlForm1text',
    ) as HTMLInputElement;

    dv.validate(form, {
      messages: {
        escapeHtmlForm1text: {
          required: "<script>console.log('!!!');</script>",
        },
      },
    });

    function noErrorsFor(element: HTMLElement) {
      const errors = dv
        .validate(element.closest('form')!)!
        .errorsFor(element as any);
      return (
        errors.length === 0 ||
        (errors.every((e) => !dv_testLib.isVisible(e)) &&
          errors[0]!.innerText === '')
      );
    }

    const ret: any[] = [dv.valid(field)];

    const label = form.querySelector('label') as HTMLLabelElement;
    ret.push(!!label, label.innerHTML);

    label.innerHTML = '';
    ret.push(dv.valid(field), label.innerHTML);

    field.value = 'foo';
    ret.push(dv.valid(field), noErrorsFor(field));

    return ret;
  });

  expect(result).toEqual([
    false,
    true,
    "<script>console.log('!!!');</script>",
    false,
    "<script>console.log('!!!');</script>",
    true,
    true,
  ]);
});

test('test settings.escapeHtml true', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#escapeHtmlForm2') as HTMLFormElement;
    const field = document.querySelector(
      '#escapeHtmlForm2text',
    ) as HTMLInputElement;

    dv.validate(form, {
      escapeHtml: true,
      messages: {
        escapeHtmlForm2text: {
          required: "<script>console.log('!!!');</script>",
        },
      },
    });

    function noErrorsFor(element: HTMLElement) {
      const errors = dv
        .validate(element.closest('form')!)!
        .errorsFor(element as any);
      return (
        errors.length === 0 ||
        (errors.every((e) => !dv_testLib.isVisible(e)) &&
          errors[0]!.innerText === '')
      );
    }

    const ret: any[] = [dv.valid(field)];

    const label = form.querySelector('label') as HTMLLabelElement;
    ret.push(!!label, label.innerHTML);

    label.innerHTML = '';
    ret.push(dv.valid(field), label.innerHTML);

    field.value = 'foo';
    ret.push(dv.valid(field), noErrorsFor(field));

    return ret;
  });

  expect(result).toEqual([
    false,
    true,
    "&lt;script&gt;console.log('!!!');&lt;/script&gt;",
    false,
    "&lt;script&gt;console.log('!!!');&lt;/script&gt;",
    true,
    true,
  ]);
});
