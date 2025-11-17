// @ts-check
import { test, expect } from '@playwright/test';

test("predefined message not overwritten by addMethod(a, b, undefined)", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    const message = "my custom message";
    dv.messages.set("custom", message);
    dv.addMethod("custom", () => {});

    return dv.messages.get("custom");
  });

  expect(result).toBe("my custom message");
});

test("read messages from metadata", async ({ page }) => {
  await page.goto("");

  const result = await page.evaluate(() => {
    const form = document.querySelector("#testForm9");
    dv.validate(form);
    const e = document.querySelector("#testEmail9");

    dv.valid(e);
    const ret = [e.nextElementSibling.innerText];

    e.value = "bla";
    dv.valid(e);
    ret.push(e.nextElementSibling.innerText);

    const g = document.querySelector("#testGeneric9");
    dv.valid(g);
    ret.push(g.nextElementSibling.innerText);

    g.value = "bla";
    dv.valid(g);
    ret.push(g.nextElementSibling.innerText);

    return ret;
  });

  expect(result).toEqual(["required", "email", "generic", "email"]);
});