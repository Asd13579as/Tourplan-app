"use client";

import { useState } from "react";
import { ClipboardList, MapPinned, TriangleAlert } from "lucide-react";
import TripForm from "@/components/TripForm";
import PlanTabs from "@/components/PlanTabs";
import { emptyTripRequest, GeneratePlansState, TripRequest } from "@/lib/types";
import { generatePlans } from "@/lib/mockPlanGenerator";

type MobileView = "form" | "result";

export default function Home() {
  const [tripRequest, setTripRequest] = useState<TripRequest>(emptyTripRequest);
  const [planState, setPlanState] = useState<GeneratePlansState>({
    status: "idle",
    proposals: [],
  });
  const [mobileView, setMobileView] = useState<MobileView>("form");

  async function handleSubmit() {
    setPlanState((prev) => ({ ...prev, status: "loading" }));
    try {
      const proposals = await generatePlans(tripRequest);
      setPlanState({ status: "success", proposals });
      setMobileView("result"); // モバイルでは生成後に結果画面へスムーズに切り替え
    } catch (err) {
      setPlanState({
        status: "error",
        proposals: [],
        errorMessage: "プランの生成に失敗しました。時間をおいて再度お試しください。",
      });
    }
  }

  const hasResult = planState.status === "success" && planState.proposals.length > 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
      {/* モバイル専用：入力／結果 切り替えタブ */}
      <div className="sticky top-0 z-20 flex border-b border-line bg-paper lg:hidden">
        <button
          onClick={() => setMobileView("form")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-semibold transition ${
            mobileView === "form" ? "border-b-2 border-forest text-forest-dark" : "text-ink/45"
          }`}
        >
          <ClipboardList size={16} />
          条件入力
        </button>
        <button
          onClick={() => setMobileView("result")}
          disabled={!hasResult}
          className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-semibold transition disabled:opacity-35 ${
            mobileView === "result" ? "border-b-2 border-forest text-forest-dark" : "text-ink/45"
          }`}
        >
          <MapPinned size={16} />
          プラン結果
        </button>
      </div>

      {/* 左カラム：条件入力フォーム */}
      <section
        className={`w-full flex-shrink-0 border-line bg-paper lg:h-full lg:w-[400px] lg:overflow-y-auto lg:border-r ${
          mobileView === "form" ? "block" : "hidden"
        } lg:block`}
      >
        <TripForm
          value={tripRequest}
          onChange={setTripRequest}
          onSubmit={handleSubmit}
          isLoading={planState.status === "loading"}
        />
      </section>

      {/* 右カラム：観光プラン結果（タイムライン） */}
      <section
        className={`min-w-0 flex-1 lg:h-full lg:overflow-y-auto ${
          mobileView === "result" ? "block" : "hidden"
        } lg:block`}
      >
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {planState.status === "idle" && (
            <EmptyState message="左のフォームに条件を入力して「観光プランを作成する」を押してください。" />
          )}

          {planState.status === "loading" && <LoadingState />}

          {planState.status === "error" && (
            <div className="flex items-start gap-2 rounded-lg border border-ember/30 bg-ember-light px-4 py-3 text-sm text-ember-dark">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              {planState.errorMessage}
            </div>
          )}

          {hasResult && (
            <>
              <h2 className="mb-1 font-display text-xl font-bold text-ink">
                {tripRequest.origin || "出発地"} → {tripRequest.destination || "目的地"}
              </h2>
              <p className="mb-5 font-mono text-xs text-ink/45">
                {tripRequest.date || "日付未設定"} ・ {tripRequest.time} 出発
              </p>
              <PlanTabs proposals={planState.proposals} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-paper/60 px-6 py-16 text-center">
      <MapPinned size={28} className="text-forest/50" strokeWidth={1.6} />
      <p className="max-w-xs text-sm text-ink/45">{message}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl border border-line bg-paper/70"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
      <p className="pt-2 text-center text-xs text-ink/40">プランを組み立てています…</p>
    </div>
  );
}
