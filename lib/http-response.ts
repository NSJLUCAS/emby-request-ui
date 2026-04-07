import { NextResponse } from "next/server";
import { AppError } from "@/lib/app-error";

export function jsonOk<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown, logContext: string, defaultMessage: string) {
  if (error instanceof AppError) {
    return jsonError(error.message, error.status);
  }

  console.error(logContext, error);
  return jsonError(defaultMessage, 500);
}
