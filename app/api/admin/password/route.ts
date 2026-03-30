import { NextResponse } from "next/server";
import {
  DEFAULT_ADMIN_USERNAME,
  ensureDefaultAdminCredential,
  getAuthenticatedAdmin,
  hashPassword,
  verifyPassword
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type PasswordBody = {
  currentPassword?: string;
  newPassword?: string;
};

export async function PATCH(req: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = (await req.json()) as PasswordBody;
    const currentPassword = body.currentPassword ?? "";
    const newPassword = (body.newPassword ?? "").trim();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "请完整填写密码信息" }, { status: 400 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: "新密码至少 4 位" }, { status: 400 });
    }

    await ensureDefaultAdminCredential();

    const admin = await prisma.adminCredential.findUnique({
      where: { username: DEFAULT_ADMIN_USERNAME }
    });

    if (!admin || !verifyPassword(currentPassword, admin.passwordHash)) {
      return NextResponse.json({ error: "当前密码错误" }, { status: 400 });
    }

    await prisma.adminCredential.update({
      where: { id: admin.id },
      data: {
        passwordHash: hashPassword(newPassword)
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update admin password failed:", error);
    return NextResponse.json({ error: "修改密码失败，请稍后重试" }, { status: 500 });
  }
}
