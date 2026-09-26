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

## Before taking orders: turn on file uploads (Cloudflare R2 — free tier)
Uploads are off until you create an R2 bucket. Customers upload their payment
screenshot to R2, so **checkout stays closed on the live Worker until this is
done** (placing an order returns "payment uploads are unavailable"). To enable:
```bash
npx wrangler r2 bucket create printx-uploads
```
Then in `wrangler.jsonc`, uncomment the R2 binding block:
```jsonc
"r2_buckets": [{ "binding": "UPLOADS", "bucket_name": "printx-uploads" }]
```
Redeploy (`npm run deploy`). `storage.ts` uses this binding automatically.

## Before taking orders: add your bank details
Customers pay each order by bank transfer, upload a screenshot of the payment,
and an admin approves it on the order page. Log in to the admin panel as a
**super admin** → **Settings** and fill in the account holder name, account
number and IFSC (bank name is optional). Until those three are set,
checkout stays closed. No payment gateway keys or extra secrets are needed.

---

## Test locally before deploying (optional)
- `npm run dev` — normal Next dev server (uses `.env`)
- `npm run preview` — runs the **built Worker** locally in Cloudflare's runtime,
  the closest thing to production. Put values in `.dev.vars` for this.

## Notes
- Free Worker size limit is 3 MiB gzipped; this app is ~2.94 MiB. If a future
  dependency pushes it over, either trim it or move to Workers Paid ($5/mo, 10 MiB).
- `DEPLOYMENT.md` is only a pointer to this file. There are no `S3_*` variables: file storage is the R2 binding described above.
  (storage is now the R2 binding, not the AWS SDK).

## Before launch: checklist

- [ ] `DATABASE_URL` and `JWT_SECRET` set as Worker secrets (a strong, unique `JWT_SECRET`)
- [ ] R2 bucket created and the `UPLOADS` binding uncommented, then a test artwork upload and download verified
- [ ] Bank details saved in admin Settings, then a test order placed, paid, proof uploaded and approved
- [ ] A real super admin created in Admin Users, and the demo admin (`9000000000` / `Admin@123`) deactivated or removed. There is no change-password screen yet.
- [ ] Demo customers and test orders removed; real catalogue and product photos added
- [ ] New signups need approval: someone is checking the Customers > Pending tab (nothing is emailed or texted)
