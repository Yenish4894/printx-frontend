# TODOS

## Orders

### Auto-cancel unpaid orders after a deadline

**What:** Cancel `PAYMENT_PENDING` orders that have no payment proof after N days (unless a proof is under review).

**Why:** Unpaid orders never expire today. An abandoned order keeps its checkout price forever (a transfer could arrive weeks later at an old rate), holds an order number, sits in the customer's Active tab and inflates the admin's "Awaiting payment" count.

**Context:** Needs a scheduled job. Cloudflare Workers cron triggers (`triggers.crons` in `wrangler.jsonc`) can call a guarded internal route or a scheduled handler that cancels matching orders. Reuse `cancelOrder` semantics: take `lockOrder` first, skip anything where `isProofInReview` is true, write a status-history note and notify the customer. Decide N with the business (for example 7 days) and show the deadline on the payment panel.

**Effort:** M
**Priority:** P2
**Depends on:** Business decision on the deadline

### Drop the retired PAYMENT_CONFIRMED status

**What:** After 0.2.0.0 is deployed, migrate any `PAYMENT_CONFIRMED` orders to `PLACED` and remove the value from the `OrderStatus` enum.

**Why:** It is kept only because the previously deployed build can still write it. The code treats it as an alias of `PLACED` (`nextStatuses`, `CANCELLABLE_STATUSES`, `IN_PRODUCTION_STATUSES`).

**Context:** Postgres cannot drop an enum value in place. Create a new type without it, cast the column, drop the old type. Only do this once no old build is live. Removing it also lets the alias code in `src/lib/orderStatus.ts` go.

**Effort:** S
**Priority:** P3
**Depends on:** 0.2.0.0 deployed

## Payments

### Record the payout reference on refunds

**What:** Collect the customer's refund account (or reuse the account they paid from) and store the bank UTR when an admin marks a refund as sent.

**Why:** Refunds are now manual bank transfers, and nothing records where the money went or proves it was sent.

**Context:** `processRefund` in `src/lib/services/admin/refunds.ts` only flips the status. Add `payoutReference` (and optionally a proof file) to `Refund`, require it on approve, and show it to the customer.

**Effort:** S
**Priority:** P3
**Depends on:** None

## Completed
