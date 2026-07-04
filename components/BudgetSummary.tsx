import { Wallet } from "lucide-react";
import { TravelPlan } from "@/lib/types";

export default function BudgetSummary({ plan }: { plan: TravelPlan }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4 shadow-soft sm:p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-ink/55">
          <Wallet size={15} className="text-forest" strokeWidth={2.2} />
          概算予算（1名あたり）
        </div>
        <span className="font-mono text-xl font-bold text-ink sm:text-2xl">
          ¥{plan.budgetTotal.toLocaleString("ja-JP")}
        </span>
      </div>

      <dl className="mt-3 space-y-1.5 border-t border-dashed border-line pt-3">
        {plan.budgetBreakdown.map((b) => (
          <div key={b.label} className="flex items-center justify-between text-xs text-ink/60">
            <dt>{b.label}</dt>
            <dd className="font-mono">¥{b.amount.toLocaleString("ja-JP")}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
