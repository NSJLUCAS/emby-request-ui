import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import AdminNav from "./admin-nav";
import { prisma } from "@/lib/prisma";
import DeleteRequestButton from "./delete-request-button";
import StatusSelect from "./status-select";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAuthenticatedAdmin();
  if (!session) {
    redirect("/admin/login");
  }

  let requests: Awaited<ReturnType<typeof prisma.request.findMany>> = [];
  let loadError: string | null = null;

  try {
    requests = await prisma.request.findMany({
      orderBy: { created_at: "desc" }
    });
  } catch (error) {
    console.error("Load admin requests failed:", error);
    loadError = "数据库读取失败，请检查 DATABASE_URL 和 PostgreSQL 服务是否可用。";
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card-surface w-full max-w-4xl">
        <div className="mb-6 border-b pb-4" style={{ borderColor: "var(--surface-border)" }}>
          <p className="page-kicker">Admin Panel</p>
          <h1 className="page-title">求片列表</h1>
          <p className="page-desc">数据来自 PostgreSQL（Prisma）。</p>
        </div>

        <AdminNav current="requests" />
        <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
          当前管理员：<span className="font-semibold" style={{ color: "var(--text-main)" }}>{session.username}</span>
        </p>

        {loadError && (
          <p className="alert-error mb-4">
            {loadError}
          </p>
        )}

        <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--surface-border)" }}>
          <table className="w-full text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3 text-left font-medium">片名</th>
                <th className="px-4 py-3 text-left font-medium">类型</th>
                <th className="px-4 py-3 text-left font-medium">TMDB</th>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">操作</th>
                <th className="px-4 py-3 text-left font-medium">提交时间</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr className="table-row">
                  <td className="px-4 py-8 text-center" colSpan={6} style={{ color: "var(--text-muted)" }}>
                    暂无求片记录
                  </td>
                </tr>
              )}

              {requests.map((item) => (
                <tr className="table-row" key={item.id}>
                  <td className="px-4 py-3" style={{ color: "var(--text-main)" }}>{item.title}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-soft)" }}>{item.type}</td>
                  <td className="px-4 py-3">
                    {item.tmdb_url ? (
                      <a
                        className="text-sm underline"
                        href={item.tmdb_url}
                        rel="noreferrer"
                        style={{ color: "var(--accent)" }}
                        target="_blank"
                      >
                        查看
                      </a>
                    ) : (
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                        -
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusSelect initialStatus={item.status} requestId={item.id} />
                  </td>
                  <td className="px-4 py-3">
                    <DeleteRequestButton requestId={item.id} title={item.title} />
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>
                    {item.created_at.toLocaleString("zh-CN", {
                      hour12: false
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
