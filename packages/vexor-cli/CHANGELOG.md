# @vexorjs/cli

## Unreleased

### Minor Changes

- **`vexor test`** — auto-detects the project test runner (vitest, jest, mocha, or `node --test`) from `package.json` and runs it. Supports `--watch`, `--coverage`, `--ui`, and a positional pattern.
- **`vexor env:check`** — validates `.env` against `env.schema.json` (string / integer / number / boolean / url / email / enum types, with `required`, `default`, `min` / `max`, `minLength` / `maxLength`, `pattern`).
- **Pluggable `vexor add` integrations** — extend the integration registry programmatically with `registerIntegration()` or by dropping JSON definitions in `.vexor/integrations/`. Built-in → runtime → project-local precedence.
- **`graphql` integration preset** — `vexor add graphql` scaffolds a working GraphQL endpoint with GraphiQL playground.

### Patch Changes

- CLI version now reads from `package.json` at runtime instead of being hardcoded.

## 1.0.1

### Patch Changes

- Patch release: fix publish configuration and version bump
