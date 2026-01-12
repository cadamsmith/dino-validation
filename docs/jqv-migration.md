# 🦖 dino-validation: migrating from jquery-validation

If you're familiar with the jQuery Validation Plugin, transitioning to dino-validation is straightforward.

The API is intentionally similar to minimize the learning curve.

## api method mapping

| jQuery Validation              | dino-validation                 | Notes                      |
| ------------------------------ | ------------------------------- | -------------------------- |
| `$('#form').validate(options)` | `dv.validate('#form', options)` | Returns Validator instance |
| `$('#form').valid()`           | `dv.valid('#form')`             | Returns boolean            |
| `$('#field').valid()`          | `dv.valid('#field')`            | Returns boolean            |
| `$.validator.addMethod(...)`   | `dv.addMethod(...)`             | Add custom validators      |

## key differences

dino-validation is a partial port of jQuery Validation. Here are some differences:

**1. No jQuery Dependency**

- dino-validation uses pure vanilla JavaScript
- No jQuery chain - methods return values directly

**2. Validation Method Signature**

```javascript
// jQuery Validation
jQuery.validator.addMethod(
  'phone',
  function (value, element) {
    // automatically allows class="phone" rule usage since param not passed
    return this.optional(element) || /^\d{3}-\d{3}-\d{4}$/.test(value);
  },
  'Invalid phone format',
);

// dino-validation
dv.addMethod(
  'phone',
  function ({ blank, value, element }) {
    return blank || /^\d{3}-\d{3}-\d{4}$/.test(value);
  },
  'Invalid phone format',
  true, // explicity allow class="phone" rule usage
);
```

**3. Difference in Validation Methods**

All the built-in validation methods are the same as jquery-validation, except for the following differences:

- `date` method was not included, `dateISO` method renamed to `date`
- `step` and `remote` methods were not included
- additional methods moved to built-in methods: `creditcard`, `regex`, `nonalphamin`

**4. Missing Options**

The following jquery-validation settings were not included:

- `normalizer` - Transform field values before validation
- `groups` - Group multiple fields into a single error message
- `focusInvalid` - enable/disable focusing of invalid elements on form submission
