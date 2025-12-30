import { test, expect } from '@playwright/test';
import { FormControlElement } from '../src/types';

test('ESM build - core functionality', async ({ page }) => {
  await page.goto('/tests/lib/esm.html');

  const result = await page.evaluate(() => {
    // Create a validator
    const validator = dv.validate('#form', {
      rules: {
        field: { required: true },
      },
    });

    // Try to validate empty field
    const field = document.querySelector(
      '[name="field"]',
    ) as FormControlElement;
    validator?.element(field);

    return {
      // Check core functionality
      hasValidator: Boolean(validator),
      hasErrorList: Array.isArray(validator?.errorList),
      hasError: validator?.errorList.length === 1,
      errorMessage: validator?.errorList[0]?.message,
    };
  });

  expect(result).toEqual({
    hasValidator: true,
    hasErrorList: true,
    hasError: true,
    errorMessage: 'This field is required.',
  });
});
