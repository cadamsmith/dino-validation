import { test, expect } from '@playwright/test';

test('French localization - basic message replacement', async ({ page }) => {
  await page.goto('');

  // Load French localization after main script
  await page.addScriptTag({
    path: './dist/localization/messages_fr.umd.js',
  });

  const result = await page.evaluate(() => {
    // Test a few key messages
    return {
      required: dv.messages.get('required'),
      email: dv.messages.get('email'),
      minlength: dv.messages.get('minlength'),
      range: dv.messages.get('range'),
    };
  });

  expect(result).toEqual({
    required: 'Ce champ est obligatoire.',
    email: 'Veuillez fournir une adresse électronique valide.',
    minlength: 'Veuillez fournir au moins {0} caractères.',
    range: 'Veuillez fournir une valeur entre {0} et {1}.',
  });
});
