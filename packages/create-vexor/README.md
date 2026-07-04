# create-vexor

Scaffold a new [Vexor](https://github.com/sitharaj88/vexorjs) app in seconds:

```bash
npm create vexor@latest my-app
# or
pnpm create vexor my-app
bun create vexor my-app
```

Run without arguments for the interactive wizard, or pass options straight
through to the underlying `vexor new` command:

```bash
npm create vexor@latest my-app -- --template minimal --package-manager pnpm --yes
```

Templates: `api` (default), `minimal`, `microservice`, `websocket`.

This package is a thin wrapper around [`@vexorjs/cli`](https://www.npmjs.com/package/@vexorjs/cli) —
the templates and generator live there.
