"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type RequestItem = {
  id: number;
  title: string;
  type: string;
  year: number | null;
  note: string | null;
  tmdb_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

const progressMap: Record<string, number> = {
  待处理: 35,
  已完成: 100,
  已拒绝: 100
};

const statusToneMap: Record<string, string> = {
  待处理: "status-pending",
  已完成: "status-completed",
  已拒绝: "status-rejected"
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

export default function ProgressContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<RequestItem[]>([]);

  const highlightId = useMemo(() => {
    const raw = searchParams.get("requestId");
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isInteger(parsed) ? parsed : null;
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/requests");
        const result = (await response.json()) as { error?: string } | RequestItem[];

        if (!response.ok || !Array.isArray(result)) {
          const message = !Array.isArray(result) && result.error ? result.error : "读取进度失败";
          setError(message);
          return;
        }

        setRecords(result);
      } catch {
        setError("网络异常，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <main className="relative flex min-h-screen items-start justify-center px-4 py-20">
      <div className="w-full max-w-4xl space-y-6">
        <section className="card-surface">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="page-kicker">Progress Board</p>
              <h1 className="page-title">公开求片进度</h1>
              <p className="page-desc">所有求片进度均可公开查看，状态变更会实时更新。</p>
            </div>
            <Link
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:opacity-85"
              href="/"
              style={{ borderColor: "var(--field-border)", color: "var(--text-main)" }}
            >
              返回求片页
            </Link>
          </div>
        </section>

        <section className="card-surface">
          {loading && <p className="page-desc">加载中...</p>}
          {error && <p className="alert-error">{error}</p>}
          {!loading && !error && records.length === 0 && <p className="page-desc">当前暂无求片记录。</p>}

          {!loading && !error && records.length > 0 && (
            <div className="space-y-4">
              {records.map((item) => {
                const progress = progressMap[item.status] ?? 20;
                const toneClass = statusToneMap[item.status] ?? "status-pending";
                const isHighlighted = highlightId === item.id;

                return (
                  <article
                    className="rounded-xl border p-4 transition"
                    key={item.id}
                    style={{
                      borderColor: isHighlighted ? "var(--accent)" : "var(--surface-border)",
                      boxShadow: isHighlighted ? "0 0 0 2px var(--focus-ring)" : "none"
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold">{item.title}</h2>
                        <p className="page-desc">
                          {item.type}
                          {item.year ? ` · ${item.year}` : ""}
                        </p>
                      </div>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-300/30">
                      <div
                        className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mb-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      当前进度：{progress}%
                    </p>

                    <div className="grid gap-1 text-sm" style={{ color: "var(--text-muted)" }}>
                      <p>提交时间：{formatDate(item.created_at)}</p>
                      <p>最近更新时间：{formatDate(item.updated_at)}</p>
                      {item.tmdb_url && (
                        <p>
                          TMDB：
                          <a
                            className="ml-1 underline"
                            href={item.tmdb_url}
                            rel="noreferrer"
                            style={{ color: "var(--accent)" }}
                            target="_blank"
                          >
                            查看链接
                          </a>
                        </p>
                      )}
                      {item.note && <p>备注：{item.note}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="flex justify-center">
          <Link
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:opacity-85"
            href="/"
            style={{ borderColor: "var(--field-border)", color: "var(--text-main)" }}
          >
            返回求片首页
          </Link>
        </div>
      </div>
    </main>
  );
}
