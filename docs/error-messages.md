# 🦖 dino-validation: error messages

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
