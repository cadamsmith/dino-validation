# 🦖 dino-validation

[![CI](https://github.com/cadamsmith/dino-validation/actions/workflows/ci.yml/badge.svg)](https://github.com/cadamsmith/dino-validation/actions/workflows/ci.yml)

A vanilla JavaScript form validation library - no jQuery required.

> ⚠️ **Work in Progress** - This library is currently under active development and not yet ready for production use.

This library is a vanilla JavaScript port of these 2 libraries:

- [jQuery Validation Plugin](https://github.com/jquery-validation/jquery-validation) by Jörn Zaefferer
- [jQuery Unobtrusive Validation](https://github.com/aspnet/jquery-validation-unobtrusive) by .NET Foundation

## Builds

**`dv.umd.js`** - Core library with programmatic API (like jQuery Validation)

```javascript
dv.validate('#myForm', { rules: { email: { required: true } } });
```

**`dv-auto.umd.js`** - Auto-parsing build with declarative HTML attributes (like jQuery Validation + Unobtrusive)

```html
<input name="email" data-val="true" data-val-required="Email is required" />
<!-- Automatically validates on page load -->
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

### Local Setup

```bash
npm install          # Install dependencies
npm run build        # Build dist files with rollup
npm test             # Run Playwright test suite
npm run format       # Format code with Prettier
```

### License

MIT License - See [LICENSE](LICENSE) file for details.
