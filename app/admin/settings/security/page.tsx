import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import AdminNav from "@/app/admin/admin-nav";
import AdminSecurityPanel from "@/app/admin/admin-security-panel";

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  const session = await getAuthenticatedAdmin();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card-surface w-full max-w-4xl">
        <div className="mb-6 border-b pb-4" style={{ borderColor: "var(--surface-border)" }}>
          <p className="page-kicker">Admin Panel</p>
          <h1 className="page-title">安全设置</h1>
          <p className="page-desc">在这里修改管理员密码与退出登录。</p>
        </div>

        <AdminNav current="security" />
        <AdminSecurityPanel username={session.username} />
      </div>
    </main>
  );
}
