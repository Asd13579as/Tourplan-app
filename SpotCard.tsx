import Image from "next/image";
import { UtensilsCrossed, MapPinned, Info } from "lucide-react";
import { PlanItem } from "@/lib/types";

function formatYen(amount?: number) {
  if (!amount) return null;
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export default function SpotCard({ item }: { item: PlanItem }) {
  const isMeal = item.kind === "meal";
  const isSpot = item.kind === "spot";
  const hasImage = (isSpot || isMeal) && item.imageQuery;

  return (
    <div className="flex gap-3 rounded-xl border border-line bg-paper p-3 shadow-soft sm:gap-4 sm:p-4">
      {hasImage ? (
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-forest-light sm:h-20 sm:w-24">
          <Image
            src={`https://source.unsplash.com/240x240/?${item.imageQuery}`}
            alt={item.title}
            fill
            sizes="96px"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-line/50 text-ink/35 sm:h-20 sm:w-24">
          <Info size={20} strokeWidth={1.8} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink sm:text-[15px]">
            {isMeal && <UtensilsCrossed size={14} className="text-ember shrink-0" strokeWidth={2.2} />}
            {isSpot && <MapPinned size={14} className="text-forest shrink-0" strokeWidth={2.2} />}
            <span className="truncate">{item.title}</span>
          </h3>
          {item.cost ? (
            <span className="shrink-0 font-mono text-xs font-semibold text-ink/55">
              {formatYen(item.cost)}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-ink/55 sm:text-[13px]">
          {item.description}
        </p>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] font-mono text-ink/40">
          {item.durationMin > 0 && <span>滞在 {item.durationMin}分</span>}
          {item.travelFromPrevMin ? <span>移動 {item.travelFromPrevMin}分</span> : null}
        </div>
      </div>
    </div>
  );
}
