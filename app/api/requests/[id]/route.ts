import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { handleApiError, jsonError, jsonOk } from "@/lib/http-response";
import { deleteRequestById } from "@/lib/services/request-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return jsonError("未登录，无法删除记录", 401);
    }

    const { id } = await params;
    await deleteRequestById(id);
    return jsonOk({});
  } catch (error) {
    return handleApiError(error, "Delete request failed:", "删除失败，请稍后重试");
  }
}
