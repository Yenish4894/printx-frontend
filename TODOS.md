# TODOS

## Orders

### Auto-cancel unpaid orders after a deadline

**What:** Cancel `PAYMENT_PENDING` orders that have no payment proof after N days (unless a proof is under review).

**Why:** Unpaid orders never expire today. An abandoned order keeps its checkout price forever (a transfer could arrive weeks later at an old rate), holds an order number, sits in the customer's Active tab and inflates the admin's "Awaiting payment" count.

**Context:** Needs a scheduled job. Cloudflare Workers cron triggers (`triggers.crons` in `wrangler.jsonc`) can call a guarded internal route or a scheduled handler that cancels matching orders. Reuse `cancelOrder` semantics: take `lockOrder` first, skip anything where `isProofInReview` is true, write a status-history note and notify the customer. Decide N with the business (for example 7 days) and show the deadline on the payment panel.

**Effort:** M
**Priority:** P2
**Depends on:** Business decision on the deadline

## Auth

### Automated tests for the signup-approval wiring

**What:** Add an integration script that covers the routes, not just the pure rules: register issues no cookie; login is 403 only with the correct password and 401 otherwise; `requireUser` returns 401 after an account is set back to PENDING; approve/reject transitions and their 422 messages; `createStaff` defaults to APPROVED.

**Why:** `scripts/test-lib-units.ts` covers `approval.ts` and the review schema, but nothing automated guards the security-critical ordering in `login/route.ts`, `requireUser` and `me/route.ts`. A future edit could drop the check, or run it before the password is verified (which would leak which numbers have applied), and every unit test would still pass. The 38-check run and the browser run used for the release were manual.

**Context:** Services import the Cloudflare WASM Prisma client so they can't run under plain Node; the checks have to go over HTTP against `npm run dev`, which talks to the production database (see CLAUDE.md), so any committed script must create and delete its own throwaway users. A browser flow test also exists (Playwright driving the installed Chrome) but lives outside the repo.

**Effort:** M
**Priority:** P2
**Depends on:** None

### Login timing reveals which mobile numbers are registered

**What:** `login/route.ts` skips bcrypt for an unknown or inactive mobile, so it answers measurably faster than for a real account with a wrong password.

**Why:** It lets someone probe which businesses have accounts. Low value on its own, since signup's 409 already says "an account with this mobile number already exists", but worth closing together with that.

**Context:** Run `bcrypt.compare` against a constant dummy hash when the user is missing or inactive. Mind the Workers free-plan 10 ms CPU limit (bcrypt cost 8 is already the biggest cost in that route).

**Effort:** S
**Priority:** P3
**Depends on:** None

## Payments

### Record the payout reference on refunds

**What:** Collect the customer's refund account (or reuse the account they paid from) and store the bank UTR when an admin marks a refund as sent.

**Why:** Refunds are now manual bank transfers, and nothing records where the money went or proves it was sent.

**Context:** `processRefund` in `src/lib/services/admin/refunds.ts` only flips the status. Add `payoutReference` (and optionally a proof file) to `Refund`, require it on approve, and show it to the customer.

**Effort:** S
**Priority:** P3
**Depends on:** None

## Completed
