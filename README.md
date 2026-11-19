# XRPLTODAY

Real-time worldwide news terminal for **XRP, the XRP Ledger (XRPL) and RLUSD**, with an AI-written
brief **every hour** and a **BONSAI × LUMA feature every 24 hours**. Runs entirely on Cloudflare
(one Worker + one KV namespace + Workers AI + a 5-minute cron).

Live: https://xrpldaily.aixalpha.workers.dev

## What it does

| Feature | How |
|---|---|
| News terminal | Every 5 min the cron pulls Bing News RSS in 21 regional markets/languages plus 15 crypto outlets, filters for XRP/XRPL/RLUSD, de-duplicates near-identical headlines across outlets, tags them and scores importance (0–99). |
| Importance slider, tabs, search | Client-side over the cached feed (XRP · XRPL · RLUSD · Ripple · Regulation · ETF · Markets · Global). |
| Market panel | XRP / BTC / RLUSD price, 24h and 7d change, 7-day sparkline (Kraken). |
| XRPL panel | Validated ledger, base fee and reserve straight from a public rippled server. |
| Hourly brief | `hourly()` writes a 450–600 word brief from the top headlines of the last hours. Every source is linked. |
| BONSAI × LUMA daily | `daily()` publishes once per day at **16:00 UTC** (`DAILY_HOUR`). Length (1–3 pages), angle, tone and focus (BONSAI / LUMA / both) are randomised and the facts used rotate (least-used first, newest first). The UI shows a live 24-hour countdown. |
| Archive | Posts are stored permanently (daily) or 60 days (hourly) in KV; `scripts/archive.mjs` copies everything into `data/`. |
| Feeds | `/rss.xml` (all posts). |

## Layout

```
src/worker.js          Worker (API, cron, AI writer). Contains the placeholder __HTML__.
public/index.html      The whole front end (no build step, no framework).
scripts/build.mjs      Inlines public/index.html into dist/worker.js.
scripts/archive.mjs    Exports every post + the facts bank into data/.
data/                  facts.json, index.json, posts/*.json (written by the archive workflow).
.github/workflows/     deploy.yml (wrangler deploy on push) and archive.yml (daily data sync).
wrangler.jsonc         Bindings: KV, AI, cron.
```

## Deploy

```bash
npm install
npx wrangler secret put ADMIN_KEY      # protects /api/admin
npm run deploy                         # builds dist/worker.js and publishes
```

GitHub Actions needs the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and the
repository variable `SITE_URL` (for the archive job).

## Feeding the daily post (new features each day)

The daily writer may only use facts from its **facts bank** (seeded in `src/worker.js` → `SEED`,
live copy in KV key `facts`, mirrored to `data/facts.json`). It never invents features. To make
tomorrow's post cover something new, add a fact:

```bash
curl -X POST https://xrpldaily.aixalpha.workers.dev/api/admin \
  -H "x-admin-key: $ADMIN_KEY" -H "content-type: application/json" \
  -d '{"action":"add","product":"LUMA","text":"Starsky now supports …"}'
```

Other admin actions: `{"action":"remove","id":"f3"}`, `{"action":"daily"}` (force a post now),
`{"action":"delete-post","slug":"…"}`. `product` is `BONSAI`, `LUMA` or `BOTH`. Newer, less-used
facts are picked first.

## API

`GET /api/news` · `/api/blogs` · `/api/blog/:slug` · `/api/export?offset=0` · `/rss.xml` · `POST /api/admin`

## Notes

* Google News blocks Cloudflare IPs, so Bing News RSS is used for the regional feeds.
* All content is informational and automatically generated; it is not investment advice.
* XRPLTODAY is independent and not affiliated with Ripple.

## v3 additions
- **XRPLTODAY** rebrand (worker/URL name unchanged).
- **XRPL Squares** (`/squares`): up to 50 live token charts (8–50 selectable, 5 rows), token search by name/issuer, screener, presets, layouts, share links. Data by xrpl.to (called from the browser; `/api/sq/*` is a fallback proxy).
- **Cover images** on news posts (RSS image, else article `og:image` via `/api/cover`, cached in KV).
- Ledger Analytics, stat strip and sidebar visual upgrades; importance slider removed (all stories shown).
- KV assets: `x2js x2css statsjs adsjs sqjs`.

## v4 additions

| Feature | Notes |
|---|---|
| XRPL Squares (`/squares`) | 5-row multi-token chart screener, 8–50 tiles, xrpl.to data. Click a tile to open its token page. |
| Token pages (`/token/:slug`) | Candle/line/area chart, SMA, volume, RSI, drawdown, market data, X/Telegram share. |
| Token News (`/tokens`) | Paid (50 XRP) sponsored posts. Payment is checked on-ledger, admin approves, approved posts also appear in the main feed under the **Tokens** tab. |
| Admin console (`/admin`) | Sign in with `ADMIN_KEY`. Sponsors, Token News approvals + payment address, blog facts, tools. |
| Share links | X posts use `Headline / link / View at XRPTODAY.com #XRPL #XRP #XRPTODAY`. |

Set the Token News receiving address in `/admin` → Token News. Secrets: `ADMIN_KEY` (and optionally `X_BEARER`) via `wrangler secret put`.
