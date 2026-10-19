# Vim Connect Demo App 2

[![npm version](https://img.shields.io/npm/v/@vimconnect/app-sdk.svg)](https://www.npmjs.com/package/@vimconnect/app-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A second reference implementation for the [Vim Connect App SDK](https://developer-docs.getvim.ai/docs), built as a React + Vite single-page app with [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/) for the OAuth endpoints. It walks through the EHR one entity at a time — user, patient, encounter, referral, and orders — and shows how to read each one and write encounter and referral changes back to the EHR.

Use [vim-demo-app](https://github.com/vimconnect/vim-demo-app) when you want the Next.js template with the SDK Explorer. Use this one when you want a Vite/React SPA with serverless auth, or a worked example of form-based writeback.

## Quick Start

```bash
# 1. Clone
git clone https://github.com/vimconnect/vim-demo-app-2.git
cd vim-demo-app-2/vim-demo-app-react

# 2. Install
npm install

# 3. Configure
cat > .dev.vars <<'EOF'
CLIENT_ID=<your client ID>
CLIENT_SECRET=<your client secret>
REDIRECT_URL=http://localhost:8788
EOF

# 4. Run
npm run dev
```

App runs at [http://localhost:8788](http://localhost:8788). `npm run dev` starts Vite on port 5173 and Wrangler on port 8788; Wrangler serves the `/api/*` functions and proxies everything else to Vite, so use port 8788 everywhere.

You don't need a Cloudflare account to run the app locally.

## Prerequisites

- **Node.js** 20 (see [`.nvmrc`](.nvmrc))
- **Vim Connect Chrome extension** installed ([setup guide](https://developer-docs.getvim.ai/docs/getting-started#prerequisites))
- **Vim Connect account** with an app created in the Vim Console
- **OAuth credentials** (client ID + client secret) from the [Vim Console](https://developer-docs.getvim.ai/docs/developer-account#getting-your-client-id-and-secret)

## Environment Variables

Set these in `vim-demo-app-react/.dev.vars` (git-ignored). Wrangler loads them into the functions.

| Variable | Required | Description |
|----------|----------|-------------|
| `CLIENT_ID` | Yes | Your OAuth client ID |
| `CLIENT_SECRET` | Yes | Your OAuth client secret (server-side only) |
| `REDIRECT_URL` | No | Where Vim returns the provider after authorization. Defaults to `http://localhost:8788`; must be listed in the manifest's **Allowed iframe URLs** |
| `VIM_AUTHORIZE_ENDPOINT` | No | Overrides the authorize URL (default `https://api.getvim.ai/app-auth/authorize`) |
| `VIM_TOKEN_ENDPOINT` | No | Overrides the token URL (default `https://api.getvim.ai/app-auth/token`) |
| `VIM_ISSUER` | No | Expected `iss` of the ID token (default `https://connect.getvim.ai`) |
| `VIM_JWKS_URL` | No | Where the ID token's signing keys are fetched (default `https://api.getvim.ai/app-auth/.well-known/jwks.json`) |
| `CLIENT_SECRET_FALLBACK` | No | A second secret tried when the first is rejected, for rotating secrets without downtime |

## Vim Console Setup

In your app's manifest (or a local environment override):

| Field | Value for local development |
|-------|-----------------------------|
| **Launch Endpoint** | `http://localhost:8788/api/launch` |
| **Token Endpoint** | `http://localhost:8788/api/token` |
| **Allowed iframe URLs** | `http://localhost:8788` |

On the **App UX** tab, enable **Badge Notification Label** and **Push Notification**. On the **EHR** tab, declare the patient, encounter, referral, and order fields you want to see, the patient API operations (problems, medications, allergies, insurances, lab results, vitals), and update access to encounters and referrals if you want to try writeback. See [Filling in the manifest](https://developer-docs.getvim.ai/docs/developer-account#filling-in-the-manifest).

## What This Demo Shows

- **OAuth 2.0 flow** — `/api/launch` redirects to Vim's authorize endpoint; `/api/token` exchanges the code server-side and verifies the ID token against Vim's JWKS
- **SDK initialization** — `initVimSDK()` with a configured token endpoint, so the SDK fetches its own access token
- **EHR context** — Patient, encounter, and referral from `ehr.context.onChange`, with the patient held across the chart-to-encounter transition
- **Workflow events** — Orders collected from `order_select` and `order_sign`
- **Entity API** — Problems, medications, allergies, insurances, lab results (with date-range paging), and vitals for the patient in context
- **Writeback** — Edit SOAP notes, diagnoses, procedure codes, and referral details, then write them to the EHR through the capability and permission checks
- **Hub controls** — Activation status, push notification, notification badge, and `closeApp()`
- **Session context** — The Vim user, account, and EHR type, plus the ID token
- **Organization settings** — An optional `/settings` page that stores a theme color per organization in a Cloudflare D1 table

## Project Structure

```
vim-demo-app-react/
├── functions/api/
│   ├── launch.ts               # Launch endpoint (redirects to Vim authorize)
│   ├── token.ts                # Token endpoint (code exchange + ID token check)
│   └── settings.ts             # Per-organization settings (D1)
├── sql/settings.sql            # Settings table schema
└── src/
    ├── AppWrapper.tsx          # SDK initialization and context providers
    ├── App.tsx                 # Main app: one card per EHR entity
    ├── hooks/                  # SDK hooks (context, writeback, ID token)
    ├── hooks/providers/        # Patient, encounter, referral, orders state
    └── components/             # Entity views, update forms, and shadcn/ui components
```

To keep the theme color between local runs, create the settings table once:

```bash
npx wrangler d1 execute DB --local --file=sql/settings.sql
```

## Documentation

- [Vim Connect App SDK Documentation](https://developer-docs.getvim.ai/docs)
- [`@vimconnect/app-sdk` on npm](https://www.npmjs.com/package/@vimconnect/app-sdk)
- [OAuth Integration Guide](https://developer-docs.getvim.ai/docs/authentication)
- [EHR Support Matrix](https://developer-docs.getvim.ai/docs/ehr-support)

## Scripts

Run from `vim-demo-app-react/`.

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite (port 5173) and the Wrangler functions proxy (port 8788) |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |

## License

[MIT](LICENSE)
