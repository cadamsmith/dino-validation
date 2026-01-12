# 🦖 dino-validation

[![npm version](https://img.shields.io/npm/v/dino-validation.svg)](https://www.npmjs.com/package/dino-validation)
[![bundle size](https://img.shields.io/bundlephobia/minzip/dino-validation)](https://bundlephobia.com/package/dino-validation)

[![CI](https://github.com/cadamsmith/dino-validation/actions/workflows/ci.yml/badge.svg)](https://github.com/cadamsmith/dino-validation/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub issues](https://img.shields.io/github/issues/cadamsmith/dino-validation)](https://github.com/cadamsmith/dino-validation/issues)

A vanilla JavaScript form validation library - no jQuery required.

This library is a partial port of the [jQuery Validation Plugin](https://github.com/jquery-validation/jquery-validation) by Jörn Zaefferer.

## features

- **16 built-in validation methods** - required, email, URL, number, date, minlength, and more
- **Significantly smaller than jQuery Validation** - Pure vanilla JavaScript with zero dependencies
- **Declarative or programmatic API** - Define rules in HTML attributes or JavaScript
- **Zero dependencies** - No jQuery required, works everywhere
- **Modern ES6+** - ESM and UMD builds for all environments
- **Localization support** - Customize error messages/methods for any locale

## examples

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

## installation

### umd (cdn)

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

### esm (npm)

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

## size comparison

dino-validation is **significantly smaller** than the jQuery-based alternative:

| Library                              | Bundle Size (minified + gzipped)                                                                                            | Dependencies    |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **dino-validation**                  | ![](https://img.shields.io/bundlephobia/minzip/dino-validation)                                                             | None ✓          |
| **jquery-validation**<br/>(+ jquery) | ![](https://img.shields.io/bundlephobia/minzip/jquery-validation)<br>![](https://img.shields.io/bundlephobia/minzip/jquery) | Requires jQuery |

🦖 **Zero dependencies, modern vanilla JavaScript**

_Bundle sizes from [Bundlephobia](https://bundlephobia.com/) (latest published versions)_

## quick start

<details>
<summary><strong>Declarative Validation (HTML Attributes)</strong></summary>

Define validation rules directly in HTML using html attributes:

```html
<form id="contactForm">
  <div>
    <label for="email">Email:</label>
    <!-- rules: email, required -->
    <input
      type="email"
      name="email"
      id="email"
      required="true"
      placeholder="your@email.com"
    />
  </div>

  <div>
    <label for="message">Message:</label>
    <!-- rules: required, minlength -->
    <textarea
      name="message"
      id="message"
      required="true"
      minlength="10"
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

</details>

<details>
<summary><strong>Programmatic Validation (JavaScript)</strong></summary>

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

</details>

<details>
<summary><strong>Checking Validation Status</strong></summary>

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

</details>

## other documentation

- 📚 **[[api reference]](docs/api-reference.md)**
  Core API methods (`dv.validate`, `dv.valid`, `dv.rules`, etc.)

- ✅ **[[built-in validation methods]](docs/methods.md)**
  Complete list of all 16 validation methods

- 🔧 **[[custom validation methods]](docs/custom-methods.md)**
  Creating custom validation methods

- 💬 **[[error messages]](docs/error-messages.md)**
  Customizing validation error messages

- ⚙️ **[[configuration]](docs/configuration.md)**
  Configuration options

- 🌍 **[[localization]](docs/localization.md)**
  Multi-language support

- 🔄 **[[migrating from jquery-validation]](docs/jqv-migration.md)**
  Differences from **jquery-validation** api

## browser support

This library targets modern evergreen browsers with ES6+ support.

The last 2 versions of the following are supported: `[Chrome, Edge, Firefox, Safari, Safari iOS, Chrome Android]`

## coming soon

The following features are planned for future releases:

- **Additional validation methods** - Port community-contributed validation methods from jQuery Validation's `additional-methods.js` dist file
- **Normalizer support** - Ability to transform/normalize field values before validation (e.g., trim whitespace, convert to lowercase)
- **Documentation site** - Dedicated documentation website with interactive examples and improved navigation
- **Unobtrusive validation support** - Support for `data-val-*` attributes to enable seamless integration with server-side frameworks (ASP.NET MVC, etc.) where validation rules defined in server-side model annotations are automatically applied client-side

## contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Setting up your development environment
- Making changes and running tests
- Conventions & Pull request process

## license

MIT License - See [LICENSE](LICENSE) file for details.

This library is based on the [jQuery Validation Plugin](https://github.com/jquery-validation/jquery-validation) by Jörn Zaefferer.
