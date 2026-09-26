@AGENTS.md

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec

## Testing

- `npm test` — pure unit suites in `scripts/` run with tsx: order state machine
  (`test-order-status.ts`), pricing engine (`test-pricing.ts`), and the full
  letterhead rate card (`test-letterhead-pricing.ts`, 432 combinations), and the
  shared lib modules (`test-lib-units.ts`: DTOs, payment rules, order/invoice
  numbers, status sets). Put new business rules in a pure `src/lib` module so
  they land here.
- Also gate on `npx tsc --noEmit`, `npm run lint` (must stay at 0
  errors) and `npm run build`.
- Services import the Cloudflare (wasm) Prisma client, so they cannot be unit
  tested from Node; exercise them over HTTP against `npm run dev`. Local dev
  talks to the production Neon database, so clean up anything a test creates.
- Stop `npm run dev` before `npm run build`: they share `.next`, and a build
  under a running dev server leaves it serving 404s for existing routes.
