import { NextResponse } from "next/server";
import { ZodError } from "zod";

/** Throwable HTTP error handlers can raise; converted to a JSON response. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

/** Wrap a route handler body: turns thrown errors into clean JSON responses. */
export function handleError(err: unknown) {
  if (err instanceof HttpError) return fail(err.status, err.message);
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: err.flatten() },
      { status: 422 },
    );
  }
  console.error("[api] unhandled error:", err);
  return fail(500, "Something went wrong");
}
