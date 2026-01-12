# 🦖 dino-validation: configuration

Here are listed all configuration options available for `dv.validate()`.

> [!NOTE]
> Further reference: [types.ts](/src/types.ts) and [defaults.ts](/src/defaults.ts)

## css/styling options

### errorClass

**Type:** `string`
**Default:** `'error'`

CSS class(es) applied to form elements when validation fails. Can contain multiple space-separated classes.

**Example:**

```javascript
dv.validate('#myForm', {
  errorClass: 'is-invalid',
});
```

Multiple classes:

```javascript
dv.validate('#myForm', {
  errorClass: 'error border-red',
});
```

### validClass

**Type:** `string`
**Default:** `'valid'`

CSS class(es) applied to form elements when validation passes. Removed when element becomes invalid.

**Example:**

```javascript
dv.validate('#myForm', {
  validClass: 'is-valid',
});
```

### errorElement

**Type:** `string`
**Default:** `'label'`

HTML tag name used to create error message elements.

**Example:**

```javascript
dv.validate('#myForm', {
  errorElement: 'span',
});
```

### wrapper

**Type:** `string | null`
**Default:** `null`

CSS selector for an element to wrap error containers. When set, the wrapper element will be shown/hidden along with errors.

**Example:**

```javascript
dv.validate('#myForm', {
  wrapper: 'div',
  errorElement: 'span',
});
```

## container options

### errorLabelContainer

**Type:** `string | null`
**Default:** `null`

CSS selector for a container element where all error labels should be placed. Overrides default error placement.

**Example:**

```javascript
dv.validate('#myForm', {
  errorLabelContainer: '#errorSummary',
});
```

**Note:** Lower priority than `data-error-placement` attribute on form fields.

### errorContainer

**Type:** `string | null`
**Default:** `null`

CSS selector for a container element that should be shown when errors exist and hidden when the form is valid.

**Example:**

```javascript
dv.validate('#myForm', {
  errorContainer: '#errorAlert',
});
```

## display/behavior options

### errorPlacement

**Type:** `((error: HTMLElement, element: FormControlElement) => void) | null`
**Default:** `null`

Custom function to control where error elements are inserted in the DOM. When `null`, uses default placement logic.

**Example:**

```javascript
dv.validate('#myForm', {
  errorPlacement: (error, element) => {
    // Place error after the field's label
    const label = document.querySelector(`label[for="${element.id}"]`);
    label.parentNode.insertBefore(error, label.nextSibling);
  },
});
```

**Note:** Lower priority than `data-error-placement` attribute on form fields.

### highlight

**Type:** `false | ((element: FormControlElement, errorClasses: string[], validClasses: string[]) => void)`
**Default:** Function that adds `errorClass` and removes `validClass`

Called when an element fails validation. Set to `false` to disable highlighting.

**Example:**

Disable highlighting:

```javascript
dv.validate('#myForm', {
  highlight: false,
});
```

Custom highlighting:

```javascript
dv.validate('#myForm', {
  highlight: (element, errorClasses, validClasses) => {
    element.classList.add(...errorClasses);
    element.classList.remove(...validClasses);
    element.style.borderColor = 'red';
  },
});
```

### unhighlight

**Type:** `false | ((element: FormControlElement, errorClasses: string[], validClasses: string[]) => void)`
**Default:** Function that removes `errorClass` and adds `validClass`

Called when an element passes validation. Set to `false` to disable unhighlighting.

**Example:**

```javascript
dv.validate('#myForm', {
  unhighlight: (element, errorClasses, validClasses) => {
    element.classList.remove(...errorClasses);
    element.classList.add(...validClasses);
    element.style.borderColor = 'green';
  },
});
```

### showErrors

**Type:** `((this: Validator, errorMap: Record<string, string>, errorList: ValidationError[]) => void) | null`
**Default:** `null`

Custom function to control how all errors are displayed. When `null`, uses default error display logic.

**Example:**

```javascript
dv.validate('#myForm', {
  showErrors: function (errorMap, errorList) {
    // Display errors in a custom error summary
    const summary = document.getElementById('errorSummary');
    summary.innerHTML = errorList.map((e) => `<li>${e.message}</li>`).join('');

    // Still call default error display
    this.defaultShowErrors();
  },
});
```

### success

**Type:** `null | string | ((labels: HTMLElement[], element: FormControlElement) => void)`
**Default:** `null`

Handles valid elements. Can be a CSS class name to add to success labels, or a callback function.

**Example:**

Add CSS class:

```javascript
dv.validate('#myForm', {
  success: 'valid-feedback',
});
```

Custom callback:

```javascript
dv.validate('#myForm', {
  success: (labels, element) => {
    labels.forEach((label) => {
      label.textContent = '✓ Valid';
      label.classList.add('success');
    });
  },
});
```

### focusCleanup

**Type:** `boolean`
**Default:** `false`

When `true`, removes error highlighting and messages when an element receives focus.

**Example:**

```javascript
dv.validate('#myForm', {
  focusCleanup: true,
});
```

**Note:** Uses the `unhighlight` function when cleaning up on focus.

### escapeHtml

**Type:** `boolean`
**Default:** `false`

When `true`, uses `innerText` instead of `innerHTML` for error messages to prevent XSS attacks.

**Example:**

```javascript
dv.validate('#myForm', {
  escapeHtml: true,
  messages: {
    username: 'User-provided message: <script>alert("XSS")</script>',
  },
});
```

### ignoreTitle

**Type:** `boolean`
**Default:** `false`

When `false`, uses the element's `title` attribute as a fallback error message. When `true`, ignores the `title` attribute.

**Example:**

```javascript
dv.validate('#myForm', {
  ignoreTitle: true,
});
```

## event handler options

### onfocusin

**Type:** `false | ((element: FormControlElement, event: Event) => void)`
**Default:** Function that handles focus cleanup

Called when an element receives focus. Set to `false` to disable.

**Example:**

```javascript
dv.validate('#myForm', {
  onfocusin: (element, event) => {
    console.log('Focused:', element.name);
  },
});
```

**Note:** Default implementation handles `focusCleanup` behavior.

### onfocusout

**Type:** `false | ((element: FormControlElement, event: Event) => void)`
**Default:** Function that validates on blur

Called when an element loses focus. Set to `false` to disable blur validation.

**Example:**

```javascript
dv.validate('#myForm', {
  onfocusout: false, // Disable validation on blur
});
```

### onkeyup

**Type:** `false | ((element: FormControlElement, event: Event) => void)`
**Default:** Function that validates on keyup for submitted/invalid fields

Called on keyup events. Set to `false` for blur-only validation.

**Example:**

```javascript
dv.validate('#myForm', {
  onkeyup: false, // Only validate on blur, not while typing
});
```

**Note:** Default implementation filters out modifier keys and only validates fields that have been submitted or are already invalid.

### onclick

**Type:** `false | ((element: FormControlElement, event: Event) => void)`
**Default:** Function that validates checkable elements on click

Called on click events. Set to `false` to disable click validation.

**Example:**

```javascript
dv.validate('#myForm', {
  onclick: (element, event) => {
    // Custom click handling for checkboxes/radios
    console.log('Clicked:', element.name);
  },
});
```

### onsubmit

**Type:** `boolean`
**Default:** `true`

Enables or disables automatic form submit validation. When `false`, the validator doesn't attach a submit event listener.

**Example:**

```javascript
dv.validate('#myForm', {
  onsubmit: false, // Manual validation only
});
```

## validation configuration

### rules

**Type:** `Record<string, ValidationRuleset | string>`
**Default:** `{}`

Defines validation rules for form fields by field name. Can use shorthand string or object with parameters.

**Example:**

Shorthand:

```javascript
dv.validate('#myForm', {
  rules: {
    username: 'required',
    email: 'required email',
  },
});
```

Object form with parameters:

```javascript
dv.validate('#myForm', {
  rules: {
    username: {
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    password: {
      required: true,
      minlength: 8,
    },
  },
});
```

### messages

**Type:** `Record<string, string | Record<string, string>>`
**Default:** `{}`

Custom error messages for validation rules. Can be a simple string (applies to all rules for that field) or an object mapping rule names to messages.

**Example:**

Simple string:

```javascript
dv.validate('#myForm', {
  messages: {
    username: 'Please provide a valid username',
  },
});
```

Rule-specific messages:

```javascript
dv.validate('#myForm', {
  messages: {
    username: {
      required: 'Username is required',
      minlength: 'Username must be at least 3 characters',
      maxlength: 'Username cannot exceed 20 characters',
    },
  },
});
```

### ignore

**Type:** `string`
**Default:** `':hidden'`

CSS selector for form elements to skip during validation. The value `':hidden'` is handled specially to ignore non-visible elements.

**Example:**

Ignore fields with specific class:

```javascript
dv.validate('#myForm', {
  ignore: '.skip-validation',
});
```

Validate all fields (including hidden):

```javascript
dv.validate('#myForm', {
  ignore: '',
});
```

**Note:** The default `':hidden'` value uses special logic to check element visibility. For other selectors, standard CSS selector matching is used.

## form submission

### submitHandler

**Type:** `null | ((form: HTMLFormElement, event: SubmitEvent) => boolean | undefined)`
**Default:** `null`

Custom handler called when form passes validation and is submitted. Return value controls whether the form actually submits.

**Example:**

Prevent default submission and handle with AJAX:

```javascript
dv.validate('#myForm', {
  submitHandler: (form, event) => {
    event.preventDefault();
    // Handle with AJAX
    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
    });
    return false; // Prevent default form submission
  },
});
```

Allow normal submission:

```javascript
dv.validate('#myForm', {
  submitHandler: (form, event) => {
    console.log('Form is valid, submitting...');
    return true; // Allow default form submission
  },
});
```

**Note:** Only called when `onsubmit` is `true` and `debug` is `false`.

### invalidHandler

**Type:** `null | ((event: CustomEvent<ValidationError[]>) => void)`
**Default:** `null`

Custom handler called when form validation fails. Receives a CustomEvent with error details in the `detail` property.

**Example:**

```javascript
dv.validate('#myForm', {
  invalidHandler: (event) => {
    const errors = event.detail;
    console.log(`Form has ${errors.length} validation errors`);

    // Show error summary
    const summary = errors.map((e) => e.message).join(', ');
    alert(`Please fix: ${summary}`);
  },
});
```

### debug

**Type:** `boolean`
**Default:** `false`

When `true`, prevents form submission and `submitHandler` execution. Useful for testing validation without actually submitting.

**Example:**

```javascript
dv.validate('#myForm', {
  debug: true, // Form will validate but not submit
  submitHandler: (form) => {
    // This won't be called when debug is true
    form.submit();
  },
});
```
