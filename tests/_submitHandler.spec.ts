import { expect, test } from '@playwright/test';

test('submitHandler is called when form is valid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1clean') as HTMLFormElement;
    const input = document.querySelector('#usernamec') as HTMLInputElement;

    return new Promise<boolean>((resolve) => {
      dv.validate(form, {
        submitHandler: () => {
          resolve(true);
          return false; // Prevent actual submission
        },
        rules: {
          username: { required: true },
        },
      });

      input.value = 'validusername';
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    });
  });

  expect(result).toBe(true);
});

test('submitHandler is not called when form is invalid', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1clean') as HTMLFormElement;
    const input = document.querySelector('#usernamec') as HTMLInputElement;
    let handlerCalled = false;

    dv.validate(form, {
      submitHandler: () => {
        handlerCalled = true;
        return false;
      },
      rules: {
        username: { required: true, minlength: 5 },
      },
    });

    input.value = 'abc'; // Too short
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    return handlerCalled;
  });

  expect(result).toBe(false);
});

test('submitHandler receives form and event as parameters', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1clean') as HTMLFormElement;
    const input = document.querySelector('#usernamec') as HTMLInputElement;

    return new Promise<{ isForm: boolean; isEvent: boolean }>((resolve) => {
      dv.validate(form, {
        submitHandler: (receivedForm, receivedEvent) => {
          resolve({
            isForm: receivedForm === form,
            isEvent: receivedEvent instanceof Event,
          });
          return false;
        },
        rules: {
          username: { required: true },
        },
      });

      input.value = 'validusername';
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    });
  });

  expect(result.isForm).toBe(true);
  expect(result.isEvent).toBe(true);
});

test('submitHandler returning false prevents form submission', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1clean') as HTMLFormElement;
    const input = document.querySelector('#usernamec') as HTMLInputElement;
    let formSubmitted = false;

    dv.validate(form, {
      submitHandler: () => {
        return false; // Prevent submission
      },
      rules: {
        username: { required: true },
      },
    });

    // Add listener AFTER validator so validator's listener runs first
    form.addEventListener('submit', (e) => {
      if (!e.defaultPrevented) {
        e.preventDefault(); // Prevent actual page navigation
        formSubmitted = true;
      }
    });

    input.value = 'validusername';
    form.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true }),
    );

    return formSubmitted;
  });

  expect(result).toBe(false);
});

test('submitHandler returning true allows form submission', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1clean') as HTMLFormElement;
    const input = document.querySelector('#usernamec') as HTMLInputElement;
    let formSubmitted = false;

    form.addEventListener('submit', (e) => {
      if (!e.defaultPrevented) {
        e.preventDefault(); // Prevent actual page navigation
        formSubmitted = true;
      }
    });

    dv.validate(form, {
      submitHandler: () => {
        return true; // Allow submission
      },
      rules: {
        username: { required: true },
      },
    });

    input.value = 'validusername';
    form.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true }),
    );

    return formSubmitted;
  });

  expect(result).toBe(true);
});

test('submitHandler returning undefined prevents form submission', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1clean') as HTMLFormElement;
    const input = document.querySelector('#usernamec') as HTMLInputElement;
    let formSubmitted = false;

    dv.validate(form, {
      submitHandler: () => {
        // Explicitly return undefined (same as no return statement)
        return undefined;
      },
      rules: {
        username: { required: true },
      },
    });

    // Add listener AFTER validator so validator's listener runs first
    form.addEventListener('submit', (e) => {
      if (!e.defaultPrevented) {
        e.preventDefault();
        formSubmitted = true;
      }
    });

    input.value = 'validusername';
    form.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true }),
    );

    return formSubmitted;
  });

  expect(result).toBe(false);
});

test('submitHandler is not called when debug mode is enabled', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1clean') as HTMLFormElement;
    const input = document.querySelector('#usernamec') as HTMLInputElement;
    let handlerCalled = false;

    dv.validate(form, {
      debug: true,
      submitHandler: () => {
        handlerCalled = true;
        return false;
      },
      rules: {
        username: { required: true },
      },
    });

    input.value = 'validusername';
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    return handlerCalled;
  });

  expect(result).toBe(false);
});

test('submitHandler not called with onsubmit option disabled', async ({
  page,
}) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1clean') as HTMLFormElement;
    const input = document.querySelector('#usernamec') as HTMLInputElement;
    let handlerCalled = false;

    const validator = dv.validate(form, {
      onsubmit: false,
      submitHandler: () => {
        handlerCalled = true;
        return false;
      },
      rules: {
        username: { required: true },
      },
    })!;

    input.value = 'validusername';

    // Since onsubmit is false, we manually call form() and submitHandler
    const isValid = validator.form();

    return { isValid, handlerCalled };
  });

  expect(result.isValid).toBe(true);
  expect(result.handlerCalled).toBe(false); // submitHandler is only called via submit event
});

test('submitHandler is called after all validations pass', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm1clean') as HTMLFormElement;
    const input = document.querySelector('#usernamec') as HTMLInputElement;
    const events: string[] = [];

    return new Promise<string[]>((resolve) => {
      dv.validate(form, {
        submitHandler: () => {
          events.push('submitHandler');
          resolve(events);
          return false;
        },
        rules: {
          username: {
            required: true,
            minlength: 5,
          },
        },
        onfocusout: (element) => {
          events.push('onfocusout');
          dv.valid(element);
        },
      });

      input.value = 'validusername';
      input.dispatchEvent(new Event('focusout', { bubbles: true }));
      form.dispatchEvent(new Event('submit', { cancelable: true }));
    });
  });

  expect(result).toContain('submitHandler');
  expect(result[result.length - 1]).toBe('submitHandler');
});
