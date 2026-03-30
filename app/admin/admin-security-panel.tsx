"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function AdminSecurityPanel({ username }: { username: string }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "两次输入的新密码不一致" });
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/admin/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setMessage({ type: "error", text: result?.error ?? "修改密码失败" });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({ type: "success", text: "密码已修改成功" });
    } catch {
      setMessage({ type: "error", text: "网络异常，请稍后重试" });
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border p-4" style={{ borderColor: "var(--surface-border)", background: "var(--table-row-bg)" }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          当前管理员：<span className="font-semibold" style={{ color: "var(--text-main)" }}>{username}</span>
        </p>
        <button
          className="rounded-md border px-3 py-1.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy}
          onClick={handleLogout}
          style={{ borderColor: "var(--field-border)", color: "var(--text-main)" }}
          type="button"
        >
          退出登录
        </button>
      </div>

      <form className="grid gap-3 md:grid-cols-3" onSubmit={handlePasswordSubmit}>
        <input
          className="form-control"
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="当前密码"
          required
          type="password"
          value={currentPassword}
        />
        <input
          className="form-control"
          minLength={4}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="新密码（至少4位）"
          required
          type="password"
          value={newPassword}
        />
        <input
          className="form-control"
          minLength={4}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="确认新密码"
          required
          type="password"
          value={confirmPassword}
        />
        <button
          className="inline-flex h-10 items-center justify-center rounded-lg bg-cyan-500 px-4 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-3"
          disabled={busy}
          type="submit"
        >
          {busy ? "处理中..." : "修改密码"}
        </button>
      </form>

      {message && (
        <p
          className={message.type === "success" ? "alert-success mt-3" : "alert-error mt-3"}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
