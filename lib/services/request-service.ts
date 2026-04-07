import { Prisma } from "@prisma/client";
import { AppError } from "@/lib/app-error";
import { prisma } from "@/lib/prisma";
import {
  isRequestStatus,
  isRequestType,
  normalizeTitle,
  parseRequestId,
  type RequestStatus
} from "@/lib/request-domain";
import { getTelegramRuntimeConfig } from "@/lib/telegram-settings";
import { sendNewRequestTelegramNotificationWithConfig } from "@/lib/telegram";

type CreateRequestInput = {
  title?: string;
  type?: string;
  year?: number | string | null;
  note?: string;
  tmdbUrl?: string;
};

function parseYear(yearRaw: number | string | null | undefined) {
  if (typeof yearRaw === "number" && Number.isFinite(yearRaw)) {
    const value = Math.trunc(yearRaw);
    if (value < 1888 || value > 2100) {
      throw new AppError("年份范围必须在 1888 到 2100 之间", 400);
    }
    return value;
  }

  if (typeof yearRaw === "string" && yearRaw.trim() !== "") {
    const parsed = Number(yearRaw);
    if (!Number.isFinite(parsed)) {
      throw new AppError("年份格式不正确", 400);
    }
    const value = Math.trunc(parsed);
    if (value < 1888 || value > 2100) {
      throw new AppError("年份范围必须在 1888 到 2100 之间", 400);
    }
    return value;
  }

  return null;
}

function parseTmdbUrl(raw: string | undefined) {
  const value = (raw ?? "").trim();
  if (!value) return null;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new AppError("TMDB 链接格式不正确", 400);
  }

  const host = parsed.hostname.toLowerCase();
  if (!host.includes("themoviedb.org") && !host.includes("tmdb.org")) {
    throw new AppError("请填写有效的 TMDB 链接", 400);
  }

  return parsed.toString();
}

export async function createRequest(input: CreateRequestInput) {
  const title = (input.title ?? "").trim();
  const type = (input.type ?? "").trim();
  const note = (input.note ?? "").trim();
  const year = parseYear(input.year);
  const tmdbUrl = parseTmdbUrl(input.tmdbUrl);

  if (!title) {
    throw new AppError("片名不能为空", 400);
  }

  if (!isRequestType(type)) {
    throw new AppError("类型必须是电影、电视剧、动漫或纪录片", 400);
  }

  const normalizedTitle = normalizeTitle(title);

  const existing = await prisma.request.findFirst({
    where: {
      type,
      OR: [{ normalized_title: normalizedTitle }, { title: { equals: title, mode: "insensitive" } }]
    }
  });

  if (existing) {
    throw new AppError("该影片已有求片记录，请前往进度页查看处理进度。", 409);
  }

  const created = await prisma.request.create({
    data: {
      title,
      normalized_title: normalizedTitle,
      type,
      year,
      note: note || null,
      tmdb_url: tmdbUrl,
      status: "待处理"
    }
  });

  const telegramConfig = await getTelegramRuntimeConfig();
  if (telegramConfig) {
    await sendNewRequestTelegramNotificationWithConfig(
      {
        id: created.id,
        title: created.title,
        type: created.type,
        year: created.year,
        note: created.note,
        tmdbUrl: created.tmdb_url,
        status: created.status,
        createdAt: created.created_at
      },
      telegramConfig
    );
  }

  return created;
}

export async function listRequests() {
  return prisma.request.findMany({
    orderBy: { created_at: "desc" }
  });
}

export async function updateRequestStatus(idRaw: string, statusRaw: string) {
  const requestId = parseRequestId(idRaw);
  if (!requestId) {
    throw new AppError("无效的记录 ID", 400);
  }

  const status = statusRaw.trim();
  if (!isRequestStatus(status)) {
    throw new AppError("无效状态", 400);
  }

  try {
    return await prisma.request.update({
      where: { id: requestId },
      data: { status: status as RequestStatus }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new AppError("记录不存在", 404);
    }
    throw error;
  }
}

export async function deleteRequestById(idRaw: string) {
  const requestId = parseRequestId(idRaw);
  if (!requestId) {
    throw new AppError("无效的记录 ID", 400);
  }

  try {
    await prisma.request.delete({
      where: { id: requestId }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new AppError("记录不存在", 404);
    }
    throw error;
  }
}
