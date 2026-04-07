import { Prisma } from "@prisma/client";
import { AppError } from "@/lib/app-error";
import { decryptText, encryptText } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { sendTelegramText, type TelegramSendConfig } from "@/lib/telegram";

const TELEGRAM_SETTING_KEY = "telegram_notification";

type TelegramSettingValue = {
  enabled: boolean;
  chatId: string | null;
  botTokenEncrypted: string | null;
};

type TelegramSettingSource = "database" | "env" | "none";

export type TelegramAdminSettings = {
  enabled: boolean;
  chatId: string;
  hasBotToken: boolean;
  source: TelegramSettingSource;
};

type UpdateTelegramSettingsInput = {
  enabled: boolean;
  chatId?: string;
  botToken?: string;
};

function getEnvTelegramConfig() {
  const token = (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID ?? "").trim();
  return {
    token,
    chatId
  };
}

function parseTelegramSettingValue(value: unknown): TelegramSettingValue | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<TelegramSettingValue>;
  const enabled = typeof candidate.enabled === "boolean" ? candidate.enabled : false;
  const chatId = typeof candidate.chatId === "string" ? candidate.chatId : null;
  const botTokenEncrypted =
    typeof candidate.botTokenEncrypted === "string" ? candidate.botTokenEncrypted : null;

  return { enabled, chatId, botTokenEncrypted };
}

function isAppSettingTableMissing(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021";
}

async function getStoredTelegramSetting() {
  let record: { value: Prisma.JsonValue } | null = null;
  try {
    record = await prisma.appSetting.findUnique({
      where: { key: TELEGRAM_SETTING_KEY },
      select: { value: true }
    });
  } catch (error) {
    // If migration has not been applied yet, fallback to env settings.
    if (isAppSettingTableMissing(error)) {
      return null;
    }
    throw error;
  }

  if (!record) return null;

  const parsed = parseTelegramSettingValue(record.value);
  if (!parsed) return null;

  return parsed;
}

function toAdminSettings(
  source: TelegramSettingSource,
  enabled: boolean,
  chatId: string | null | undefined,
  hasBotToken: boolean
): TelegramAdminSettings {
  return {
    enabled,
    chatId: chatId ?? "",
    hasBotToken,
    source
  };
}

export async function getTelegramAdminSettings() {
  const stored = await getStoredTelegramSetting();
  if (stored) {
    return toAdminSettings("database", stored.enabled, stored.chatId, Boolean(stored.botTokenEncrypted));
  }

  const envConfig = getEnvTelegramConfig();
  if (envConfig.token && envConfig.chatId) {
    return toAdminSettings("env", true, envConfig.chatId, true);
  }

  return toAdminSettings("none", false, "", false);
}

export async function getTelegramRuntimeConfig(): Promise<TelegramSendConfig | null> {
  const stored = await getStoredTelegramSetting();
  if (stored) {
    if (!stored.enabled || !stored.botTokenEncrypted || !stored.chatId) {
      return null;
    }

    const token = decryptText(stored.botTokenEncrypted);
    if (!token) return null;

    return {
      token,
      chatId: stored.chatId
    };
  }

  const envConfig = getEnvTelegramConfig();
  if (!envConfig.token || !envConfig.chatId) {
    return null;
  }

  return {
    token: envConfig.token,
    chatId: envConfig.chatId
  };
}

export async function updateTelegramSettings(input: UpdateTelegramSettingsInput) {
  const stored = await getStoredTelegramSetting();
  const envConfig = getEnvTelegramConfig();

  const existingToken = stored?.botTokenEncrypted ? decryptText(stored.botTokenEncrypted) : envConfig.token;
  const existingChatId = stored?.chatId ?? envConfig.chatId;

  const nextChatId =
    typeof input.chatId === "string" ? input.chatId.trim() : (existingChatId ?? "").trim();
  const nextToken =
    typeof input.botToken === "string"
      ? input.botToken.trim()
      : (existingToken ?? "").trim();

  if (input.enabled && (!nextToken || !nextChatId)) {
    throw new AppError("启用通知前，请填写 Telegram Bot Token 和 Chat ID", 400);
  }

  const nextValue: TelegramSettingValue = {
    enabled: input.enabled,
    chatId: nextChatId || null,
    botTokenEncrypted: nextToken ? encryptText(nextToken) : null
  };

  try {
    await prisma.appSetting.upsert({
      where: { key: TELEGRAM_SETTING_KEY },
      create: {
        key: TELEGRAM_SETTING_KEY,
        value: nextValue
      },
      update: {
        value: nextValue
      }
    });
  } catch (error) {
    if (isAppSettingTableMissing(error)) {
      throw new AppError("通知设置表不存在，请先执行数据库迁移", 500);
    }
    throw error;
  }

  return getTelegramAdminSettings();
}

export async function sendTelegramTestMessage(customText?: string) {
  const config = await getTelegramRuntimeConfig();
  if (!config) {
    throw new AppError("Telegram 通知未启用或配置不完整", 400);
  }

  const text = (customText ?? "").trim() || "测试通知：Telegram Bot 配置成功。";
  await sendTelegramText(config, text);
}
