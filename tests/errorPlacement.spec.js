// @ts-check
import { test, expect } from '@playwright/test';

test('elements() order', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const container = document.querySelector('#orderContainer');
    const v = dv.validate('#elementsOrder', {
      errorLabelContainer: '#orderContainer',
    });

    const ret = [v.elements().map((el) => el.getAttribute('id'))];

    v.form();
    ret.push([...container.children].map((el) => el.getAttribute('id')));

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
    const form = document.querySelector('#userForm');
    const field = document.querySelector('#username');

    const v = dv.validate(form, {
      messages: {
        username: 'missing',
      },
      errorElement: 'label',
    });

    function hasError(element, text) {
      const errors = v.errorsFor(element);
      return errors.length === 1 && errors[0].innerText === text;
    }

    function noErrorsFor(element) {
      const errors = v.errorsFor(element);
      return (
        errors.length === 0 ||
        (errors.every((e) => !dvTestHelpers.isVisible(e)) &&
          errors[0].innerText === '')
      );
    }

    const ret = [dv.valid(field), hasError(field, 'missing')];

    field.value = 'foo';
    ret.push(dv.valid(field), noErrorsFor(field));

    return ret;
  });

  expect(result).toEqual([false, true, true, true]);
});

test('test existing label used as error element', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#testForm14');
    const field = document.querySelector('#testForm14text');

    const v = dv.validate(form, { errorElement: 'label' });

    function hasError(element, text) {
      const errors = v.errorsFor(element);
      return errors.length === 1 && errors[0].innerText === text;
    }

    function noErrorsFor(element) {
      const errors = v.errorsFor(element);
      return (
        errors.length === 0 ||
        (errors.every((e) => !dvTestHelpers.isVisible(e)) &&
          errors[0].innerText === '')
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
    const form = document.querySelector('#testForm15');
    const field = document.querySelector('#testForm15text');

    const v = dv.validate(form, { errorElement: 'span' });

    function hasError(element, text) {
      const errors = v.errorsFor(element);
      return errors.length === 1 && errors[0].innerText === text;
    }

    function noErrorsFor(element) {
      const errors = v.errorsFor(element);
      return (
        errors.length === 0 ||
        (errors.every((e) => !dvTestHelpers.isVisible(e)) &&
          errors[0].innerText === '')
      );
    }

    const ret = [dv.valid(field), hasError(field, 'required')];

    field.value = 'foo';
    ret.push(dv.valid(field), noErrorsFor(field));

    return ret;
  });

  expect(result).toEqual([false, true, true, true]);
});

// TODO: test aria-describedby with input names contains CSS-selector meta-characters

// TODO: test existing non-error aria-describedby

// TODO: test aria-describedby cleanup with existing non-error aria-describedby

// TODO: test aria-describedby cleanup when field becomes valid

// TODO: test aria-describedby cleanup on group

// TODO: test pre-assigned non-error aria-describedby

// TODO: test id/name containing brackets

// TODO: test id/name containing $

// TODO: test id/name containing single quotes

// TODO: #1632: Error hidden, but input error class not removed

test('test settings.escapeHtml undefined', async ({ page }) => {
  await page.goto('');

  const result = await page.evaluate(() => {
    const form = document.querySelector('#escapeHtmlForm1');
    const field = document.querySelector('#escapeHtmlForm1text');

    dv.validate(form, {
      messages: {
        escapeHtmlForm1text: {
          required: "<script>console.log('!!!');</script>",
        },
      },
    });

    function noErrorsFor(element) {
      const errors = dv.validate(element.closest('form')).errorsFor(element);
      return (
        errors.length === 0 ||
        (errors.every((e) => !dvTestHelpers.isVisible(e)) &&
          errors[0].innerText === '')
      );
    }

    const ret = [dv.valid(field)];

    const label = form.querySelector('label');
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
    const form = document.querySelector('#escapeHtmlForm2');
    const field = document.querySelector('#escapeHtmlForm2text');

    dv.validate(form, {
      escapeHtml: true,
      messages: {
        escapeHtmlForm2text: {
          required: "<script>console.log('!!!');</script>",
        },
      },
    });

    function noErrorsFor(element) {
      const errors = dv.validate(element.closest('form')).errorsFor(element);
      return (
        errors.length === 0 ||
        (errors.every((e) => !dvTestHelpers.isVisible(e)) &&
          errors[0].innerText === '')
      );
    }

    const ret = [dv.valid(field)];

    const label = form.querySelector('label');
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
