# Vexor on Cloudflare Workers

Deploys a Vexor app to Cloudflare's edge using `createCloudflareWorker`.

## Run locally

```bash
npm install
npm run dev
# → http://localhost:8787
```

## Deploy

```bash
npm run deploy
```

## Endpoints

| Route | What it does |
|---|---|
| `GET /` | App identity + timestamp |
| `GET /health` | Liveness check |
| `GET /geo` | Echoes Cloudflare's `request.cf` geolocation data |
| `POST /echo` | Echoes the request body back |

## Adding bindings

Edit `wrangler.toml` to declare KV, R2, D1, secrets, etc. Then extend the
`Env` interface in `src/index.ts` so they're typed in route handlers:

```ts
interface Env extends CloudflareEnv {
  KV_NAMESPACE: KVNamespace;
  API_TOKEN: string;
}
```
