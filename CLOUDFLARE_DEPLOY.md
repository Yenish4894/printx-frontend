# Deploying Bhagini Graphics to Cloudflare (Free Plan)

This app is a unified Next.js server app that runs on **Cloudflare Workers** via
the OpenNext adapter. Everything below stays on **free tiers**: Workers (free),
Neon Postgres (free), R2 storage (free, only when you enable uploads).

Do the steps **in order**. You only do steps 1–2 once; after that, deploying is
just `npm run deploy`.

---

## Before you start
You already have: a Cloudflare account, a domain in Cloudflare, and a Neon
database (its connection string is in your local `frontend/.env` as
`DATABASE_URL`, plus a `JWT_SECRET`). Keep that file handy — you'll copy those
two values into Cloudflare in step 2.

Run every command from the `frontend/` folder.

---

## Step 1 — Log in to Cloudflare from your machine
```bash
npx wrangler login
```
A browser opens → click **Allow**. Done once per machine.

---

## Step 2 — Give the Worker its secrets
The Worker needs your database URL and JWT secret. These are stored securely in
Cloudflare (never in the code). Run each command; it will prompt you to paste the
value:
```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put JWT_SECRET
```
- `DATABASE_URL` → paste the same Neon string from your `.env`
- `JWT_SECRET` → paste the same secret from your `.env`

---

## Step 3 — Put your database schema on Neon
(Only needed the first time, or after you change the schema.)
```bash
npm run db:migrate
```
Optional — load the demo catalog + test users:
```bash
npm run db:seed
```

---

## Step 4 — Deploy
```bash
npm run deploy
```
This builds the Worker and pushes it live. At the end wrangler prints a URL like
`https://printx-frontend.<your-subdomain>.workers.dev` — open it to check it works.

**To deploy again later, this is the ONLY step you repeat.**

---

## Step 5 — Point your domain at the Worker
1. Cloudflare dashboard → **Workers & Pages** → open **printx-frontend**
2. **Settings → Domains & Routes → Add → Custom Domain**
3. Enter your domain (e.g. `bhaginigraphics.co.in`) → Add

Cloudflare wires the DNS automatically because the domain is already in your
account. HTTPS is automatic.

---

## Later: turn on file uploads (Cloudflare R2 — free tier)
Uploads are off until you create an R2 bucket. When you're ready:
```bash
npx wrangler r2 bucket create printx-uploads
```
Then in `wrangler.jsonc`, uncomment the R2 binding block:
```jsonc
"r2_buckets": [{ "binding": "UPLOADS", "bucket_name": "printx-uploads" }]
```
Redeploy (`npm run deploy`). `storage.ts` uses this binding automatically.

## Later: turn on online wallet top-ups (Razorpay)
Add three more secrets, then redeploy:
```bash
npx wrangler secret put RAZORPAY_KEY_ID
npx wrangler secret put RAZORPAY_KEY_SECRET
```
Also set `NEXT_PUBLIC_RAZORPAY_KEY_ID` (a public build-time var — add it in the
Worker's **Settings → Variables**). Until then, wallet top-up uses manual instant
credit (dev mode).

---

## Test locally before deploying (optional)
- `npm run dev` — normal Next dev server (uses `.env`)
- `npm run preview` — runs the **built Worker** locally in Cloudflare's runtime,
  the closest thing to production. Put values in `.dev.vars` for this.

## Notes
- Free Worker size limit is 3 MiB gzipped; this app is ~2.94 MiB. If a future
  dependency pushes it over, either trim it or move to Workers Paid ($5/mo, 10 MiB).
- Ignore the older `DEPLOYMENT.md` / `S3_*` env vars — this file supersedes them
  (storage is now the R2 binding, not the AWS SDK).
