# 🦖 dino-validation: security policy

## supported versions

We release patches for security vulnerabilities only in the latest stable version:

| Version                    | Supported          |
| -------------------------- | ------------------ |
| ^1.0.0 (latest 1.x.x)      | :white_check_mark: |
| (all other 1.x.x versions) | :x:                |
| 0.x.x                      | :x:                |

## reporting a vulnerability

We take security vulnerabilities seriously. If you discover a security issue in dino-validation, please report it responsibly.

### how to report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by:

1. **GitHub Security Advisories** (Preferred)
   - Go to the [Security tab](https://github.com/cadamsmith/dino-validation/security/advisories)
   - Click "Report a vulnerability"
   - Provide details about the vulnerability

2. **Email** (Alternative)
   - Send an email to: cadamsmith.dev@gmail.com
   - Include "SECURITY" in the subject line
   - Provide a detailed description of the vulnerability

## additional security measures

This project uses:

- **CodeQL Analysis:** Automated security scanning on every push
- **Dependabot:** Automated dependency updates
- **Dependency Review:** Blocks PRs with vulnerable dependencies
- **npm Audit:** Runs in CI to catch vulnerabilities
- **npm Provenance:** Build attestations for published packages

Thank you for helping keep dino-validation and its users safe!
