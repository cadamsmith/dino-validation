import { test, expect } from '@playwright/test';
import { FormControlElement } from '../src/types';

test('numberOfInvalids(): count invalid fields with empty message', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm23', {
      rules: {
        box1: {
          required: true,
        },
        box2: {
          required: true,
        },
      },
    })!;

    dv.messages.set('required', '');
    v.form();

    return [v.errorList.length, v.numberOfInvalids()];
  });

  expect(result).toEqual([2, 2]);
});

test('hide(): input', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorLabel = document.querySelector('#errorFirstname') as HTMLElement;
    const element = document.querySelector('#firstname') as FormControlElement;

    element.value = 'bla';
    const v = dv.validate('#testForm1')!;
    dv_testLib.showElement(errorLabel);

    return [
      dv_testLib.isVisible(errorLabel),
      v.element(element),
      dv_testLib.isVisible(errorLabel),
    ];
  });

  expect(result).toEqual([true, true, false]);
});

test('hide(): radio', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorLabel = document.querySelector('#agreeLabel') as HTMLElement;
    const element = document.querySelector('#agb') as HTMLInputElement;

    element.checked = true;
    const v = dv.validate('#testForm2', { errorClass: 'xerror' })!;
    dv_testLib.showElement(errorLabel);

    const ret = [dv_testLib.isVisible(errorLabel)];

    v.element(element as FormControlElement);
    ret.push(dv_testLib.isVisible(errorLabel));

    return ret;
  });

  expect(result).toEqual([true, false]);
});

test('hide(): errorWrapper', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorLabel = document.querySelector('#errorWrapper') as HTMLElement;
    const element = document.querySelector('#meal') as HTMLSelectElement;

    element.selectedIndex = 1;
    errorLabel.style.display = 'block';

    const ret = [errorLabel.style.display];

    const v = dv.validate('#testForm3', {
      wrapper: 'li',
      errorLabelContainer: '#errorContainer',
    })!;
    v.element(element as FormControlElement);

    ret.push(errorLabel.style.display);

    return ret;
  });

  expect(result).toEqual(['block', 'none']);
});

test('hide(): container', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorLabel = document.querySelector('#errorContainer') as HTMLElement;
    const mealSelect = document.querySelector('#meal') as HTMLSelectElement;
    const v = dv.validate('#testForm3', {
      wrapper: 'li',
      errorContainer: '#errorContainer',
    })!;

    const isVisible = (el: HTMLElement) => el.style.display !== 'none';

    v.form();
    const ret = [isVisible(errorLabel)];

    mealSelect.selectedIndex = 1;
    v.form();
    ret.push(isVisible(errorLabel));

    mealSelect.selectedIndex = -1;
    v.element(mealSelect as FormControlElement);
    ret.push(isVisible(errorLabel));

    mealSelect.selectedIndex = 1;
    v.element(mealSelect as FormControlElement);
    ret.push(isVisible(errorLabel));

    return ret;
  });

  expect(result).toEqual([true, false, true, false]);
});

test('showErrors()', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const errorLabel = document.querySelector('#errorFirstname') as HTMLElement;
    dv_testLib.hideElement(errorLabel);
    const v = dv.validate('#testForm1')!;

    const lastNameHasError = () => {
      const next = document.querySelector('#lastname')?.nextElementSibling;
      if (!next) {
        return false;
      }

      return (
        next.matches('.error:not(input)') &&
        dv_testLib.isVisible(next as HTMLElement)
      );
    };

    const ret = [dv_testLib.isVisible(errorLabel), lastNameHasError()];

    v.showErrors({ firstname: 'required', lastname: 'bla' });

    ret.push(dv_testLib.isVisible(errorLabel), lastNameHasError());

    return ret;
  });

  expect(result).toEqual([false, false, true, true]);
});

test('showErrors(), allow empty string and null as default message', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.validate('#userForm', {
      rules: {
        username: {
          required: true,
          minlength: 3,
        },
      },
      messages: {
        username: {
          required: '',
          minlength: 'too short',
        },
      },
    });

    const username = document.getElementById('username') as FormControlElement;

    const ret: any[] = [dv.valid('#username')];

    const usernameError = username.nextElementSibling as HTMLElement;
    ret.push(
      usernameError.matches('.error:not(input)'),
      usernameError.innerText,
    );

    username.value = 'ab';
    ret.push(
      dv.valid('#username'),
      usernameError.matches('.error:not(input)'),
      usernameError.innerText,
    );

    username.value = 'abc';
    ret.push(
      dv.valid('#username'),
      usernameError.matches('.error:not(input)'),
      usernameError.style.display,
    );

    return ret;
  });

  expect(result).toEqual([
    false,
    true,
    '',
    false,
    true,
    'too short',
    true,
    true,
    'none',
  ]);
});

test('showErrors() - external messages', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    dv.addMethod(
      'foo',
      function () {
        return false;
      },
      '',
      false,
    );
    dv.addMethod(
      'bar',
      function () {
        return false;
      },
      '',
      false,
    );

    let f1Next = document.querySelector('#testForm4 #f1')!
      .nextElementSibling as HTMLElement;
    let f2Next = document.querySelector('#testForm4 #f2')!
      .nextElementSibling as HTMLElement;

    const ret: any[] = [f1Next.matches('.error:not(input)'), f2Next];

    const form = document.querySelector('#testForm4');
    const v = dv.validate(form, {
      messages: {
        f1: 'Please!',
        f2: 'Wohoo!',
      },
    })!;
    v.form();

    f1Next = document.querySelector('#testForm4 #f1')!
      .nextElementSibling as HTMLElement;
    f2Next = document.querySelector('#testForm4 #f2')!
      .nextElementSibling as HTMLElement;

    ret.push(
      f1Next.matches('.error:not(input)'),
      f1Next.innerText,
      f2Next.matches('.error:not(input)'),
      f2Next.innerText,
    );

    return ret;
  });

  expect(result).toEqual([false, null, true, 'Please!', true, 'Wohoo!']);
});

test('successList', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#form', {
      success: 'xyz',
    })!;
    v.form();

    return v.successList.length;
  });

  expect(result).toBe(0);
});

test('Updates pre-existing label if has error class', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#updateLabel') as HTMLFormElement;
    const input = document.querySelector(
      '#updateLabelInput',
    ) as FormControlElement;
    const label = document.querySelector('#targetLabel') as HTMLElement;
    const labelsBefore = form.querySelectorAll('.error:not(input)').length;

    dv.validate(form);
    input.value = '';
    dv.valid(input);
    const labelsAfter = form.querySelectorAll('.error:not(input)').length;

    return [
      label.textContent === input.getAttribute('data-msg-required'),
      labelsBefore === labelsAfter,
    ];
  });

  expect(result).toEqual([true, true]);
});

test('#1618: Errorlist containing more errors than it should', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const v = dv.validate('#testForm24', {
      rules: {
        val1: 'required',
        val2: 'required',
        val3: 'required',
      },
    })!;

    const inputs = Array.from(
      document.querySelectorAll('#val1, #val2, #val3'),
    ) as HTMLElement[];
    dv.valid(inputs);
    const ret = [v.errorList.length];

    dv.valid(inputs);
    ret.push(v.errorList.length);

    return ret;
  });

  expect(result).toEqual([2, 2]);
});
