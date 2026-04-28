# Vexor on Vercel Edge

Deploys a Vexor app to Vercel's Edge Runtime via a single catch-all
edge function.

## Run locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Deploy

```bash
npm run deploy
```

## How it works

`api/[[...route]].ts` is a Vercel catch-all edge function that hands
every request to Vexor's `createVercelEdgeHandler`. The `vercel.json`
rewrite forwards every URL to that function so Vexor's router owns
the entire surface.

## Endpoints

| Route | What it does |
|---|---|
| `GET /` | App identity + timestamp |
| `GET /health` | Liveness check |
| `GET /geo` | Echoes Vercel's geo IP headers |
| `POST /echo` | Echoes the request body back |
