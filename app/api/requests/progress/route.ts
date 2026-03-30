import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      error: "查询码模式已下线，请访问 /progress 查看公开进度"
    },
    { status: 410 }
  );
}
