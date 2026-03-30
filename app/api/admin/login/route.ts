import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  createSessionToken,
  ensureDefaultAdminCredential,
  getSessionCookieConfig,
  verifyPassword
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type LoginBody = {
  username?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginBody;
    const username = (body.username ?? "").trim();
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json({ error: "请输入账号和密码" }, { status: 400 });
    }

    await ensureDefaultAdminCredential();

    const admin = await prisma.adminCredential.findUnique({
      where: { username }
    });

    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
    }

    const token = createSessionToken(admin.username);
    const { name, options } = getSessionCookieConfig();
    const response = NextResponse.json({ ok: true });

    response.cookies.set(name, token, options);
    return response;
  } catch (error) {
    console.error("Admin login failed:", error);

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({ error: "数据库连接失败，请先启动 PostgreSQL 服务" }, { status: 503 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json({ error: "管理员表不存在，请先执行 Prisma 迁移" }, { status: 500 });
    }

    return NextResponse.json({ error: "登录失败，请稍后重试" }, { status: 500 });
  }
}
