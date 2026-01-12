import { expect, test } from '@playwright/test';
import { FormControlElement } from '../src/types';

test('option: (un)highlight, default', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.validate('#testForm1');
    const e = document.querySelector('#firstname') as FormControlElement;

    const ret = [e.classList.contains('error'), e.classList.contains('valid')];

    dv.valid(e);

    ret.push(e.classList.contains('error'), e.classList.contains('valid'));

    e.value = 'hithere';
    dv.valid(e);

    ret.push(e.classList.contains('error'), e.classList.contains('valid'));

    return ret;
  });

  expect(result).toEqual([false, false, true, false, false, true]);
});

test('option: (un)highlight, nothing', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.validate('#testForm1', {
      highlight: false,
      unhighlight: false,
    });
    const e = document.querySelector('#firstname') as FormControlElement;

    const ret = [e.classList.contains('error')];

    dv.valid(e);
    ret.push(e.classList.contains('error'));

    dv.valid(e);
    ret.push(e.classList.contains('error'));

    return ret;
  });

  expect(result).toEqual([false, false, false]);
});

test('option: (un)highlight, custom', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const ret = [];

    dv.validate('#testForm1clean', {
      highlight: function (element, errorClasses) {
        ret.unshift(...errorClasses);
        element.style.display = 'none';
      },
      unhighlight: function (element, errorClasses) {
        ret.unshift(...errorClasses);
        element.style.display = 'block';
      },
      ignore: '',
      errorClass: 'invalid',
      rules: {
        firstnamec: 'required',
      },
    });

    const e = document.querySelector('#firstnamec') as FormControlElement;
    ret.push(e.style.display !== 'none');

    dv.valid(e);
    ret.push(e.style.display);

    e.value = 'hithere';
    dv.valid(e);
    ret.push(e.style.display);

    return ret;
  });

  expect(result).toEqual(['invalid', 'invalid', true, 'none', 'block']);
});

test('option: (un)highlight, custom2', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.validate('#testForm1', {
      highlight: function (element, errorClass) {
        element.classList.add(...errorClass);
        if (element.nextElementSibling!.matches('.error:not(input)')) {
          element.nextElementSibling!.classList.add(...errorClass);
        }
      },
      unhighlight: function (element, errorClass) {
        element.classList.remove(...errorClass);
        if (element.nextElementSibling!.matches('.error:not(input)')) {
          element.nextElementSibling!.classList.remove(...errorClass);
        }
      },
      errorClass: 'invalid',
    });

    const e = document.querySelector('#firstname') as FormControlElement;
    const l = document.querySelector('#errorFirstname') as HTMLElement;

    const ret = [e.matches('.invalid'), l.matches('.invalid')];

    dv.valid(e);
    ret.push(e.matches('.invalid'), l.matches('.invalid'));

    e.value = 'hithere';
    dv.valid(e);
    ret.push(e.matches('.invalid'), l.matches('.invalid'));

    return ret;
  });

  expect(result).toEqual([false, false, true, true, false, false]);
});

test('option: errorPlacement', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    return new Promise((resolve) => {
      const v = dv.validate('#testForm1', {
        errorPlacement: function () {
          resolve(this === v);
        },
      })!;

      v.form();
    });
  });

  expect(result).toBe(true);
});

test('option: focusCleanup default false', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm') as HTMLFormElement;
    dv.validate(form);
    dv.valid(form);

    const isVisible = (el: HTMLElement) => el.style.display !== 'none';

    const usernameError = form.querySelector('#username')!
      .nextElementSibling as HTMLElement;
    const ret = [isVisible(usernameError)];

    usernameError.focus();
    ret.push(isVisible(usernameError));

    return ret;
  });

  expect(result).toEqual([true, true]);
});

test('option: focusCleanup true', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm') as HTMLFormElement;
    dv.validate(form, { focusCleanup: true });
    dv.valid(form);

    const isVisible = (el: HTMLElement) => el.style.display !== 'none';

    const usernameError = form.querySelector('#username')!
      .nextElementSibling as HTMLElement;
    const ret = [isVisible(usernameError)];

    usernameError.focus();
    usernameError.dispatchEvent(new Event('focusin'));
    ret.push(isVisible(usernameError));

    return ret;
  });

  expect(result).toEqual([true, false]);
});

test('option: focusCleanup with wrapper', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm') as HTMLFormElement;
    dv.validate(form, {
      focusCleanup: true,
      wrapper: 'span',
    });
    dv.valid(form);

    const username = document.querySelector('#username') as HTMLElement;

    function isVisible(el: HTMLElement) {
      return !!(
        el.offsetWidth ||
        el.offsetHeight ||
        el.getClientRects().length
      );
    }

    function hasVisibleErrors() {
      const wrappers = Array.from(form.querySelectorAll('span'))
        .filter((el) => isVisible(el))
        .map((el) => el.querySelectorAll('.error#username-error'))
        .flat();

      return wrappers.length > 0;
    }

    const ret = [hasVisibleErrors()];

    username.focus();
    username.dispatchEvent(new Event('focusin'));
    ret.push(hasVisibleErrors());

    return ret;
  });

  expect(result).toEqual([true, false]);
});

test('option: errorClass with multiple classes', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm') as HTMLFormElement;
    dv.validate(form, {
      focusCleanup: true,
      wrapper: 'span',
      errorClass: 'error error1 error2',
    });
    dv.valid(form);

    function isVisible(el: HTMLElement) {
      return !!(
        el.offsetWidth ||
        el.offsetHeight ||
        el.getClientRects().length
      );
    }

    function containsErrorClass(name: string) {
      const matches = Array.from(form.querySelectorAll('span'))
        .filter((el) => isVisible(el))
        .map((el) => el.querySelectorAll(`.${name}#username-error`))
        .flat();

      return matches.length > 0;
    }

    const ret = [
      containsErrorClass('error'),
      containsErrorClass('error1'),
      containsErrorClass('error2'),
    ];

    const username = document.querySelector('#username') as HTMLElement;
    username.focus();
    username.dispatchEvent(new Event('focusin'));
    ret.push(
      containsErrorClass('error'),
      containsErrorClass('error1'),
      containsErrorClass('error2'),
    );

    return ret;
  });

  expect(result).toEqual([true, true, true, false, false, false]);
});

test('option: ignore', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm1', {
      ignore: '[name=lastname]',
    })!;
    v.form();

    return v.size();
  });

  expect(result).toBe(1);
});

test('ignore hidden elements', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm') as HTMLFormElement;
    const v = dv.validate(form, {
      rules: { username: 'required' },
    })!;

    form.reset();
    const ret = [v.form()];

    const username = document.querySelector(
      '#userForm [name=username]',
    ) as FormControlElement;
    dv_testLib.hideElement(username);
    ret.push(v.form());

    return ret;
  });

  expect(result).toEqual([false, true]);
});

test('ignore hidden elements at start', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#userForm') as HTMLFormElement;
    const v = dv.validate(form, {
      rules: { username: 'required' },
    })!;

    const username = document.querySelector(
      '#userForm [name=username]',
    ) as FormControlElement;

    form.reset();
    dv_testLib.hideElement(username);
    const ret = [v.form()];

    dv_testLib.showElement(username);
    ret.push(v.form());

    return ret;
  });

  expect(result).toEqual([true, false]);
});

test('option: subformRequired', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const billToCo = document.querySelector('#bill_to_co') as HTMLInputElement;

    dv.addMethod(
      'billingrequired',
      function ({ blank, element }) {
        if (billToCo && billToCo.checked) {
          return !!element.closest('#subform');
        }
        return !blank;
      },
      '',
    );

    const v = dv.validate('#subformRequired')!;
    v.form();

    const ret = [v.size()];

    billToCo.checked = false;
    v.form();
    ret.push(v.size());

    return ret;
  });

  expect(result).toEqual([1, 2]);
});

test('option: invalidHandler', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1clean') as HTMLFormElement;
    const element = document.querySelector('#usernamec') as FormControlElement;

    return new Promise((resolve) => {
      dv.validate(form, {
        debug: true,
        invalidHandler: () => {
          resolve(true);
        },
        rules: {
          username: {
            required: true,
            minlength: 5,
          },
        },
      });

      element.value = 'asdf';
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    });
  });

  expect(result).toBe(true);
});

test('option: ignoreTitle', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#withTitle', {
      ignoreTitle: true,
    })!;
    v.form();
    return v.errorList[0]!.message === dv.messages.get('required')!;
  });

  expect(result).toBe(true);
});

test('success option', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const firstName = document.querySelector(
      '#firstname',
    ) as FormControlElement;
    const ret: any[] = [firstName.value];

    const v = dv.validate('#testForm1', {
      success: 'valid',
    })!;
    const label = document.querySelector(
      '#testForm1 .error:not(input)',
    ) as HTMLElement;

    ret.push(
      label.classList.contains('error'),
      label.classList.contains('valid'),
    );

    v.form();
    ret.push(
      label.classList.contains('error'),
      label.classList.contains('valid'),
    );

    firstName.value = 'hi';
    v.form();
    ret.push(
      label.classList.contains('error'),
      label.classList.contains('valid'),
    );

    return ret;
  });

  expect(result).toEqual(['', true, false, true, false, true, true]);
});

test('success option2', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const firstName = document.querySelector(
      '#firstname',
    ) as FormControlElement;
    const ret: any[] = [firstName.value];

    const v = dv.validate('#testForm1', {
      success: 'valid',
    })!;
    const label = document.querySelector(
      '#testForm1 .error:not(input)',
    ) as HTMLElement;

    ret.push(
      label.classList.contains('error'),
      label.classList.contains('valid'),
    );

    firstName.value = 'hi';
    v.form();
    ret.push(
      label.classList.contains('error'),
      label.classList.contains('valid'),
    );

    return ret;
  });

  expect(result).toEqual(['', true, false, true, true]);
});

test('success option3', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const firstName = document.querySelector(
      '#firstname',
    ) as FormControlElement;
    const ret: any[] = [firstName.value];
    document.querySelector('#errorFirstname')!.remove();

    const v = dv.validate('#testForm1', {
      success: 'valid',
    })!;

    ret.push(document.querySelector('#testForm1 .error:not(input)'));

    firstName.value = 'hi';
    v.form();
    const labels = Array.from(
      document.querySelectorAll('#testForm1 .error:not(input)'),
    );

    ret.push(
      labels.length,
      labels[0]!.classList.contains('valid'),
      labels[1]!.classList.contains('valid'),
    );

    return ret;
  });

  expect(result).toEqual(['', null, 3, true, false]);
});

test("success isn't called for optional elements with no other rules", async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const firstName = document.querySelector(
      '#firstname',
    ) as FormControlElement;
    firstName.removeAttribute('data-rule-required');
    firstName.removeAttribute('data-rule-minlength');
    const ret: any[] = [firstName.value];

    document.querySelector('#something')!.remove();
    document.querySelector('#lastname')!.remove();
    document.querySelector('#errorFirstname')!.remove();

    let successCalled = false;
    const v = dv.validate('#form', {
      success: function () {
        successCalled = true;
      },
      rules: {
        firstname: { required: false },
      },
    })!;

    ret.push(document.querySelector('#testForm1 .error:not(input)'));

    v.form();
    ret.push(document.querySelector('#testForm1 .error:not(input)'));

    dv.valid(firstName);
    ret.push(
      document.querySelector('#testForm1 .error:not(input)'),
      successCalled,
    );

    return ret;
  });

  expect(result).toEqual(['', null, null, null, false]);
});

test('success is called for optional elements with other rules', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.addMethod(
      'custom1',
      function () {
        return true;
      },
      '',
    );

    let successCalled = false;
    dv.validate('#testForm1clean', {
      success: function () {
        successCalled = true;
      },
      rules: {
        firstnamec: {
          required: false,
          custom1: true,
        },
      },
    });

    dv.valid('#firstnamec');

    return successCalled;
  });

  expect(result).toBe(true);
});

test('success callback with element', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const username = document.querySelector('#username') as FormControlElement;

    let correctLabel = false;
    const v = dv.validate('#userForm', {
      success: function (_labels, element) {
        correctLabel = element === username;
      },
    })!;

    username.value = 'hi';
    v.form();

    return correctLabel;
  });

  expect(result).toBe(true);
});

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
