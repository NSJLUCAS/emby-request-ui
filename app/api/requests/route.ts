import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CreateRequestBody = {
  title?: string;
  type?: string;
  year?: number | string | null;
  note?: string;
  tmdbUrl?: string;
};

const allowedTypes = new Set(["电影", "电视剧", "动漫", "纪录片"]);

function normalizeTitle(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateRequestBody;

    const title = (body.title ?? "").trim();
    const normalizedTitle = normalizeTitle(title);
    const type = (body.type ?? "").trim();
    const note = (body.note ?? "").trim();
    const tmdbUrlRaw = (body.tmdbUrl ?? "").trim();
    const yearRaw = body.year;

    if (!title) {
      return NextResponse.json({ error: "片名不能为空" }, { status: 400 });
    }

    if (!allowedTypes.has(type)) {
      return NextResponse.json({ error: "类型必须是电影、电视剧、动漫或纪录片" }, { status: 400 });
    }

    const existing = await prisma.request.findFirst({
      where: {
        type,
        OR: [
          { normalized_title: normalizedTitle },
          { title: { equals: title, mode: "insensitive" } }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: "该影片已有求片记录，请前往进度页查看处理进度。" },
        { status: 409 }
      );
    }

    let year: number | null = null;
    if (typeof yearRaw === "number" && Number.isFinite(yearRaw)) {
      year = Math.trunc(yearRaw);
    } else if (typeof yearRaw === "string" && yearRaw.trim() !== "") {
      const parsed = Number(yearRaw);
      if (!Number.isFinite(parsed)) {
        return NextResponse.json({ error: "年份格式不正确" }, { status: 400 });
      }
      year = Math.trunc(parsed);
    }

    let tmdbUrl: string | null = null;
    if (tmdbUrlRaw) {
      let parsed: URL;
      try {
        parsed = new URL(tmdbUrlRaw);
      } catch {
        return NextResponse.json({ error: "TMDB 链接格式不正确" }, { status: 400 });
      }

      const host = parsed.hostname.toLowerCase();
      if (!host.includes("themoviedb.org") && !host.includes("tmdb.org")) {
        return NextResponse.json({ error: "请填写有效的 TMDB 链接" }, { status: 400 });
      }
      tmdbUrl = parsed.toString();
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

    return NextResponse.json({
      ok: true,
      id: created.id,
      status: created.status
    });
  } catch (error) {
    console.error("Create request failed:", error);
    return NextResponse.json({ error: "提交失败，请稍后重试" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await prisma.request.findMany({
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch requests failed:", error);
    return NextResponse.json({ error: "读取失败，请稍后重试" }, { status: 500 });
  }
}
