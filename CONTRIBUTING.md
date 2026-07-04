# Contributing to Vexor

Thanks for your interest in contributing! This guide covers everything you need
to get a change from idea to merged PR.

## Development Setup

Prerequisites: **Node.js >= 20** and npm.

```bash
git clone https://github.com/sitharaj88/vexorjs.git
cd vexorjs
npm install

# Build all packages
npm run build

# Run all tests
npm test

# Typecheck + lint
npm run lint
```

The repo is an npm-workspaces monorepo managed with Turborepo:

```
packages/vexor       @vexorjs/core — framework (router, middleware, adapters)
packages/vexor-orm   @vexorjs/orm  — ORM (query builder, drivers, migrations)
packages/vexor-cli   @vexorjs/cli  — CLI (scaffolding, codegen, dev server)
benchmarks/          performance benchmarks vs Fastify/Hono/Express
examples/            runnable example apps
site/                documentation site
```

To work on a single package:

```bash
cd packages/vexor
npx vitest          # watch mode
npx vitest run      # single run
npx tsc --noEmit    # typecheck
```

## Making Changes

1. **Fork and branch** from `main`.
2. **Write tests.** Every behavior change needs test coverage; bug fixes need a
   regression test that fails without the fix.
3. **Keep claims honest.** Doc comments and README must describe what the code
   actually does today — aspirational features belong in issues, not comments.
4. **Match the local style.** Run the linter before pushing.
5. **Add a changeset** for anything user-facing:

   ```bash
   npx changeset
   ```

   Pick the affected packages and a semver bump (patch for fixes, minor for
   features). Internal-only changes (CI, docs site) don't need one.

## Pull Requests

- Keep PRs focused — one logical change per PR.
- Describe **what** changed and **why**; link related issues.
- CI must pass (build, typecheck, lint, tests on Node 20/22, Linux + Windows).

## Reporting Bugs / Requesting Features

Use the issue templates. For bugs, a minimal reproduction (a few lines of code
or a repo link) makes fixes dramatically faster.

## Security Issues

Never open a public issue for a vulnerability — see [SECURITY.md](SECURITY.md).

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Be kind.
