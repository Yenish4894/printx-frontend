# Deploying Bhagini Graphics

The site runs on **Cloudflare Workers** (not Vercel) with a **Neon** Postgres database, and file
storage is a Cloudflare **R2** bucket binding (there are no `S3_*` environment variables).

The full, current guide, including the launch checklist, is **[CLOUDFLARE_DEPLOY.md](CLOUDFLARE_DEPLOY.md)**.
This file used to describe a Vercel + S3 setup and is kept only as a pointer so old links still work.
