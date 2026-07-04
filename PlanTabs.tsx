"use client";

import { useState } from "react";
import { Sun, CloudRain } from "lucide-react";
import { PlanProposal, Weather } from "@/lib/types";
import Timeline from "./Timeline";
import BudgetSummary from "./BudgetSummary";

export default function PlanTabs({ proposals }: { proposals: PlanProposal[] }) {
  const [activeProposalId, setActiveProposalId] = useState(proposals[0]?.id);
  const [weather, setWeather] = useState<Weather>("sunny");

  const activeProposal =
    proposals.find((p) => p.id === activeProposalId) ?? proposals[0];

  if (!activeProposal) return null;

  const activePlan = activeProposal.variants[weather];

  return (
    <div>
      {/* プランA/B/C 切り替え（複数案の場合のみ表示） */}
      {proposals.length > 1 && (
        <div
          role="tablist"
          aria-label="提案プランの切り替え"
          className="mb-4 flex gap-1.5 overflow-x-auto"
        >
          {proposals.map((p) => {
            const active = p.id === activeProposal.id;
            return (
              <button
                key={p.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveProposalId(p.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-ink text-white"
                    : "bg-paper text-ink/55 ring-1 ring-line hover:text-ink"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 晴れ／雨 バージョン切り替え */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-ink/60">{activePlan.summary}</p>
        <div
          role="tablist"
          aria-label="天候バージョンの切り替え"
          className="flex shrink-0 rounded-full bg-line/50 p-1"
        >
          <button
            role="tab"
            aria-selected={weather === "sunny"}
            onClick={() => setWeather("sunny")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              weather === "sunny" ? "bg-sunny text-white shadow-soft" : "text-ink/50"
            }`}
          >
            <Sun size={14} strokeWidth={2.2} />
            晴れ
          </button>
          <button
            role="tab"
            aria-selected={weather === "rainy"}
            onClick={() => setWeather("rainy")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              weather === "rainy" ? "bg-rainy text-white shadow-soft" : "text-ink/50"
            }`}
          >
            <CloudRain size={14} strokeWidth={2.2} />
            雨
          </button>
        </div>
      </div>

      <div className="mb-5">
        <BudgetSummary plan={activePlan} />
      </div>

      <Timeline items={activePlan.items} />
    </div>
  );
}
