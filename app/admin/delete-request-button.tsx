"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteRequestButton({
  requestId,
  title
}: {
  requestId: number;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(`确定删除《${title}》的求片记录吗？此操作不可恢复。`);
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "DELETE"
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(result?.error ?? "删除失败");
        return;
      }

      router.refresh();
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        className="rounded-md border px-2.5 py-1 text-xs transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={busy}
        onClick={handleDelete}
        style={{ borderColor: "rgba(244,63,94,0.45)", color: "#be123c" }}
        type="button"
      >
        {busy ? "删除中..." : "删除"}
      </button>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
