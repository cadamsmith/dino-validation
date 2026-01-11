# 🦖 dino-validation

[![npm version](https://img.shields.io/npm/v/dino-validation.svg)](https://www.npmjs.com/package/dino-validation)
[![bundle size](https://img.shields.io/bundlephobia/minzip/dino-validation)](https://bundlephobia.com/package/dino-validation)

[![CI](https://github.com/cadamsmith/dino-validation/actions/workflows/ci.yml/badge.svg)](https://github.com/cadamsmith/dino-validation/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub issues](https://img.shields.io/github/issues/cadamsmith/dino-validation)](https://github.com/cadamsmith/dino-validation/issues)

A vanilla JavaScript form validation library - no jQuery required.

This library is a partial port of the [jQuery Validation Plugin](https://github.com/jquery-validation/jquery-validation) by Jörn Zaefferer.

## Features

- **17 built-in validation methods** - required, email, URL, number, date, minlength, and more
- **Significantly smaller than jQuery Validation** - Pure vanilla JavaScript with zero dependencies
- **Declarative or programmatic API** - Define rules in HTML attributes or JavaScript
- **Zero dependencies** - No jQuery required, works everywhere
- **Modern ES6+** - ESM and UMD builds for all environments
- **Localization support** - Customize error messages/methods for any locale

## Examples

Explore interactive examples to see dino-validation in action:

- 📝 **[[quick start]](https://codepen.io/cadamsmith/pen/LEZZegj)**
  Simple contact form showing the minimal setup needed to get started. Includes required fields, email validation, and custom error messages.

- 🔄 **[[jquery-validation vs dino-validation]](https://codepen.io/cadamsmith/pen/NPrxMgQ)**
  Side-by-side comparison demonstrating feature parity between jquery-validation and dino-validation. See how the same form behaves identically with both libraries.

- 📋 **[[declarative config]](https://codepen.io/cadamsmith/pen/EayyoMZ)**
  Define all validation rules using HTML data attributes - no JavaScript configuration needed. Perfect for simple forms.

- 🔧 **[[custom methods]](https://codepen.io/cadamsmith/pen/wBWWywb)**
  Extend the library's capabilities by creating custom validation methods for specific business requirements. Demonstrates an age verification method with complex date validation logic.

- 📍 **[[error placement]](https://codepen.io/cadamsmith/pen/QwEKGrj)**
  Customize where and how validation errors are displayed. Showcases six different error placement strategies: default placement, designated containers, tooltips, grid layouts, error summaries, and inline errors.

## Installation

### UMD (CDN)

For direct browser usage via CDN - no build tools required:

```html
<script src="https://cdn.jsdelivr.net/npm/dino-validation@VERSION/dist/dv.min.js"></script>
<script>
  dv.validate('#myForm', {
    rules: {
      email: { required: true, email: true },
    },
  });
</script>
```

### ESM (NPM)

For modern build tools (Vite, webpack, Rollup, etc.):

```bash
npm install dino-validation
```

```javascript
import dv from 'dino-validation';

const validator = dv.validate('#myForm', {
  rules: {
    email: { required: true, email: true },
  },
});
```

## Size Comparison

dino-validation is **significantly smaller** than the jQuery-based alternative:

| Library                              | Bundle Size (minified + gzipped)                                                                                            | Dependencies    |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **dino-validation**                  | ![](https://img.shields.io/bundlephobia/minzip/dino-validation)                                                             | None ✓          |
| **jquery-validation**<br/>(+ jquery) | ![](https://img.shields.io/bundlephobia/minzip/jquery-validation)<br>![](https://img.shields.io/bundlephobia/minzip/jquery) | Requires jQuery |

🦖 **Zero dependencies, modern vanilla JavaScript**

_Bundle sizes from [Bundlephobia](https://bundlephobia.com/) (latest published versions)_

## Browser Support

This library supports all modern evergreen browsers. It requires ES6+ support (browsers from 2017+).

**Desktop:**

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

**Mobile:**

- Safari iOS (last 2 versions)
- Chrome Android (last 2 versions)

Browsers tested in CI using Playwright to ensure cross-browser compatibility.

## Quick Start

### Declarative Validation (HTML Attributes)

Define validation rules directly in HTML using data attributes:

```html
<form id="contactForm">
  <div>
    <label for="email">Email:</label>
    <input
      type="email"
      name="email"
      id="email"
      data-rule-required="true"
      data-rule-email="true"
      placeholder="your@email.com"
    />
  </div>

  <div>
    <label for="message">Message:</label>
    <textarea
      name="message"
      id="message"
      data-rule-required="true"
      data-rule-minlength="10"
      placeholder="Your message (min 10 characters)"
    ></textarea>
  </div>

  <button type="submit">Send</button>
</form>

<script>
  // Initialize validator
  dv.validate('#contactForm');
</script>
```

### Programmatic Validation (JavaScript)

Define validation rules in JavaScript for more control:

```javascript
dv.validate('#contactForm', {
  rules: {
    email: {
      required: true,
      email: true,
    },
    message: {
      required: true,
      minlength: 10,
    },
  },
  messages: {
    email: {
      required: 'Please enter your email address',
      email: 'Please enter a valid email address',
    },
    message: {
      required: 'Please enter a message',
      minlength: 'Your message must be at least 10 characters long',
    },
  },
});
```

### Checking Validation Status

```javascript
// Check if entire form is valid
if (dv.valid('#contactForm')) {
  console.log('Form is ready to submit!');
}

// Check specific field
if (dv.valid('#email')) {
  console.log('Email is valid');
}

// Check multiple fields
if (dv.valid('#email, #message')) {
  console.log('Both fields are valid');
}

// Using element reference
const emailInput = document.getElementById('email');
if (dv.valid(emailInput)) {
  console.log('Email is valid');
}
```

## Migrating from jQuery Validation

If you're familiar with the jQuery Validation Plugin, transitioning to dino-validation is straightforward.

The API is intentionally similar to minimize the learning curve.

### API Method Mapping

| jQuery Validation              | dino-validation                 | Notes                      |
| ------------------------------ | ------------------------------- | -------------------------- |
| `$('#form').validate(options)` | `dv.validate('#form', options)` | Returns Validator instance |
| `$('#form').valid()`           | `dv.valid('#form')`             | Returns boolean            |
| `$('#field').valid()`          | `dv.valid('#field')`            | Returns boolean            |
| `$.validator.addMethod(...)`   | `dv.addMethod(...)`             | Add custom validators      |

### Key Differences

**1. No jQuery Dependency**

- dino-validation uses pure vanilla JavaScript
- No jQuery chain - methods return values directly

**2. Validation Method Signature**

```javascript
// jQuery Validation
jQuery.validator.addMethod(
  'phone',
  function (value, element) {
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
);
```

### Features Not Included

dino-validation is a partial port of jQuery Validation. The following features are **not implemented**:

**Missing Validation Methods:**

- `step` - Step increment validation (e.g., multiples of 5)
- `remote` - Server-side AJAX validation

**Missing Options:**

- `normalizer` - Transform field values before validation
- `groups` - Group multiple fields into a single error message
- `focusInvalid` - enable/disable focusing of invalid elements on form submission

## Core API

### dv.validate(selector, options)

Creates or retrieves a validator for a form element. If a validator already exists for the element, returns the existing instance.

**Parameters:**

- `selector` (string | Element): CSS selector string or HTMLFormElement to validate
- `options` (object, optional): Validation configuration

**Returns:** Validator instance or undefined if element not found

**Example:**

```javascript
const validator = dv.validate('#myForm', {
  rules: {
    username: {
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      required: true,
      email: true,
    },
  },
  messages: {
    username: {
      required: 'Please enter a username',
      minlength: 'Username must be at least 3 characters',
      maxlength: 'Username cannot exceed 20 characters',
    },
  },
  errorPlacement: (error, element) => {
    // Custom error placement
    element.parentElement.appendChild(error);
  },
  highlight: (element) => {
    element.classList.add('is-invalid');
  },
  unhighlight: (element) => {
    element.classList.remove('is-invalid');
  },
});

// Validator instance is cached - calling again returns same instance
const sameValidator = dv.validate('#myForm');
console.log(validator === sameValidator); // true
```

### dv.valid(selector)

Validates form or form elements and returns whether they are valid. Triggers validation without submitting the form.

**Parameters:**

- `selector` (string | HTMLElement | HTMLElement[]): Element(s) to validate

**Returns:** `true` if all element(s) are valid, `false` otherwise

**Examples:**

```javascript
// Validate entire form
if (dv.valid('#myForm')) {
  console.log('Form is valid!');
} else {
  console.log('Form has errors');
}

// Validate single field
if (dv.valid('#email')) {
  console.log('Email is valid');
}

// Validate multiple fields
if (dv.valid('#email', #password')) {
  console.log('Both email and password are valid');
}

// Use with element reference
const emailInput = document.getElementById('email');
if (dv.valid(emailInput)) {
  console.log('Email is valid');
}

// Validate before enabling submit button
document.getElementById('submitBtn').disabled = !dv.valid('#myForm');
```

### dv.rules(selector)

Gets the validation rules for an element, merging rules from all sources (HTML attributes, data attributes, CSS classes, and programmatic rules).

**Parameters:**

- `selector` (string | HTMLElement): CSS selector string or HTMLElement

**Returns:** Object containing validation rules for the element

**Example:**

```javascript
// HTML:
// <input id="email" class="required" type="email" minlength="5" />

const emailRules = dv.rules('#email');
console.log(emailRules);
// { required: true, email: true, minlength: 5 }

// Use for dynamic rule inspection
if (emailRules.minlength) {
  console.log(`Email must be at least ${emailRules.minlength} characters`);
}

// Check if field is required
if (emailRules.required) {
  document.querySelector('label[for="email"]').innerHTML += ' *';
}
```

### dv.addMethod(name, method, message)

Adds a custom validation method that can be used in validation rules.

**Parameters:**

- `name` (string): Name of the validation method
- `method` (function): Validation function that returns `true` if valid
- `message` (string, optional): Default error message

See [Custom Validation Methods](#custom-validation-methods) for detailed function signature, parameters, and examples.

### dv.localize(data)

Replaces default error messages or validation methods with localized versions. Use this for multi-language support.

**Parameters:**

- `data` (object): Object containing either localized error messages (string values) or validation methods (function values)
  - If values are strings, replaces error messages
  - If values are functions, replaces validation methods

**Returns:** None

See [Localization](#localization) for more information.

## Built-in Validation Methods

dino-validation includes 17 built-in validation methods covering common validation scenarios.

### `required`

Validates that the field has a value (is not empty).

**Parameters:** None

**Examples:**

```javascript
// JavaScript
dv.validate('#myForm', {
  rules: {
    username: { required: true },
  },
});
```

### `email`

Validates email address format using RFC-compliant regex.

**Parameters:** None

**Examples:**

```javascript
dv.validate('#myForm', {
  rules: {
    email: { email: true },
  },
});
```

**Accepts:** `user@example.com`, `first.last@domain.co.uk`, `user+tag@example.com`

---

### `url`

Validates URL format (HTTP/HTTPS/FTP).

**Parameters:** None

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    website: { url: true },
  },
});
```

**Accepts:** `http://example.com`, `https://example.com/path?query=value`, `ftp://files.example.com`

---

### `date`

Validates that the field contains a parseable date string.

**Parameters:** None

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    birthdate: { date: true },
  },
});
```

**Accepts:** `12/31/2024`, `2024-12-31`, `December 31, 2024`, any format parseable by `new Date()`

**Recommendation:** For more reliable date validation across different browsers and locales, use `dateISO` instead, which enforces the ISO 8601 format (YYYY-MM-DD).

---

### `dateISO`

Validates ISO 8601 date format (YYYY-MM-DD or YYYY/MM/DD).

**Parameters:** None

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    startDate: { dateISO: true },
  },
});
```

**Accepts:** `2024-12-31`, `2024/12/31`
**Rejects:** `12/31/2024`

---

### `creditcard`

Validates credit card number using the Luhn algorithm.

**Parameters:** None

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    cardNumber: { creditcard: true },
  },
});
```

**Accepts:** 13-19 digit numbers, spaces and dashes are stripped automatically

---

### `digits`

Validates that the field contains only numeric digits (0-9).

**Parameters:** None

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    zipCode: { digits: true },
  },
});
```

**Accepts:** `12345`, `000`, `99999`
**Rejects:** Decimals, negative numbers, letters (use `number` for decimals)

---

### `number`

Validates numeric values including decimals and comma-separated thousands.

**Parameters:** None

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    amount: { number: true },
  },
});
```

**Accepts:** `100`, `100.50`, `1,000.00`, `-50.5`

### `minlength`

Validates minimum length.

**Parameters:** `integer` - minimum length

**Examples:**

```javascript
dv.validate('#myForm', {
  rules: {
    username: { minlength: 3 },
  },
});
```

**Works with:**

- Text inputs/textareas: Character count
- Checkboxes/radios/selects: Number of selected items

---

### `maxlength`

Validates maximum length.

**Parameters:** `integer` - maximum length

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    username: { maxlength: 20 },
  },
});
```

**Works with:**

- Text inputs/textareas: Character count
- Checkboxes/radios/selects: Number of selected items

---

### `rangelength`

Validates length is within a range.

**Parameters:** `[min, max]` - array with minimum and maximum lengths

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    bio: { rangelength: [10, 500] },
  },
});
```

**Works with:**

- Text inputs/textareas: Character count
- Checkboxes/radios/selects: Number of selected items

### `min`

Validates that numeric value is greater than or equal to minimum.

**Parameters:** `number` - minimum value

**Examples:**

```javascript
dv.validate('#myForm', {
  rules: {
    age: { min: 18 },
  },
});
```

---

### `max`

Validates that numeric value is less than or equal to maximum.

**Parameters:** `number` - maximum value

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    percentage: { max: 100 },
  },
});
```

---

### `range`

Validates that numeric value is within a range.

**Parameters:** `[min, max]` - array with minimum and maximum values

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    rating: { range: [1, 5] },
  },
});
```

### `equalTo`

Validates that field value matches another field's value (e.g., password confirmation).

**Parameters:** `string` - CSS selector of target field

**Examples:**

```javascript
dv.validate('#myForm', {
  rules: {
    confirmPassword: { equalTo: '#password' },
  },
});
```

---

### `regex`

Validates that value matches a regular expression pattern.

**Parameters:** `string` - regex pattern (must match entire string)

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    username: { regex: '^[a-zA-Z0-9_-]+$' },
  },
});
```

**Note:** Pattern must match from start to end of string.

---

### `nonalphamin`

Validates minimum count of non-alphanumeric characters (example: password strength).

**Parameters:** `integer` - minimum number of special characters required

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    password: { nonalphamin: 1 },
  },
});
```

## Configuration

TODO: fill this in

## Error Messages

By default, the library will display the default error messages for validation methods.

You can configure these error messages to be exactly what you want.

Two ways to specify custom error messages:

**1. Per-field in config object**

```javascript
dv.validate('#myForm', {
  rules: {
    email: { required: true, email: true },
  },
  messages: {
    email: {
      required: 'Please enter your email address',
      email: 'Invalid email format',
    },
  },
});
```

```javascript
dv.validate('#myForm', {
  rules: {
    username: { minlength: 5, maxlength: 20 },
  },
  messages: {
    username: {
      // parameterized messages (will insert 5 and 20 for the placeholders)
      minlength: 'Username must be at least {0} characters',
      maxlength: 'Username cannot exceed {0} characters',
    },
  },
});
```

**2. Data attributes**

```html
<input
  type="email"
  name="email"
  data-rule-required="true"
  data-rule-email="true"
  data-msg-required="Email is required"
  data-msg-email="Please enter a valid email"
/>
```

## Custom Validation Methods

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

### Examples

**URL Slug Validator:**

```javascript
dv.addMethod(
  'slug',
  function ({ blank, value }) {
    // Lowercase letters, numbers, and hyphens only
    return blank || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  },
  'URL slug must contain lowercase letters, numbers, and hyphens only',
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
  'strongPassword',
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
);

// Usage
dv.validate('#myForm', {
  rules: {
    password: {
      required: true,
      strongPassword: true,
    },
  },
});
```

**Greater Than Validator:**

```javascript
dv.addMethod(
  'greaterThan',
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
      greaterThan: 'End date must be after start date',
    },
  },
});
```

**Date Range Validator:**

```javascript
dv.addMethod(
  'dateAfter',
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
      dateAfter: '#startDate',
    },
  },
});
```

**Conditional Required (depends on another field):**

```javascript
dv.addMethod(
  'requiredIf',
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
      requiredIf: {
        selector: '#category',
        value: 'other',
      },
    },
  },
});
```

## Localization

dino-validation supports multiple languages.

You can use pre-built localization files provided by the library, or create your own custom translations using `dv.localize()`.

### Using Localization Builds

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

### Custom Localization

Use `dv.localize()` to translate error messages yourself.

```javascript
// Custom messages (use any language or wording you want)
dv.localize({
  required: 'Beep boop! This field cannot be empty.',
  email: "Beep! That doesn't look like a valid email address.",
  url: 'Boop! Please enter a valid URL.',
  date: 'Beep boop! Invalid date detected.',
  dateISO: 'Boop! Date must be in ISO format (YYYY-MM-DD).',
  number: 'Beep! Numbers only, please.',
  digits: 'Boop boop! Only digits allowed (0-9).',
  equalTo: 'Beep! These values must match.',
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

## Coming Soon

The following features are planned for future releases:

- **Additional validation methods** - Port community-contributed validation methods from jQuery Validation's `additional-methods.js` dist file
- **Normalizer support** - Ability to transform/normalize field values before validation (e.g., trim whitespace, convert to lowercase)
- **Documentation site** - Dedicated documentation website with interactive examples and improved navigation
- **Unobtrusive validation support** - Support for `data-val-*` attributes to enable seamless integration with server-side frameworks (ASP.NET MVC, etc.) where validation rules defined in server-side model annotations are automatically applied client-side

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Setting up your development environment
- Making changes and running tests
- Conventions & Pull request process

## License

MIT License - See [LICENSE](LICENSE) file for details.

This library is based on the [jQuery Validation Plugin](https://github.com/jquery-validation/jquery-validation) by Jörn Zaefferer.
