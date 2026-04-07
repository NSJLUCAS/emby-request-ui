import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTelegramRuntimeConfig } from "@/lib/telegram-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date().toISOString();
  const telegramConfig = await getTelegramRuntimeConfig().catch(() => null);

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      service: "emby-request-ui",
      timestamp: now,
      database: "up",
      telegram: telegramConfig ? "configured" : "disabled"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        ok: false,
        service: "emby-request-ui",
        timestamp: now,
        database: "down",
        telegram: telegramConfig ? "configured" : "disabled"
      },
      { status: 503 }
    );
  }
}
