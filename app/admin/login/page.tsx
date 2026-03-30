import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAuthenticatedAdmin();
  if (session) {
    redirect("/admin");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card-surface w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="page-kicker">Admin Login</p>
          <h1 className="page-title">管理员登录</h1>
          <p className="page-desc">
            默认账号密码为 amdin / admin，登录后可在后台修改密码。
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
