# Bhagini Graphics (PrintX)

Online printing for Indian businesses: live pricing, artwork upload, prepaid orders by bank transfer,
and an admin console for catalogue, orders, payments and customers. Live at
[bhaginigraphics.co.in](https://bhaginigraphics.co.in).

**Stack:** Next.js 16 (App Router) · Prisma 7 · Neon Postgres · Cloudflare Workers (OpenNext) · R2 for uploads.

## Run it locally

```bash
npm install            # also generates the Prisma client
cp .env.example .env   # set DATABASE_URL and JWT_SECRET
npm run dev            # http://localhost:3000
```

`npm run dev` talks to whatever `DATABASE_URL` points at. Use a scratch database, not production.

## Checks

```bash
npm test               # pure unit suites in scripts/
npx tsc --noEmit
npm run lint
npm run build
```

## More

- [CLOUDFLARE_DEPLOY.md](CLOUDFLARE_DEPLOY.md): deploying, secrets, R2 and the launch checklist
- [CLAUDE.md](CLAUDE.md): working conventions and testing notes
- [CHANGELOG.md](CHANGELOG.md), [TODOS.md](TODOS.md)
