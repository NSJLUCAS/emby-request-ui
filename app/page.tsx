"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function HomePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitting(true);
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      title: String(formData.get("title") ?? ""),
      type: String(formData.get("type") ?? ""),
      year: String(formData.get("year") ?? ""),
      note: String(formData.get("note") ?? ""),
      tmdbUrl: String(formData.get("tmdbUrl") ?? "")
    };

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as {
        error?: string;
        id?: number;
      };

      if (!response.ok || !result.id) {
        setMessage({
          type: "error",
          text: result.error ?? "提交失败，请稍后重试"
        });
        return;
      }

      form.reset();
      setMessage({
        type: "success",
        text: "提交成功，正在跳转进度页面..."
      });
      router.push(`/progress?requestId=${result.id}`);
    } catch {
      setMessage({
        type: "error",
        text: "网络异常，请稍后重试。"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-start justify-center px-4 py-20">
      <div className="w-full max-w-2xl">
        <section className="card-surface">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="page-kicker">Emby Request</p>
              <h1 className="page-title">电影 / 电视剧 / 动漫 / 纪录片 求片</h1>
              <p className="page-desc">提交后会自动跳转到公开进度页，所有人都可查看。</p>
            </div>
            <Link
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:opacity-85"
              href="/progress"
              style={{ borderColor: "var(--field-border)", color: "var(--text-main)" }}
            >
              查看进度页
            </Link>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="field-label" htmlFor="title">
                片名 <span style={{ color: "var(--accent)" }}>*</span>
              </label>
              <input
                className="form-control"
                id="title"
                name="title"
                placeholder="例如：盗梦空间 / Breaking Bad"
                required
                type="text"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="type">
                类型
              </label>
              <select className="form-control" defaultValue="电影" id="type" name="type">
                <option value="电影">电影</option>
                <option value="电视剧">电视剧</option>
                <option value="动漫">动漫</option>
                <option value="纪录片">纪录片</option>
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="year">
                年份（可选）
              </label>
              <input
                className="form-control"
                id="year"
                max={2100}
                min={1888}
                name="year"
                placeholder="例如：2024"
                type="number"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="note">
                备注（可选）
              </label>
              <textarea
                className="form-control min-h-24 resize-y"
                id="note"
                name="note"
                placeholder="例如：希望 1080p 中文字幕版本"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="tmdbUrl">
                TMDB 链接（可选）
              </label>
              <input
                className="form-control"
                id="tmdbUrl"
                name="tmdbUrl"
                placeholder="例如：https://www.themoviedb.org/movie/157336"
                type="url"
              />
            </div>

            <button
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "提交中..." : "提交求片"}
            </button>

            {message && <p className={message.type === "success" ? "alert-success" : "alert-error"}>{message.text}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
