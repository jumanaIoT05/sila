import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Thin helpers so route handlers stay uniform: parse → call service → respond.

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Wraps a handler so thrown AppErrors / ZodErrors become clean JSON responses.
export function handle(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  return fn().catch((err) => {
    if (err instanceof AppError) return fail(err.message, err.status);
    if (err instanceof ZodError) {
      return fail(err.issues.map((i) => i.message).join(", "), 422);
    }
    console.error("[API error]", err);
    return fail("Internal server error", 500);
  });
}

// Domain error with an HTTP status attached.
export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
