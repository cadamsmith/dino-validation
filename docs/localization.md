# 🦖 dino-validation: localization

dino-validation supports multiple languages.

You can use pre-built localization files provided by the library, or create your own custom translations using `dv.localize()`.

## using localization builds

dino-validation includes pre-built localization files.

**French (UMD):**

```html
<script src="dist/dv.min.js"></script>
<script src="dist/localization/messages_fr.min.js"></script>

<script>
  // French messages are now loaded
  dv.validate('#myForm', { ... });
</script>
```

**French (ESM):**

```javascript
import dv from 'dino-validation';
import 'dino-validation/dist/localization/messages_fr.esm.js';

// French messages are now loaded
dv.validate('#myForm', { ... });
```

## custom localization

Use `dv.localize()` to translate error messages yourself.

```javascript
// Custom messages (use any language or wording you want)
dv.localize({
  required: 'Beep boop! This field cannot be empty.',
  email: "Beep! That doesn't look like a valid email address.",
  url: 'Boop! Please enter a valid URL.',
  date: 'Beep boop! Invalid date detected.',
  number: 'Beep! Numbers only, please.',
  digits: 'Boop boop! Only digits allowed (0-9).',
  equalto: 'Beep! These values must match.',
  maxlength: 'Boop! Maximum {0} characters allowed.',
  minlength: 'Beep! Minimum {0} characters required.',
  rangelength: 'Beep boop! Must be between {0} and {1} characters.',
  range: 'Boop! Value must be between {0} and {1}.',
  max: 'Beep! Value must be {0} or less.',
  min: 'Boop! Value must be {0} or more.',
  creditcard: 'Beep boop! Invalid credit card number.',
  regex: 'Boop! Must match pattern: {0}.',
  nonalphamin: 'Beep! At least {0} special characters required.',
});
```
