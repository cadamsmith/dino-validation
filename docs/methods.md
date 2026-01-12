# 🦖 dino-validation: methods

dino-validation includes 16 built-in validation methods covering common validation scenarios.

## `required`

Validates that the field has a value (is not empty).

**Parameters:** None

**Example:**

```html
<!-- Required attribute -->
<input type="text" name="username" required />
```

```javascript
dv.validate('#myForm', {
  rules: {
    username: { required: true },
  },
});
```

---

## `email`

Validates email address format using RFC-compliant regex.

**Parameters:** None

**Example:**

```html
<!-- Type attribute -->
<input type="email" name="email" />
```

```javascript
dv.validate('#myForm', {
  rules: {
    email: { email: true },
  },
});
```

**Accepts:** `user@example.com`, `first.last@domain.co.uk`, `user+tag@example.com`

---

## `url`

Validates URL format (HTTP/HTTPS/FTP).

**Parameters:** None

**Example:**

```html
<!-- Type attribute -->
<input type="url" name="website" />
```

```javascript
dv.validate('#myForm', {
  rules: {
    website: { url: true },
  },
});
```

**Accepts:** `http://example.com`, `https://example.com/path?query=value`, `ftp://files.example.com`

---

## `date`

Validates ISO 8601 date format (YYYY-MM-DD or YYYY/MM/DD).

**Parameters:** None

**Example:**

```html
<!-- Type attribute -->
<input type="date" name="startDate" />
```

```javascript
dv.validate('#myForm', {
  rules: {
    startDate: { date: true },
  },
});
```

**Accepts:** `2024-12-31`, `2024/12/31`
**Rejects:** `12/31/2024`

---

## `creditcard`

Validates credit card number using the Luhn algorithm.

**Parameters:** None

**Example:**

```html
<!-- CSS class -->
<input type="text" name="cardNumber" class="creditcard" />
<!-- Data attribute -->
<input type="text" name="cardNumber" data-rule-creditcard="true" />
```

```javascript
dv.validate('#myForm', {
  rules: {
    cardNumber: { creditcard: true },
  },
});
```

**Accepts:** 13-19 digit numbers, spaces and dashes are stripped automatically

---

## `digits`

Validates that the field contains only numeric digits (0-9).

**Parameters:** None

**Example:**

```html
<!-- CSS class -->
<input type="number" name="zipCode" class="digits" />
<!-- Data attribute -->
<input type="number" name="zipCode" data-rule-digits="true" />
```

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

## `number`

Validates numeric values including decimals and comma-separated thousands.

**Parameters:** None

**Example:**

```html
<!-- Type attribute -->
<input type="number" name="amount" />
```

```javascript
dv.validate('#myForm', {
  rules: {
    amount: { number: true },
  },
});
```

**Accepts:** `100`, `100.50`, `1,000.00`, `-50.5`

---

## `minlength`

Validates minimum length.

**Parameters:** `integer` - minimum length

**Example:**

```html
<!-- Minlength attribute -->
<input type="text" name="username" minlength="3" />
```

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

## `maxlength`

Validates maximum length.

**Parameters:** `integer` - maximum length

**Example:**

```html
<!-- Maxlength attribute -->
<input type="text" name="username" maxlength="20" />
```

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

## `rangelength`

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

---

## `min`

Validates that numeric value is greater than or equal to minimum.

**Parameters:** `number` - minimum value

**Examples:**

```html
<!-- Min attribute -->
<input type="number" name="age" min="18" />
```

```javascript
dv.validate('#myForm', {
  rules: {
    age: {
      number: true,
      min: 18,
    },
  },
});
```

---

## `max`

Validates that numeric value is less than or equal to maximum.

**Parameters:** `number` - maximum value

**Example:**

```html
<!-- Max attribute -->
<input type="number" name="percentage" max="100" />
```

```javascript
dv.validate('#myForm', {
  rules: {
    percentage: {
      number: true,
      max: 100,
    },
  },
});
```

---

## `range`

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

---

## `equalto`

Validates that field value matches another field's value (e.g., password confirmation).

**Parameters:** `string` - CSS selector of target field

**Examples:**

```html
<!-- Data attribute -->
<input type="text" name="confirmPassword" data-rule-equalto="#password" />
```

```javascript
dv.validate('#myForm', {
  rules: {
    confirmPassword: { equalto: '#password' },
  },
});
```

---

## `regex`

Validates that value matches a regular expression pattern.

**Parameters:** `string` - regex pattern (must match entire string)

**Example:**

```html
<!-- Data attribute -->
<input type="text" name="username" data-rule-regex="^[a-zA-Z0-9_-]+$" />
```

```javascript
dv.validate('#myForm', {
  rules: {
    username: { regex: '^[a-zA-Z0-9_-]+$' },
  },
});
```

---

## `nonalphamin`

Validates minimum count of non-alphanumeric characters (example: password strength).

**Parameters:** `integer` - minimum number of special characters required

**Example:**

```html
<!-- Data attribute -->
<input type="text" name="password" data-rule-nonalphamin="1" />
```

```javascript
dv.validate('#myForm', {
  rules: {
    password: { nonalphamin: 1 },
  },
});
```
