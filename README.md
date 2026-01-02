# 🦖 dino-validation

[![CI](https://github.com/cadamsmith/dino-validation/actions/workflows/ci.yml/badge.svg)](https://github.com/cadamsmith/dino-validation/actions/workflows/ci.yml)

A vanilla JavaScript form validation library - no jQuery required.

> ⚠️ **Work in Progress** - This library is currently under active development and not yet ready for production use.

This library is a partial port of the [jQuery Validation Plugin](https://github.com/jquery-validation/jquery-validation) by Jörn Zaefferer.

## Features

- **17 built-in validation methods** - email, URL, number, date, minlength, and more
- **Declarative or programmatic API** - Define rules in HTML attributes or JavaScript
- **Zero dependencies** - Pure vanilla JavaScript, no jQuery required
- **Modern ES6+** - ESM and UMD builds for all environments
- **Localization support** - Customize error messages for any language

## Table of Contents

- [Installation](#installation)
- [Browser Support](#browser-support)
- [Quick Start](#quick-start)
  - [Declarative Validation (HTML Attributes)](#declarative-validation-html-attributes)
  - [Programmatic Validation (JavaScript)](#programmatic-validation-javascript)
  - [Checking Validation Status](#checking-validation-status)
- [Migrating from jQuery Validation](#migrating-from-jquery-validation)
  - [API Method Mapping](#api-method-mapping)
  - [Key Differences](#key-differences)
  - [Custom Validator Comparison](#custom-validator-comparison)
  - [Features Not Included](#features-not-included)
- [Core API](#core-api)
  - [dv.validate()](#dvvalidateselector-options)
  - [dv.valid()](#dvvalidselector)
  - [dv.rules()](#dvrulesselector)
  - [dv.addMethod()](#dvaddmethodname-method-message)
  - [dv.localize()](#dvlocalizemessages)
- [Built-in Validators](#built-in-validators)
  - [Required Field Validators](#required-field-validators)
  - [String Format Validators](#string-format-validators)
  - [Length Validators](#length-validators)
  - [Numeric Validators](#numeric-validators)
  - [Comparison Validators](#comparison-validators)
  - [Real-world Validator Combinations](#real-world-validator-combinations)
- [Configuration & Customization](#configuration--customization)
  - [Error Display Configuration](#error-display-configuration)
  - [Event Handling](#event-handling)
  - [Validation Behavior](#validation-behavior)
  - [Success & Error Callbacks](#success--error-callbacks)
  - [Custom Error Messages](#custom-error-messages)
  - [Real-world Configuration Examples](#real-world-configuration-examples)
- [Custom Validators](#custom-validators)
  - [Custom Validator Basics](#custom-validator-basics)
  - [Pattern Matching Examples](#pattern-matching-examples)
  - [Conditional/Cross-field Validators](#conditionalcross-field-validators)
  - [File Upload Validators](#file-upload-validators)
- [Localization](#localization)
  - [Using Localization Builds](#using-localization-builds)
  - [Custom Localization](#custom-localization)
- [Coming Soon](#coming-soon)
- [Contributing](#contributing)
- [Local Development](#local-development)
- [License](#license)

## Installation

```bash
npm install dino-validation
```

### ESM vs UMD

Choose the right build for your environment:

| Format  | Use Case                                 | Import                                                                                   |
| ------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| **ESM** | Modern build tools (Vite, webpack, etc.) | `import dv from 'dino-validation'`                                                       |
| **UMD** | Browsers, legacy builds, CDN             | `<script src="dist/dv.js"></script>`<br/>OR<br/>`<script src="dist/dv.min.js"></script>` |

**ESM Example:**

```javascript
import dv from 'dino-validation';

const validator = dv.validate('#myForm', {
  rules: {
    email: { required: true, email: true },
  },
});
```

**UMD Example:**

```html
<script src="node_modules/dino-validation/dist/dv.min.js"></script>
<script>
  dv.validate('#myForm', {
    rules: {
      email: { required: true, email: true },
    },
  });
</script>
```

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
if (dv.valid(['#email', '#message'])) {
  console.log('Both fields are valid');
}

// Using element reference
const emailInput = document.getElementById('email');
if (dv.valid(emailInput)) {
  console.log('Email is valid');
}
```

## Migrating from jQuery Validation

If you're familiar with the jQuery Validation Plugin, transitioning to dino-validation is straightforward. The API is intentionally similar to minimize the learning curve.

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

**3. Message Placeholder Syntax**

- jQuery Validation uses `{0}` in messages
- dino-validation also uses `{0}`, `{1}`, etc. (same syntax!)

### Custom Validator Comparison

Both libraries support custom validators with similar syntax:

```javascript
// jQuery Validation
jQuery.validator.addMethod(
  'usernameAvailable',
  function (value, element) {
    if (this.optional(element)) return true;

    // Check availability
    return checkUsername(value);
  },
  'Username is already taken',
);

// dino-validation
dv.addMethod(
  'usernameAvailable',
  function ({ blank, value, element }) {
    if (blank) return true;

    // Check availability
    return checkUsername(value);
  },
  'Username is already taken',
);
```

**Key change**: Instead of `this.optional(element)`, use the `blank` parameter.

### Features Not Included

dino-validation is a partial port of jQuery Validation. The following features are **not implemented**:

**Missing Validators:**

- `step` - Step increment validation (e.g., multiples of 5)
- `remote` - Server-side AJAX validation

**Workaround for `remote`:** Use `dv.addMethod()` to create custom async validators:

```javascript
dv.addMethod(
  'usernameAvailable',
  async function ({ blank, value }) {
    if (blank) return true;
    const response = await fetch(`/api/check/${value}`);
    const data = await response.json();
    return data.available;
  },
  'Already taken',
);
```

**Missing Options:**

- `normalizer` - Transform field values before validation
- `groups` - Group multiple fields into a single error message

If you need these features, you'll need to implement custom solutions or use jQuery Validation directly.

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

**Returns:** `true` if all elements are valid, `false` otherwise

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
if (dv.valid(['#email', '#password'])) {
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

**Validation Function Signature:**

```typescript
function({ blank, value, values, length, element, param }): boolean
```

**Input Parameters:**

- `blank` (boolean): `true` if field is empty
- `value` (string): Field's value
- `values` (string[]): For radio/checkbox groups, array of selected values
- `length` (number): Character count of value
- `element` (FormControlElement): The input element
- `param` (any): Parameter passed in rule definition

**Examples:**

**Simple Pattern Matching:**

```javascript
dv.addMethod(
  'phone',
  function ({ blank, value }) {
    return blank || /^\d{3}-\d{3}-\d{4}$/.test(value);
  },
  'Please enter a valid phone number (xxx-xxx-xxxx)',
);

// Use in validation rules
dv.validate('#myForm', {
  rules: {
    phoneNumber: { phone: true },
  },
});
```

**Parameterized Validator:**

```javascript
dv.addMethod(
  'notContains',
  function ({ blank, value, param }) {
    return blank || !value.includes(param);
  },
  'This field cannot contain "{0}"',
);

// Use with parameter
dv.validate('#myForm', {
  rules: {
    bio: { notContains: 'spam' },
  },
});
```

**Async Validator:**

```javascript
dv.addMethod(
  'usernameAvailable',
  async function ({ blank, value }) {
    if (blank) return true;

    const response = await fetch(`/api/check-username/${value}`);
    const data = await response.json();
    return data.available;
  },
  'This username is already taken',
);

dv.validate('#myForm', {
  rules: {
    username: {
      required: true,
      usernameAvailable: true,
    },
  },
});
```

### dv.localize(messages)

Replaces all default error messages with localized versions. Use this for multi-language support.

**Parameters:**

- `messages` (object): Object mapping validator names to localized error messages

**Returns:** None

**Example:**

```javascript
// French localization
dv.localize({
  required: 'Ce champ est obligatoire.',
  email: 'Veuillez entrer une adresse email valide.',
  url: 'Veuillez entrer une URL valide.',
  date: 'Veuillez entrer une date valide.',
  dateISO: 'Veuillez entrer une date valide (ISO).',
  number: 'Veuillez entrer un nombre valide.',
  digits: 'Veuillez entrer uniquement des chiffres.',
  equalTo: 'Veuillez entrer la même valeur à nouveau.',
  maxlength: 'Veuillez entrer au maximum {0} caractères.',
  minlength: 'Veuillez entrer au moins {0} caractères.',
  rangelength: 'Veuillez entrer une valeur entre {0} et {1} caractères.',
  range: 'Veuillez entrer une valeur entre {0} et {1}.',
  max: 'Veuillez entrer une valeur inférieure ou égale à {0}.',
  min: 'Veuillez entrer une valeur supérieure ou égale à {0}.',
  creditcard: 'Veuillez entrer un numéro de carte de crédit valide.',
  regex: 'Veuillez entrer une valeur qui correspond au modèle {0}.',
  nonalphamin: 'Veuillez entrer au moins {0} caractères non-alphabétiques.',
});
```

**Partial localization:**

You don't need to provide all messages - only override the ones you need:

```javascript
// Just change a few messages
dv.localize({
  required: 'This field is mandatory',
  email: 'Invalid email format',
});
```

## Built-in Validators

dino-validation includes 17 built-in validators covering common validation scenarios.

### Required Field Validators

#### `required`

Validates that the field has a value (is not empty).

**Parameters:** None

**Examples:**

```html
<!-- HTML attribute -->
<input type="text" name="username" required />

<!-- Data attribute -->
<input type="text" name="username" data-rule-required="true" />

<!-- CSS class -->
<input type="text" name="username" class="required" />
```

```javascript
// JavaScript
dv.validate('#myForm', {
  rules: {
    username: { required: true },
  },
});
```

**Default message:** "This field is required."

### String Format Validators

#### `email`

Validates email address format using RFC-compliant regex.

**Parameters:** None

**Examples:**

```html
<input type="email" name="email" data-rule-email="true" />
```

```javascript
dv.validate('#myForm', {
  rules: {
    email: { email: true },
  },
});
```

**Accepts:** `user@example.com`, `first.last@domain.co.uk`, `user+tag@example.com`

**Important:** Accepts empty values. Combine with `required` for mandatory email fields.

**Default message:** "Please enter a valid email address."

---

#### `url`

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

**Default message:** "Please enter a valid URL."

---

#### `date`

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

**Default message:** "Please enter a valid date."

---

#### `dateISO`

Validates ISO 8601 date format (YYYY-MM-DD or YYYY/MM/DD).

**Parameters:** None

**Example:**

```html
<input type="date" name="startDate" />
<!-- dateISO automatically applied to type="date" inputs -->
```

```javascript
dv.validate('#myForm', {
  rules: {
    startDate: { dateISO: true },
  },
});
```

**Accepts:** `2024-12-31`, `2024/12/31`
**Rejects:** `12/31/2024` (use `date` instead)

**Default message:** "Please enter a valid date (ISO)."

---

#### `creditcard`

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

**Default message:** "Please enter a valid credit card number."

---

#### `digits`

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

**Default message:** "Please enter only digits."

---

#### `number`

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

**Default message:** "Please enter a valid number."

### Length Validators

#### `minlength`

Validates minimum string length.

**Parameters:** `integer` - minimum character count

**Examples:**

```html
<input type="text" name="username" minlength="3" />
<!-- or -->
<input type="text" name="username" data-rule-minlength="3" />
```

```javascript
dv.validate('#myForm', {
  rules: {
    username: { minlength: 3 },
  },
});
```

**Works with:** Character count (not bytes), applies to text inputs and textareas

**Default message:** "Please enter at least {0} characters."

---

#### `maxlength`

Validates maximum string length.

**Parameters:** `integer` - maximum character count

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    username: {
      minlength: 3,
      maxlength: 20,
    },
  },
});
```

**Default message:** "Please enter no more than {0} characters."

---

#### `rangelength`

Validates string length is within a range.

**Parameters:** `[min, max]` - array with minimum and maximum character counts

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    bio: { rangelength: [10, 500] },
  },
  messages: {
    bio: 'Your bio must be between 10 and 500 characters',
  },
});
```

**Default message:** "Please enter a value between {0} and {1} characters long."

### Numeric Validators

#### `min`

Validates that numeric value is greater than or equal to minimum.

**Parameters:** `number` - minimum value

**Examples:**

```html
<input type="number" name="age" min="18" />
```

```javascript
dv.validate('#myForm', {
  rules: {
    age: { min: 18 },
  },
});
```

**Default message:** "Please enter a value greater than or equal to {0}."

---

#### `max`

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

**Default message:** "Please enter a value less than or equal to {0}."

---

#### `range`

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

**Default message:** "Please enter a value between {0} and {1}."

### Comparison Validators

#### `equalTo`

Validates that field value matches another field's value (e.g., password confirmation).

**Parameters:** `string` - CSS selector of target field

**Examples:**

```html
<input type="password" name="password" id="password" />
<input type="password" name="confirmPassword" data-rule-equalto="#password" />
```

```javascript
dv.validate('#myForm', {
  rules: {
    password: { required: true, minlength: 8 },
    confirmPassword: {
      required: true,
      equalTo: '#password',
    },
  },
  messages: {
    confirmPassword: {
      equalTo: 'Passwords do not match',
    },
  },
});
```

**Default message:** "Please enter the same value again."

---

#### `regex`

Validates that value matches a regular expression pattern.

**Parameters:** `string` - regex pattern (must match entire string)

**Example:**

```javascript
dv.addMethod(
  'regex',
  function ({ blank, value, param }) {
    if (blank) return true;
    const match = new RegExp(param).exec(value);
    return !!match && match.index === 0 && match[0].length === value.length;
  },
  'Please enter a value matching the pattern {0}.',
);

dv.validate('#myForm', {
  rules: {
    username: { regex: '^[a-zA-Z0-9_-]+$' },
  },
});
```

**Note:** Pattern must match from start to end of string.

**Default message:** "Please enter a value that matches the pattern {0}."

---

#### `nonalphamin`

Validates minimum count of non-alphanumeric characters (for password strength).

**Parameters:** `integer` - minimum number of special characters required

**Example:**

```javascript
dv.validate('#myForm', {
  rules: {
    password: {
      required: true,
      minlength: 8,
      nonalphamin: 1, // At least 1 special character
    },
  },
});
```

**Common special characters:** `!@#$%^&*()_+-=[]{}|;:,.<>?`

**Default message:** "Please enter at least {0} non-alphabetic characters."

### Real-world Validator Combinations

**Username Validation:**

```javascript
username: {
  required: true,
  minlength: 3,
  maxlength: 20,
  regex: '^[a-zA-Z0-9_-]+$'
}
```

**Strong Password Validation:**

```javascript
password: {
  required: true,
  minlength: 12,
  nonalphamin: 2  // At least 2 special characters
}
```

**Age Validation:**

```javascript
age: {
  required: true,
  number: true,
  min: 18,
  max: 120
}
```

**Discount Code Validation:**

```javascript
discountCode: {
  minlength: 5,
  maxlength: 10,
  regex: '^[A-Z0-9]+$'  // Uppercase letters and numbers only
}
```

**Email with Confirmation:**

```javascript
rules: {
  email: {
    required: true,
    email: true
  },
  emailConfirm: {
    required: true,
    equalTo: '#email'
  }
}
```

## Configuration & Customization

dino-validation is highly customizable. Control how errors are displayed, when validation occurs, and how fields are styled.

### Error Display Configuration

#### `errorClass` and `validClass`

CSS classes applied to invalid/valid fields.

**Defaults:** `errorClass: 'error'`, `validClass: 'valid'`

**Example:**

```javascript
dv.validate('#myForm', {
  errorClass: 'is-invalid',
  validClass: 'is-valid',
});
```

**CSS:**

```css
.is-invalid {
  border-color: #dc3545;
  background-color: #fff5f5;
}

.is-valid {
  border-color: #28a745;
}
```

---

#### `errorElement` and `wrapper`

Control the HTML structure of error messages.

**Defaults:** `errorElement: 'label'`, `wrapper: null`

**Example:**

```javascript
dv.validate('#myForm', {
  errorElement: 'span',
  wrapper: 'div',
});
```

**Renders as:**

```html
<div><span class="error">Error message here</span></div>
```

---

#### `errorPlacement`

Custom function to position error messages.

**Signature:** `(error: HTMLElement, element: FormControlElement) => void`

**Default behavior:** Appends error after the field

**Example 1: Place in specific container**

```javascript
dv.validate('#myForm', {
  errorPlacement: (error, element) => {
    const fieldName = element.name;
    const errorContainer = document.getElementById(`error-${fieldName}`);
    errorContainer.appendChild(error);
  },
});
```

**Example 2: Place in form row**

```javascript
dv.validate('#myForm', {
  errorPlacement: (error, element) => {
    const row = element.closest('.form-row');
    row.querySelector('.error-target').appendChild(error);
  },
});
```

**Example 3: Tooltip-style errors**

```javascript
dv.validate('#myForm', {
  errorPlacement: (error, element) => {
    error.classList.add('tooltip');
    element.parentElement.appendChild(error);
  },
});
```

---

#### `highlight` and `unhighlight`

Custom functions to add/remove error styling.

**Signature:** `(element: FormControlElement, errorClasses: string[], validClasses: string[]) => void`

**Default behavior:** Adds/removes `errorClass` and `validClass`

**Example 1: Bootstrap styling**

```javascript
dv.validate('#myForm', {
  highlight: (element) => {
    element.classList.add('is-invalid');
    element.closest('.form-group')?.classList.add('has-error');
  },
  unhighlight: (element) => {
    element.classList.remove('is-invalid');
    element.closest('.form-group')?.classList.remove('has-error');
  },
});
```

**Example 2: Custom validation states**

```javascript
dv.validate('#myForm', {
  highlight: (element, errorClasses) => {
    element.classList.add(...errorClasses);
    element.setAttribute('aria-invalid', 'true');
  },
  unhighlight: (element, errorClasses) => {
    element.classList.remove(...errorClasses);
    element.setAttribute('aria-invalid', 'false');
  },
});
```

---

#### `errorLabelContainer` and `errorContainer`

Group error messages in a single location.

**Example: Error summary at top of form**

```html
<div id="errorSummary" style="display: none;">
  <h3>Please fix the following errors:</h3>
  <ul id="errorList"></ul>
</div>

<form id="myForm">
  <!-- form fields -->
</form>
```

```javascript
dv.validate('#myForm', {
  errorContainer: '#errorSummary',
  errorLabelContainer: '#errorList ul',
});
```

### Event Handling

Control when validation occurs.

#### `onfocusout`, `onkeyup`, `onclick`, `onfocusin`

Can be boolean (enable/disable) or custom function.

**Defaults:** `onfocusout: true`, others: `false`

**Example 1: Validate on blur (recommended for UX)**

```javascript
dv.validate('#myForm', {
  onfocusout: (element) => {
    // Validate when user leaves field
    dv.valid(element);
  },
});
```

**Example 2: Real-time validation with debounce**

```javascript
let timeoutId;
dv.validate('#myForm', {
  onkeyup: (element) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      dv.valid(element);
    }, 300); // Wait 300ms after last keystroke
  },
});
```

**Example 3: Disable all event validation**

```javascript
dv.validate('#myForm', {
  onfocusout: false,
  onkeyup: false,
  onclick: false,
});
```

---

#### `onsubmit`

Controls whether form validates on submit.

**Default:** `true`

**Example: Manual validation control**

```javascript
const validator = dv.validate('#myForm', { onsubmit: false });

document.getElementById('submitBtn').addEventListener('click', () => {
  if (validator.form()) {
    // Validation passed, submit form
    document.getElementById('myForm').submit();
  }
});
```

### Validation Behavior

#### `ignore`

CSS selector for elements to ignore during validation.

**Default:** `':hidden'` (skip hidden fields)

**Example: Also ignore disabled fields**

```javascript
dv.validate('#myForm', {
  ignore: ':hidden, :disabled',
});
```

---

#### `focusCleanup`

Remove error class when field gets focus.

**Default:** `false`

**Example:**

```javascript
dv.validate('#myForm', {
  focusCleanup: true,
});
```

---

#### `escapeHtml`

Escape HTML in error messages to prevent XSS attacks.

**Default:** `false`

**Important:** Enable if error messages come from user input.

**Example:**

```javascript
dv.validate('#myForm', {
  escapeHtml: true, // Prevents <script> tags in custom messages
});
```

---

#### `debug`

Enable debug mode (prevents form submission, useful during development).

**Default:** `false`

**Example:**

```javascript
dv.validate('#myForm', {
  debug: true, // Form won't submit, check console for validation info
});
```

### Success & Error Callbacks

#### `success`

Callback when field passes validation. Can be a CSS class or function.

**Example 1: Add success class**

```javascript
dv.validate('#myForm', {
  success: 'valid-field',
});
```

**Example 2: Custom success handler**

```javascript
dv.validate('#myForm', {
  success: (labels, element) => {
    labels.forEach((label) => {
      label.classList.add('success-msg');
      label.textContent = '✓ Looks good!';
    });
  },
});
```

---

#### `invalidHandler`

Callback when form submission fails validation.

**Signature:** `(event: CustomEvent<ValidationError[]>) => void`

**Example: Display error summary**

```javascript
dv.validate('#myForm', {
  invalidHandler: (event) => {
    const errors = event.detail;
    console.log(`Form has ${errors.length} error(s)`);

    // Display error summary
    const errorList = document.getElementById('errorSummary');
    errorList.innerHTML =
      '<h4>Please fix the following:</h4>' +
      errors
        .map((err) => `<li>${err.element.name}: ${err.message}</li>`)
        .join('');
  },
});
```

### Custom Error Messages

Three ways to specify custom error messages:

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

**3. Parameterized messages**

```javascript
dv.validate('#myForm', {
  rules: {
    username: { minlength: 5, maxlength: 20 },
  },
  messages: {
    username: {
      minlength: 'Username must be at least {0} characters',
      maxlength: 'Username cannot exceed {0} characters',
    },
  },
});
```

### Real-world Configuration Examples

**Bootstrap Form Styling:**

```javascript
dv.validate('#myForm', {
  errorClass: 'is-invalid',
  validClass: 'is-valid',
  errorElement: 'div',
  errorPlacement: (error, element) => {
    error.classList.add('invalid-feedback', 'd-block');
    element.parentElement.appendChild(error);
  },
  highlight: (element) => {
    element.classList.add('is-invalid');
  },
  unhighlight: (element) => {
    element.classList.remove('is-invalid');
  },
});
```

**Inline Validation with Real-time Feedback:**

```javascript
dv.validate('#myForm', {
  onfocusout: (element) => dv.valid(element),
  onkeyup: (element) => dv.valid(element),
  errorElement: 'span',
  errorPlacement: (error, element) => {
    error.classList.add('help-text');
    element.parentElement.appendChild(error);
  },
  highlight: (element) => {
    element.classList.add('error');
  },
  unhighlight: (element) => {
    element.classList.remove('error');
  },
});
```

**Form Submission with Loading Spinner:**

```javascript
dv.validate('#myForm', {
  invalidHandler: (event) => {
    // Stop spinner if validation fails
    document.querySelector('[type="submit"]').disabled = false;
    document.querySelector('.spinner').style.display = 'none';
  },
});

document.getElementById('myForm').addEventListener('submit', (e) => {
  if (!dv.valid('#myForm')) {
    e.preventDefault();
    return;
  }

  // Show spinner while submitting
  document.querySelector('[type="submit"]').disabled = true;
  document.querySelector('.spinner').style.display = 'inline-block';
});
```

## Custom Validators

Extend dino-validation with custom validation rules for your specific needs.

### Custom Validator Basics

**Validator Function Signature:**

```typescript
function({ blank, value, values, length, element, param }): boolean
```

**Input Parameters:**

- `blank` (boolean): `true` if field is empty
- `value` (string): Field's value
- `values` (string[]): For radio/checkbox groups, array of selected values
- `length` (number): Character count of value
- `element` (FormControlElement): The input element
- `param` (any): Parameter passed in rule definition

**Return Value:** `true` if valid, `false` if invalid

### Pattern Matching Examples

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

### Conditional/Cross-field Validators

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

### File Upload Validators

**File Type Validator:**

```javascript
dv.addMethod(
  'fileType',
  function ({ blank, element, param }) {
    if (blank || !element.files?.length) return true;

    const file = element.files[0];
    const allowedTypes = param.split(',').map((t) => t.trim());

    return allowedTypes.some((type) => file.type.startsWith(type));
  },
  'Please upload a file of type: {0}',
);

// Usage
dv.validate('#myForm', {
  rules: {
    profileImage: {
      required: true,
      fileType: 'image/jpeg,image/png,image/webp',
    },
  },
  messages: {
    profileImage: {
      fileType: 'Please upload a JPEG, PNG, or WebP image',
    },
  },
});
```

**File Size Validator:**

```javascript
dv.addMethod(
  'fileSize',
  function ({ blank, element, param }) {
    if (blank || !element.files?.length) return true;

    const file = element.files[0];
    const maxSizeInBytes = param * 1024 * 1024; // Convert MB to bytes

    return file.size <= maxSizeInBytes;
  },
  'File must be smaller than {0}MB',
);

// Usage: Max 10MB
dv.validate('#myForm', {
  rules: {
    document: {
      required: true,
      fileSize: 10,
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
