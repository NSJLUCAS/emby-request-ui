import { NextResponse } from "next/server";
import { getSessionCookieConfig } from "@/lib/admin-auth";

export async function POST() {
  const { name, options } = getSessionCookieConfig();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(name, "", { ...options, maxAge: 0 });
  return response;
}
