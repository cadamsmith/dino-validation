# 🦖 dino-validation: custom methods

Extend dino-validation with custom validation rules for your specific needs.

**Validator Function Signature:**

```typescript
function({ blank, value, values, length, element, param }): boolean
```

**Input Parameters:**

- `blank` (boolean): `true` if field is empty
- `value` (string): Field's value
- `values` (string[]): For radio/checkbox groups, array of selected values
- `length` (number): For text inputs, character count; for select/checkboxes/radios, number of selected/checked items
- `element` (FormControlElement): The input element
- `param` (any): Parameter passed in rule definition

**Return Value:** `true` if valid, `false` if invalid

## examples

**URL Slug Validator:**

```javascript
dv.addMethod(
  'slug',
  function ({ blank, value }) {
    // Lowercase letters, numbers, and hyphens only
    return blank || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  },
  'URL slug must contain lowercase letters, numbers, and hyphens only',
  true,
);

// Usage
dv.validate('#myForm', {
  rules: {
    permalink: { slug: true },
  },
});
```

**Username Validator:**

```javascript
dv.addMethod(
  'username',
  function ({ blank, value }) {
    // 3-20 chars, letters/numbers/_/-, must start with letter
    return blank || /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/.test(value);
  },
  'Username must start with a letter and be 3-20 characters (alphanumeric, _, -)',
  true,
);

// Usage
dv.validate('#myForm', {
  rules: {
    username: {
      required: true,
      username: true,
    },
  },
});
```

**Strong Password Validator:**

```javascript
dv.addMethod(
  'strongpassword',
  function ({ blank, value }) {
    if (blank) return true;

    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    const isLongEnough = value.length >= 12;

    return (
      hasUppercase && hasLowercase && hasNumber && hasSpecial && isLongEnough
    );
  },
  'Password must contain uppercase, lowercase, number, special character, and be 12+ characters',
  true,
);

// Usage
dv.validate('#myForm', {
  rules: {
    password: {
      required: true,
      strongpassword: true,
    },
  },
});
```

**Greater Than Validator:**

```javascript
dv.addMethod(
  'greaterthan',
  function ({ blank, value, param }) {
    if (blank) return true;

    const otherField = document.querySelector(param);
    return parseFloat(value) > parseFloat(otherField.value);
  },
  'This value must be greater than {0}',
);

// Usage: End date after start date
dv.validate('#myForm', {
  rules: {
    startDate: { required: true, date: true },
    endDate: {
      required: true,
      date: true,
      greaterThan: '#startDate',
    },
  },
  messages: {
    endDate: {
      greaterthan: 'End date must be after start date',
    },
  },
});
```

**Date Range Validator:**

```javascript
dv.addMethod(
  'dateafter',
  function ({ blank, value, param }) {
    if (blank) return true;

    const otherDate = new Date(document.querySelector(param).value);
    return new Date(value) > otherDate;
  },
  'End date must be after start date',
);

// Usage
dv.validate('#myForm', {
  rules: {
    startDate: { required: true, date: true },
    endDate: {
      required: true,
      dateafter: '#startDate',
    },
  },
});
```

**Conditional Required (depends on another field):**

```javascript
dv.addMethod(
  'requiredif',
  function ({ value, param }) {
    const dependentField = document.querySelector(param.selector);
    const dependentValue = param.value;

    if (dependentField.value === dependentValue) {
      // This field is required
      return value.trim().length > 0;
    }
    return true; // Not required
  },
  'This field is required',
);

// Usage: "Other" details required only if category is "other"
dv.validate('#myForm', {
  rules: {
    category: { required: true },
    otherDetails: {
      requiredif: {
        selector: '#category',
        value: 'other',
      },
    },
  },
});
```
