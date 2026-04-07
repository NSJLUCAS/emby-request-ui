import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { AppError } from "@/lib/app-error";
import { handleApiError, jsonError, jsonOk } from "@/lib/http-response";
import { sendTelegramTestMessage } from "@/lib/telegram-settings";

type TelegramTestBody = {
  text?: string;
};

export async function POST(req: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return jsonError("未登录", 401);
    }

    const body = (await req.json().catch(() => ({}))) as TelegramTestBody;
    const text = typeof body.text === "string" ? body.text : undefined;

    if (text && text.length > 1000) {
      throw new AppError("测试消息长度不能超过 1000 字符", 400);
    }

    await sendTelegramTestMessage(text);
    return jsonOk({ sent: true });
  } catch (error) {
    return handleApiError(error, "Send telegram test message failed:", "发送测试通知失败");
  }
}
