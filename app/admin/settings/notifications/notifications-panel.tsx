"use client";

import { useState, type FormEvent } from "react";

type TelegramSettingsView = {
  enabled: boolean;
  chatId: string;
  hasBotToken: boolean;
  source: "database" | "env" | "none";
};

type MessageState = {
  type: "success" | "error";
  text: string;
};

export default function NotificationsPanel({ initialSettings }: { initialSettings: TelegramSettingsView }) {
  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [chatId, setChatId] = useState(initialSettings.chatId);
  const [botToken, setBotToken] = useState("");
  const [testText, setTestText] = useState("测试通知：Telegram Bot 配置成功。");
  const [hasBotToken, setHasBotToken] = useState(initialSettings.hasBotToken);
  const [source, setSource] = useState<TelegramSettingsView["source"]>(initialSettings.source);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/settings/telegram", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          chatId,
          botToken: botToken.trim() || undefined
        })
      });

      const result = (await response.json().catch(() => null)) as
        | { error?: string; settings?: TelegramSettingsView }
        | null;

      if (!response.ok || !result?.settings) {
        setMessage({ type: "error", text: result?.error ?? "保存失败，请稍后重试" });
        return;
      }

      setEnabled(result.settings.enabled);
      setChatId(result.settings.chatId);
      setHasBotToken(result.settings.hasBotToken);
      setSource(result.settings.source);
      setBotToken("");
      setMessage({ type: "success", text: "通知配置已保存" });
    } catch {
      setMessage({ type: "error", text: "网络异常，请稍后重试" });
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    setTesting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/settings/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testText.trim() || undefined })
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setMessage({ type: "error", text: result?.error ?? "测试通知发送失败" });
        return;
      }

      setMessage({ type: "success", text: "测试通知已发送，请检查 Telegram" });
    } catch {
      setMessage({ type: "error", text: "网络异常，请稍后重试" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <section className="rounded-xl border p-4" style={{ borderColor: "var(--surface-border)", background: "var(--table-row-bg)" }}>
      <p className="mb-3 text-sm" style={{ color: "var(--text-muted)" }}>
        配置来源：<span style={{ color: "var(--text-main)" }}>{source}</span>
      </p>

      <form className="space-y-4" onSubmit={saveSettings}>
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-main)" }}>
          <input
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            type="checkbox"
          />
          启用 Telegram 求片通知
        </label>

        <div>
          <label className="field-label" htmlFor="telegram-chat-id">
            Chat ID
          </label>
          <input
            className="form-control"
            id="telegram-chat-id"
            onChange={(e) => setChatId(e.target.value)}
            placeholder="例如：123456789 或 -100123456789"
            type="text"
            value={chatId}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="telegram-bot-token">
            Bot Token
          </label>
          <input
            className="form-control"
            id="telegram-bot-token"
            onChange={(e) => setBotToken(e.target.value)}
            placeholder={hasBotToken ? "已保存，留空表示不修改" : "输入新的 Telegram Bot Token"}
            type="password"
            value={botToken}
          />
        </div>

        <button
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-cyan-500 px-4 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? "保存中..." : "保存通知配置"}
        </button>
      </form>

      <div className="mt-6 border-t pt-4" style={{ borderColor: "var(--surface-border)" }}>
        <label className="field-label" htmlFor="telegram-test-text">
          测试消息内容
        </label>
        <textarea
          className="form-control min-h-20 resize-y"
          id="telegram-test-text"
          onChange={(e) => setTestText(e.target.value)}
          placeholder="输入测试消息内容"
          value={testText}
        />

        <button
          className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
          disabled={testing}
          onClick={sendTest}
          style={{ borderColor: "var(--field-border)", color: "var(--text-main)" }}
          type="button"
        >
          {testing ? "发送中..." : "发送测试通知"}
        </button>
      </div>

      {message && (
        <p className={message.type === "success" ? "alert-success mt-4" : "alert-error mt-4"}>
          {message.text}
        </p>
      )}
    </section>
  );
}
