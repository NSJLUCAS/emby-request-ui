import Link from "next/link";

type AdminNavProps = {
  current: "requests" | "security" | "notifications";
};

function navClass(active: boolean) {
  if (active) {
    return "rounded-lg border px-3 py-2 text-sm font-medium transition";
  }
  return "rounded-lg border px-3 py-2 text-sm transition hover:opacity-85";
}

export default function AdminNav({ current }: AdminNavProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Link
        className={navClass(current === "requests")}
        href="/admin"
        style={{
          borderColor: current === "requests" ? "var(--accent)" : "var(--field-border)",
          color: "var(--text-main)"
        }}
      >
        求片列表
      </Link>
      <Link
        className={navClass(current === "security")}
        href="/admin/settings/security"
        style={{
          borderColor: current === "security" ? "var(--accent)" : "var(--field-border)",
          color: "var(--text-main)"
        }}
      >
        安全设置
      </Link>
      <Link
        className={navClass(current === "notifications")}
        href="/admin/settings/notifications"
        style={{
          borderColor: current === "notifications" ? "var(--accent)" : "var(--field-border)",
          color: "var(--text-main)"
        }}
      >
        通知设置
      </Link>
      <Link
        className="rounded-lg border px-3 py-2 text-sm transition hover:opacity-85 sm:ml-auto"
        href="/"
        style={{
          borderColor: "var(--field-border)",
          color: "var(--text-main)"
        }}
      >
        返回主页
      </Link>
    </div>
  );
}
