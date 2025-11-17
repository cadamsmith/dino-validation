// @ts-check
import { test, expect } from '@playwright/test';

test("rules() - internal - input", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    const element = document.querySelector("#firstname");
    dv.validate("#testForm1");

    return dv.rules(element);
  });

  expect(result).toEqual({ required: true, minlength: 2 });
});

test("rules(), ignore method:false", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    const element = document.querySelector("#firstnamec");
    dv.validate("#testForm1clean", {
      rules: {
        firstnamec: { required: false, minlength: 2 }
      }
    });

    return dv.rules(element);
  });

  expect(result).toEqual({ minlength: 2 });
});

test("rules() HTML5 required (no value)", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    const element = document.querySelector("#testForm11text1");
    dv.validate("#testForm11");
    return dv.rules(element);
  });

  expect(result).toEqual({ required: true });
});

test("rules() - internal - select", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    const element = document.querySelector("#meal");
    dv.validate("#testForm3");

    return dv.rules(element);
  });

  expect(result).toEqual({ required: true });
});

test("rules() - external", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    const element = document.querySelector("#text1");

    dv.validate("#form", {
      rules: {
        action: { date: true, min: 5 }
      }
    });

    return dv.rules(element);
  });

  expect(result).toEqual({ date: true, min: 5 });
});

test("rules() - external - complete form", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    let executed = false;
    dv.addMethod("verifyTest", function() {
      executed = true;
      return true;
    });

    const v = dv.validate("#form", {
      rules: {
        action: { verifyTest: true }
      }
    });
    v.form();

    return executed;
  });

  expect(result).toBe(true);
});

test("rules() - internal - input (2)", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    const element = document.querySelector("#form8input");
    dv.validate("#testForm8");

    return dv.rules(element);
  });

  expect(result).toEqual({ required: true, number: true, rangelength: [ 2, 8 ] });
});
