import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import AdminNav from "@/app/admin/admin-nav";
import { getTelegramAdminSettings } from "@/lib/telegram-settings";
import NotificationsPanel from "./notifications-panel";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const session = await getAuthenticatedAdmin();
  if (!session) {
    redirect("/admin/login");
  }

  const settings = await getTelegramAdminSettings();

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card-surface w-full max-w-4xl">
        <div className="mb-6 border-b pb-4" style={{ borderColor: "var(--surface-border)" }}>
          <p className="page-kicker">Admin Panel</p>
          <h1 className="page-title">通知设置</h1>
          <p className="page-desc">在这里管理 Telegram Bot 配置并发送测试通知。</p>
        </div>

        <AdminNav current="notifications" />
        <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
          当前管理员：<span className="font-semibold" style={{ color: "var(--text-main)" }}>{session.username}</span>
        </p>
        <NotificationsPanel initialSettings={settings} />
      </div>
    </main>
  );
}
