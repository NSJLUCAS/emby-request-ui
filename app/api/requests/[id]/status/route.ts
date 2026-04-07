import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { AppError } from "@/lib/app-error";
import { handleApiError, jsonError, jsonOk } from "@/lib/http-response";
import { updateRequestStatus } from "@/lib/services/request-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdateStatusBody = {
  status?: string;
};

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return jsonError("未登录，无法修改状态", 401);
    }

    const { id } = await params;
    const body = (await req.json().catch(() => {
      throw new AppError("请求体格式错误", 400);
    })) as UpdateStatusBody;
    const updated = await updateRequestStatus(id, body.status ?? "");

    return jsonOk({
      id: updated.id,
      status: updated.status
    });
  } catch (error) {
    return handleApiError(error, "Update request status failed:", "更新失败，请稍后重试");
  }
}
