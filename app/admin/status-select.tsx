"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const statusOptions = ["待处理", "已完成", "已拒绝"] as const;
type RequestStatus = (typeof statusOptions)[number];

const statusSelectClassMap: Record<RequestStatus, string> = {
  待处理: "status-pending",
  已完成: "status-completed",
  已拒绝: "status-rejected"
};

function normalizeStatus(status: string): RequestStatus {
  if (statusOptions.includes(status as RequestStatus)) {
    return status as RequestStatus;
  }
  return "待处理";
}

export default function StatusSelect({
  requestId,
  initialStatus
}: {
  requestId: number;
  initialStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<RequestStatus>(normalizeStatus(initialStatus));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = async (nextStatus: RequestStatus) => {
    const previous = status;
    setStatus(nextStatus);
    setError(null);

    try {
      const response = await fetch(`/api/requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setStatus(previous);
        setError(result?.error ?? "更新失败，请重试");
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setStatus(previous);
      setError("网络异常，请稍后重试");
    }
  };

  return (
    <div>
      <select
        className={`status-select ${statusSelectClassMap[status]}`}
        disabled={isPending}
        onChange={(event) => handleChange(event.target.value as RequestStatus)}
        value={status}
      >
        {statusOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
    </div>
  );
}
