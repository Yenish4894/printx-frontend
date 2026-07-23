import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// On Cloudflare Workers the Neon WebSocket transport hangs (query runs but the
// promise never resolves — prisma/prisma#25803), so route queries over HTTP fetch.
neonConfig.poolQueryViaFetch = true;

const makeClient = () =>
  new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
  });

// A Prisma client MUST NOT be shared across requests on Workers: its fetch
// promises would resolve in a different request context and get canceled
// ("Worker's code had hung"). So we cache one client per request, keyed by the
// per-request Cloudflare execution context (a distinct object per invocation),
// and fall back to a single client outside request scope (build / seed / Node dev).
const perRequest = new WeakMap<object, PrismaClient>();
let fallbackClient: PrismaClient | undefined;

function client(): PrismaClient {
  let key: object | undefined;
  try {
    const ctx = getCloudflareContext();
    key = (ctx?.ctx as object | undefined) ?? undefined;
  } catch {
    key = undefined; // not in a Workers request (Node dev / build / seed)
  }
  if (!key) return (fallbackClient ??= makeClient());

  let c = perRequest.get(key);
  if (!c) {
    c = makeClient();
    perRequest.set(key, c);
  }
  return c;
}

// Transparent proxy so callers keep `import prisma from "@/lib/prisma"` and every
// access resolves to the current request's client. Methods are bound to it.
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const c = client();
    const value = c[prop as keyof PrismaClient];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(c) : value;
  },
});

export default prisma;
