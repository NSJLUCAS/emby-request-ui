import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { AppError } from "@/lib/app-error";
import { handleApiError, jsonError, jsonOk } from "@/lib/http-response";
import { getTelegramAdminSettings, updateTelegramSettings } from "@/lib/telegram-settings";

type UpdateTelegramBody = {
  enabled?: boolean;
  chatId?: string;
  botToken?: string;
};

export async function GET() {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return jsonError("未登录", 401);
    }

    const settings = await getTelegramAdminSettings();
    return jsonOk({ settings });
  } catch (error) {
    return handleApiError(error, "Get telegram settings failed:", "读取通知配置失败");
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return jsonError("未登录", 401);
    }

    const body = (await req.json().catch(() => {
      throw new AppError("请求体格式错误", 400);
    })) as UpdateTelegramBody;

    if (typeof body.enabled !== "boolean") {
      return jsonError("enabled 必须是布尔值", 400);
    }

    const settings = await updateTelegramSettings({
      enabled: body.enabled,
      chatId: body.chatId,
      botToken: body.botToken
    });

    return jsonOk({ settings });
  } catch (error) {
    return handleApiError(error, "Update telegram settings failed:", "保存通知配置失败");
  }
}
