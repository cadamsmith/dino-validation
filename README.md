# 🦖 dino-validation

A vanilla JavaScript form validation library - no jQuery required.

> ⚠️ **Work in Progress** - This library is currently under active development and not yet ready for production use.

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

### Local Setup

```bash
npm install          # Install dependencies
npm run build        # Build dist files with rollup
npm test             # Run Playwright test suite
npm run format       # Format code with Prettier
```

### Credits

This library is a vanilla JavaScript port of these 2 libraries:
- [jQuery Validation Plugin](https://github.com/jquery-validation/jquery-validation) by Jörn Zaefferer
- [jQuery Unobtrusive Validation](https://github.com/aspnet/jquery-validation-unobtrusive) by .NET Foundation

### License

MIT License - See [LICENSE](LICENSE) file for details.
