# Deploying Bhagini Graphics

Stack: Next.js 16 (App Router, Node runtime) + Prisma 7 + Neon Postgres.
Deploy target: **Vercel**. Object storage: **Cloudflare R2 or AWS S3**. Payments: **bank transfer with screenshot proof, approved by an admin**.

---

## 1. Database (Neon)

1. Create a project at [neon.tech] and copy the **pooled** connection string.
2. Set it as `DATABASE_URL` (locally in `.env`, and in Vercel env vars).
3. Apply the schema to the production DB:
   ```bash
   npm run db:migrate      # prisma migrate deploy
   ```
4. (Optional) Seed the real catalogue:
   ```bash
   npm run db:seed
   ```
   ⚠️ The seed **wipes and re-creates** demo data — run it only on a fresh DB.
   For production, create the super-admin + products through the admin UI instead,
   or write a production-safe seed.

## 2. Payments (bank transfer)

No payment gateway or env vars. Customers pay each order by bank transfer and
upload a screenshot or PDF of the payment; the order sits in **Payment pending**
until an admin approves it, which moves it to **Placed** and issues the invoice.

1. Log in as a **super admin** → **Settings** → fill in the account holder name,
   account number and IFSC (bank name and UPI ID optional). Only super admins can
   change these, and every change notifies all super admins.
2. Checkout returns an error until those three fields are set **and** file
   storage (section 3) is configured, because the payment screenshot needs
   somewhere to go.

## 3. File storage (R2 / S3)

1. Create a bucket (Cloudflare R2 recommended — S3-compatible, cheaper egress).
2. Create an access key pair with read/write on the bucket.
3. Set `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`.
   - R2 endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, region `auto`.
4. Behaviour: when configured, artwork and payment screenshots are stored in the
   bucket and streamed back through the authenticated `/api/files/[key]` route.
   When unset, `next dev` falls back to local disk, but a production build
   refuses checkout (the payment screenshot would have nowhere to go), so
   configure storage before launch.

## 4. Vercel

1. Import the repo; set **Root Directory** to `frontend`.
2. Add all env vars from `.env.example` (Production + Preview).
3. Build command is already `prisma generate && next build`; output is a Node server.
4. Deploy. First deploy: run `npm run db:migrate` against the production DB
   (locally with the prod `DATABASE_URL`, or via a one-off job).

## 5. Pre-launch checklist

- [ ] `DATABASE_URL` (pooled) + `JWT_SECRET` (strong, unique) set
- [ ] Bank details set in admin Settings + a test order paid, proof uploaded and approved
- [ ] R2/S3 configured + a test artwork upload/download verified
- [ ] Real super-admin created; default demo admin password (`Admin@123`) changed
- [ ] Real catalogue loaded; demo data removed
- [ ] `npm run build` passes; `/api/*` routes reachable
