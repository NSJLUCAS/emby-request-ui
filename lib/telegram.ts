type RequestNotificationPayload = {
  id: number;
  title: string;
  type: string;
  year: number | null;
  note: string | null;
  tmdbUrl: string | null;
  status: string;
  createdAt: Date;
};

export type TelegramSendConfig = {
  token: string;
  chatId: string;
};

const TELEGRAM_API_BASE = "https://api.telegram.org";
const TELEGRAM_TIMEOUT_MS = 10_000;

function getEnvTelegramConfig() {
  const token = (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID ?? "").trim();
  return { token, chatId };
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "medium",
    hour12: false
  }).format(date);
}

function buildRequestMessage(payload: RequestNotificationPayload) {
  const lines = [
    "新求片通知",
    `ID: ${payload.id}`,
    `片名: ${payload.title}`,
    `类型: ${payload.type}`,
    `状态: ${payload.status}`,
    `提交时间: ${formatTime(payload.createdAt)}`
  ];

  if (payload.year) {
    lines.push(`年份: ${payload.year}`);
  }

  if (payload.tmdbUrl) {
    lines.push(`TMDB: ${payload.tmdbUrl}`);
  }

  if (payload.note) {
    lines.push(`备注: ${payload.note}`);
  }

  return lines.join("\n");
}

export async function sendNewRequestTelegramNotification(payload: RequestNotificationPayload) {
  const config = getEnvTelegramConfig();
  if (!config.token || !config.chatId) {
    return;
  }
  await sendNewRequestTelegramNotificationWithConfig(payload, config);
}

export async function sendNewRequestTelegramNotificationWithConfig(
  payload: RequestNotificationPayload,
  config: TelegramSendConfig
) {
  const text = buildRequestMessage(payload);
  await sendTelegramText(config, text);
}

export async function sendTelegramText(config: TelegramSendConfig, text: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);
  const url = `${TELEGRAM_API_BASE}/bot${config.token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        disable_web_page_preview: true
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Telegram notify failed:", response.status, details);
    }
  } catch (error) {
    console.error("Telegram notify failed:", error);
  } finally {
    clearTimeout(timeout);
  }
}
