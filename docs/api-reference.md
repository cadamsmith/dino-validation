# 🦖 dino-validation: api reference

## dv.validate(selector, options)

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

## dv.valid(selector)

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

## dv.rules(selector)

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

## dv.addMethod(name, method, message, addAsClassRule)

Adds a custom validation method that can be used in validation rules.

**Parameters:**

- `name` (string): Name of the validation method
- `method` (function): Validation function that returns `true` if valid
- `message` (string): Default error message
- `addAsClassRule` (boolean, optional): Whether to allow using this method as a CSS class. Defaults to `false`. Set to `true` for methods that do not require a parameter.

See [Custom Validation Methods](custom-methods.md) for detailed function signature, parameters, and examples.

## dv.localize(data)

Replaces default error messages or validation methods with localized versions. Use this for multi-language support.

**Parameters:**

- `data` (object): Object containing either localized error messages (string values) or validation methods (function values)
  - If values are strings, replaces error messages
  - If values are functions, replaces validation methods

**Returns:** None

See [Localization](localization.md) for more information.
