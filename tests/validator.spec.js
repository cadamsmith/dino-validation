// @ts-check
import { test, expect } from '@playwright/test';

test.describe('validator', () => {
  test('constructor', async ({ page }) => {
    await page.goto('');

    const [v1, v2, v1Elements] = await page.evaluate(() => {
      const v1 = dv.validate('#testForm1');
      const v2 = dv.validate('#testForm1');
      return [v1, v2, v1.elements()];
    });

    // Calling validate() multiple times must return the same validator instance
    expect(v1 === v2).toBe(true);
    expect(v1Elements.length).toBe(3);
  });

  test('validate() without elements, with non-form elements', async ({ page }) => {
    await page.goto('');

    const output = await page.evaluate(() => {
      dv.validate('#doesntexist');
      return 0;
    });

    expect(output).toEqual(0);
  });

  test('valid() plugin method', async ({ page }) => {
    await page.goto('');

    const [isFormValid, isInputValid] = await page.evaluate(() => {
      const input = '#username';
      const form = '#userForm';

      dv.validate(form);

      return [
        dv.valid(form),
        dv.valid(input)
      ];
    });

    expect(isFormValid).toBe(false);
    expect(isInputValid).toBe(false);
  });

  test('valid() plugin method, multiple inputs', async ({ page }) => {
    await page.goto('');

    const tests = await page.evaluate(() => {
      const form = document.querySelector('#testForm1');
      const validator = dv.validate(form);
      const inputs = [...form.querySelectorAll('input')];

      const tests = [dv.valid(inputs)];

      inputs.slice(1).forEach(input => input.value = "ok");
      tests.push(validator.numberOfInvalids(), dv.valid(inputs));

      inputs.forEach(input => input.value = "ok");
      tests.push(dv.valid(inputs));

      return tests;
    });

    expect(tests[0]).toBe(false);
    expect(tests[1]).toBe(2);
    expect(tests[2]).toBe(false);
    expect(tests[3]).toBe(true);
  });

  test('valid() plugin method, special handling for checkable groups', async ({ page }) => {
    await page.goto('');

    const tests = await page.evaluate(() => {
      const checkable = document.querySelector('#checkable2');
      const tests = [dv.valid(checkable)];

      checkable.checked = true;
      tests.push(dv.valid(checkable));

      checkable.checked = false;
      tests.push(dv.valid(checkable));

      document.querySelector('#checkable3').checked = true;
      tests.push(dv.valid(checkable));

      return tests;
    });

    expect(tests).toEqual([
      false,
      true,
      false,
      true
    ]);
  });

  test('valid() ???', async ({ page }) => {
    await page.goto('');

    const tests = await page.evaluate(() => {
      const errorList = [
        {
          name: "meal",
          message: "foo",
          element: document.querySelector("#meal")
        }
      ];
      let v = dv.validate("#testForm3");

      const tests = [v.valid()];

      v.errorList = errorList;
      tests.push(v.valid());

      v.destroy();
      v = dv.validate("#testForm3");
      tests.push(v.valid());

      v.errorList = errorList;
      tests.push(v.valid());

      return tests;
    });

    expect(tests).toEqual([
      true,
      false,
      true,
      false
    ]);
  });

  test("valid(), ignores ignored elements", async ({ page }) => {
    await page.goto("");

    const result = await page.evaluate(() => {
      dv.validate("#testForm1clean", {
        ignore: "#firstnamec",
        rules: {
          firstnamec: "required"
        }
      });

      return dv.valid("#firstnamec");
    });

    expect(result).toBe(true);
  });

  test("valid() should ignore elements that belong to other/nested forms", async ({ page }) => {
    await page.goto("");

    const result1 = await page.evaluate(() => {
      const form = document.querySelector('#testForm28');
      dv.validate(form);

      // 1. Test with nested form
      form.insertAdjacentHTML('afterend', "<form id='testForm28-nested'>" +
        "    <input type='text' name='f28nestedinput' required>" +
        "</form>");

      try {
        dv.valid(form);
        return true;
      }
      catch (err) {
        return false;
      }
    });

    expect(result1).toBe(true);

    // reset test page
    await page.goto("");

    const result2 = await page.evaluate(() => {
      const form = document.querySelector('#testForm28');

      // 2. Test using another form outside of validated one
      form.parentElement.insertAdjacentHTML('afterend', "<form id='testForm28-other'>" +
        "   <input type='text' name='f28otherinput' required>" +
        "   <input type='text' name='f28input' form='testForm28' required>" +
        "</form>");

      dv.validate('#testForm28-other');

      try {
        dv.valid('#testForm28-other');
        return true;
      }
      catch (err) {
        return false;
      }
    });

    expect(result2).toBe(true);
  });

  test("form() should ignore elements that belong to other/nested forms", async ({ page }) => {
    await page.goto("");

    const result1 = await page.evaluate(() => {
      const form = document.querySelector('#testForm28');
      const v = dv.validate(form);

      // 1. Test with nested form
      form.insertAdjacentHTML('afterend', "<form id='testForm28-nested'>" +
        "    <input type='text' name='f28nestedinput' required>" +
        "</form>");

      try {
        v.form();
        return true;
      }
      catch (err) {
        return false;
      }
    });

    expect(result1).toBe(true);

    // reset test page
    await page.goto("");

    const result2 = await page.evaluate(() => {
      const form = document.querySelector('#testForm28');

      // 2. Test using another form outside of validated one
      form.parentElement.insertAdjacentHTML('afterend', "<form id='testForm28-other'>" +
        "   <input type='text' name='f28otherinput' required>" +
        "   <input type='text' name='f28input' form='testForm28' required>" +
        "</form>");

      const v = dv.validate(form);

      try {
        v.form();
        return true;
      }
      catch (err) {
        return false;
      }
    });

    expect(result2).toBe(true);
  });

  test("elements() should ignore elements that belong to other/nested forms", async ({ page }) => {
    await page.goto('');

    const result1 = await page.evaluate(() => {
      const form = document.querySelector("#testForm28");
      const v = dv.validate(form);

      // 1. Test with nested form
      form.insertAdjacentHTML('afterend', "<form id='testForm28-nested'>" +
        "    <input type='text' name='f28nestedinput' required>" +
        "</form>");

      return v.elements().length;
    });

    expect(result1).toBe(1);

    await page.goto('');

    const result2 = await page.evaluate(() => {
      const form = document.querySelector("#testForm28");

      // 2. Test using another form outside of validated one
      form.parentElement.insertAdjacentHTML('afterend', "<form id='testForm28-other'>" +
        "   <input type='text' name='f28otherinput' required>" +
        "   <input type='text' name='f28input' form='testForm28' required>" +
        "</form>");

      const v = dv.validate("#testForm28-other");

      return v.elements().length;
    });

    expect(result2).toBe(1);
  });

  test("Ignore elements that have form attribute set to other forms", async ({ page }) => {
    await page.goto('');

    const result = await page.evaluate(() => {
      const form = document.querySelector("#testForm28");

      // Append a form that contains an input with form attribute set to "testForm28"
      form.parentElement.insertAdjacentHTML('afterend', "<form id='testForm28-other'>" +
        "   <input type='text' name='f28otherinput' required>" +
        "   <input type='text' name='f28input' form='testForm28' required>" +
        "</form>");

      // Attach the plugin to the appended form
      const appendedForm = document.querySelector('#testForm28-other');
      dv.validate(appendedForm);

      // 1. simulate typing
      appendedForm.querySelector("[name='f28input']").dispatchEvent(new Event('keyup'));
      // 2. simulate focussing in the input
      appendedForm.querySelector("[name='f28input']").dispatchEvent(new Event('focusin'));
      // 3. simulate focussing out of the input
      appendedForm.querySelector("[name='f28input']").dispatchEvent(new Event('focusout'));

      return true;
    });

    expect(result).toBe(true);
  });

  test("addMethod", async ({ page }) => {
    await page.goto('');

    const result = await page.evaluate(() => {
      dv.addMethod("hi", function (blank, value) {
        return value === "hi";
      }, "hi me too");

      const method = dv.methods().hi;
      const e = document.querySelector("#text1");

      const ret = [method(!!e.value, e.value)];

      e.value = "hi";
      ret.push(method(!!e.value, e.value), dv.messages.hi);

      return ret;
    });

    expect(result).toEqual([false, true, "hi me too"]);
  });

  test("addMethod2", async ({ page }) => {
    await page.goto('');

    const result = await page.evaluate(() => {
      const ret = [];

      dv.addMethod("complicatedPassword", function (blank, value) {
        return blank || /\D/.test(value) && /\d/.test(value);
      }, "Your password must contain at least one number and one letter");

      const v = dv.validate("#form", {
        rules: {
          action: { complicatedPassword: true }
        }
      });

      const e = document.querySelector("#text1");
      e.value = "";

      ret.push(v.element(e), v.size());
      e.value = "ko";
      ret.push(v.element(e));
      e.value = "ko1";
      ret.push(v.element(e));

      return ret;
    });

    expect(result).toEqual([true, 0, false, true]);
  });

  test("form(): simple", async ({ page }) => {
    await page.goto('');

    const result = await page.evaluate(() => {
      const v = dv.validate("#testForm1");
      const fnInput = document.querySelector("#firstname");
      const lnInput = document.querySelector("#lastname");

      const ret = [v.form()];

      fnInput.value = "hi";
      lnInput.value = "hi";
      ret.push(v.form());

      return ret;
    });

    expect(result).toEqual([false, true]);
  });

  test("form(): checkboxes: min/required", async ({ page }) => {
    await page.goto('');

    const result = await page.evaluate(() => {
      const v = dv.validate("#testForm6");

      const ret = [v.form()];

      document.querySelector('#form6check1').checked = true;
      ret.push(v.form());
      document.querySelector("#form6check2").checked = true;
      ret.push(v.form());

      return ret;
    });

    expect(result).toEqual([false, false, true]);
  });

  test("form(): radio buttons: required", async ({ page }) => {
    await page.goto("");

    const result = await page.evaluate(() => {
      const v = dv.validate("#testForm10", {
        rules: {
          testForm10Radio: "required"
        }
      });

      const radio1 = document.querySelector('#testForm10Radio1');
      const radio2 = document.querySelector('#testForm10Radio2');

      const ret = [v.form(), radio1.className, radio2.className];

      radio2.checked = true;

      ret.push(v.form(), radio1.className, radio2.className);

      return ret;
    });

    expect(result).toEqual([false, "error", "error", true, "valid", "valid"]);
  });
});
