import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const allowedStatuses = new Set(["待处理", "已完成", "已拒绝"]);

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdateStatusBody = {
  status?: string;
};

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return NextResponse.json({ error: "未登录，无法修改状态" }, { status: 401 });
    }

    const { id } = await params;
    const requestId = Number(id);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return NextResponse.json({ error: "无效的记录 ID" }, { status: 400 });
    }

    const body = (await req.json()) as UpdateStatusBody;
    const status = (body.status ?? "").trim();

    if (!allowedStatuses.has(status)) {
      return NextResponse.json({ error: "无效状态" }, { status: 400 });
    }

    const updated = await prisma.request.update({
      where: { id: requestId },
      data: { status }
    });

    return NextResponse.json({
      ok: true,
      id: updated.id,
      status: updated.status
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }

    console.error("Update request status failed:", error);
    return NextResponse.json({ error: "更新失败，请稍后重试" }, { status: 500 });
  }
}
