import { NextResponse } from "next/server";
import { AppError } from "@/lib/app-error";
import { handleApiError, jsonOk } from "@/lib/http-response";
import { createRequest, listRequests } from "@/lib/services/request-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => {
      throw new AppError("请求体格式错误", 400);
    })) as {
      title?: string;
      type?: string;
      year?: number | string | null;
      note?: string;
      tmdbUrl?: string;
    };

    const created = await createRequest(body);

    return jsonOk({
      id: created.id,
      status: created.status
    });
  } catch (error) {
    return handleApiError(error, "Create request failed:", "提交失败，请稍后重试");
  }
}

export async function GET() {
  try {
    const data = await listRequests();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, "Fetch requests failed:", "读取失败，请稍后重试");
  }
}
