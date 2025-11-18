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
