import { Suspense } from "react";
import ProgressContent from "./progress-content";

function ProgressPageFallback() {
  return (
    <main className="relative flex min-h-screen items-start justify-center px-4 py-20">
      <div className="w-full max-w-4xl">
        <section className="card-surface">
          <p className="page-kicker">Progress Board</p>
          <h1 className="page-title">公开求片进度</h1>
          <p className="page-desc">正在加载进度页面...</p>
        </section>
      </div>
    </main>
  );
}

export default function ProgressPage() {
  return (
    <Suspense fallback={<ProgressPageFallback />}>
      <ProgressContent />
    </Suspense>
  );
}
