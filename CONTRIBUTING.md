# 🦖 dino-validation: contributing

Thank you for your interest in contributing to dino-validation! This document provides guidelines and instructions for contributing to the project.

## code of conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for more details.

## getting started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/dino-validation.git
   cd dino-validation
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/cadamsmith/dino-validation.git
   ```

## development setup

### prerequisites

- Node.js (version 18 or higher recommended)
- npm (comes with Node.js)

### installation

Install dependencies:

```bash
npm install
```

### available scripts

- `npm run build` - Full build with type checking
- `npm run build:ci` - CI build (core + French localization + test lib)
- `npm run build:full` - Full build (all localizations)
- `npm test` - Run all tests
- `npm run format` - Format code with Prettier
- `npm run check-format` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run ci` - Full CI check (build + format + tests)
- `npm run examples` - Start local server and open examples in browser

## making changes

### before you start

1. **Check existing issues** - See if your bug/feature is already reported
2. **Open an issue** - For significant changes, discuss first in an issue
3. **Create a branch on your fork** - Use a descriptive branch name:
   ```bash
   git checkout -b fix/validation-bug
   git checkout -b feature/new-validator
   git checkout -b docs/update-readme
   ```

### development workflow

1. **Make your changes** in the `src/` directory
2. **Test your changes**:
   ```bash
   npm test
   ```
3. **Check formatting**:
   ```bash
   npm run check-format
   ```
   Or auto-format:
   ```bash
   npm run format
   ```
4. **Type check**:
   ```bash
   npm run type-check
   ```
5. **Build the project**:
   ```bash
   npm run build:ci
   ```

## code style

- **TypeScript** - All source code is written in TypeScript
- **Prettier** - Code formatting is enforced via Prettier
- **No console.log** - Remove debug statements before committing

### formatting

Code is automatically formatted with Prettier. Run `npm run format` before committing, or configure your editor to format on save.

## testing

All changes must include appropriate tests.

### writing tests

- Tests are located in the `tests/` directory
- Tests use Playwright for browser-based validation testing
- Test files use the pattern `*.spec.ts`

### running tests

**Important**: Tests run against the built files in `dist/`, so you must build before testing:

```bash
# Build first (required before running tests)
npm run build:ci

# Then run tests
npm test

# Or use the CI command which does both:
npm run ci
```

You can also run tests for specific browsers:

```bash
npm run test:chrome
npm run test:firefox
npm run test:webkit
```

### test coverage

- Add tests for new features
- Add regression tests for bug fixes
- Update existing tests if behavior changes

## pull request process

1. Fork the repo

2. Open a PR from your fork to the main repository with:
   - Clear, descriptive title
   - Reference to related issues (e.g., "Fixes #123")
   - Description of what changed and why
   - Any breaking changes noted

3. Address review feedback and keep your PR up to date with main.

**PR Checklist**

- [ ] Code follows the project's style guidelines
- [ ] Tests pass (`npm test`)
- [ ] Code is formatted (`npm run check-format`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Full Build succeeds (`npm run build`)
- [ ] Documentation is updated (if needed)
- [ ] PR description clearly describes the changes

## project structure

```
dino-validation/
├── src/
│   ├── index.ts              # Main entry point
│   ├── validator.ts          # Core validator class
│   ├── validatorStore.ts     # Validator instance storage
│   ├── methods.ts            # Built-in Validation methods
│   ├── rules.ts              # Rule definitions
│   ├── messages.ts           # Default error messages, other functions for resolving messages
│   ├── types.ts              # TypeScript type definitions
│   ├── helpers.ts            # Helper utilities
│   ├── eventManager.ts       # Event handling
│   ├── defaults.ts           # Default validator configuration
│   ├── objectStore.ts        # Internal data storage type
│   └── localization/         # Localizations for messages/methods
├── examples/                 # Source code for CodePen examples
├── tests/
│   ├── *.spec.ts             # Test files
│   └── lib/                  # Test utilities
├── dist/                     # Built files (generated)
│   ├── dv.js                 # UMD build
│   ├── dv.min.js             # UMD minified
│   ├── dv.esm.js             # ESM build
│   ├── types/                # TypeScript type definitions
│   └── localization/         # Localization builds
├── .github/
│   └── workflows/            # GitHub Actions
├── playwright.config.ts      # Playwright test configuration
└── rollup.config.ts          # Build configuration
```

## license

By contributing to dino-validation, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🦕
