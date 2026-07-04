# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

Please **do not** report security vulnerabilities through public GitHub issues.

Instead, report them privately via one of:

- **GitHub Security Advisories** (preferred): use the
  ["Report a vulnerability"](https://github.com/sitharaj88/vexorjs/security/advisories/new)
  button on the repository's Security tab.
- **Email**: sitharaj.info@gmail.com with the subject line `[SECURITY] vexorjs`.

Include as much of the following as you can:

- The affected package (`@vexorjs/core`, `@vexorjs/orm`, `@vexorjs/cli`) and version
- A description of the vulnerability and its impact
- Steps to reproduce or a proof-of-concept
- Any suggested remediation

## What to Expect

- An acknowledgement within **72 hours**.
- A status update within **7 days** with an initial assessment.
- Coordinated disclosure: we ask that you give us a reasonable window to ship a
  fix before publishing details. We will credit you in the release notes unless
  you prefer to stay anonymous.

## Scope

The following are in scope:

- Request smuggling, path traversal, or header injection through `@vexorjs/core`
- SQL injection through `@vexorjs/orm` query building or drivers
- Arbitrary code execution through `@vexorjs/cli` scaffolding or config loading

Vulnerabilities in example apps and documentation sites are appreciated but
treated at lower severity.
