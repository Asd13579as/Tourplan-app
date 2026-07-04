import { Flag, MapPin } from "lucide-react";
import { PlanItem } from "@/lib/types";
import SpotCard from "./SpotCard";

export default function Timeline({ items }: { items: PlanItem[] }) {
  return (
    <ol className="relative">
      {items.map((item, idx) => {
        const isEdge = item.kind === "move";
        const isLast = idx === items.length - 1;

        return (
          <li key={item.id} className="relative flex gap-3 sm:gap-4">
            {/* 時刻 */}
            <div className="w-12 flex-shrink-0 pt-1 text-right font-mono text-[11px] font-semibold text-ink/50 sm:w-14 sm:text-xs">
              {item.time}
            </div>

            {/* 登山道風のドット罫線 + マーカー */}
            <div className="relative flex flex-shrink-0 flex-col items-center">
              <span
                className={`z-10 mt-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-mist ${
                  isEdge ? "bg-ink/70" : idx % 2 === 0 ? "bg-forest" : "bg-ember"
                }`}
              >
                {isEdge ? (
                  <Flag size={11} className="text-white" strokeWidth={2.5} />
                ) : (
                  <MapPin size={11} className="text-white" strokeWidth={2.5} />
                )}
              </span>
              {!isLast && <div className="trail-line flex-1" />}
            </div>

            {/* 内容 */}
            <div className={`min-w-0 flex-1 pb-5 ${isLast ? "" : ""}`}>
              {isEdge ? (
                <div className="pt-1">
                  <p className="text-sm font-bold text-ink">{item.title}</p>
                  <p className="text-xs text-ink/50">{item.description}</p>
                </div>
              ) : (
                <SpotCard item={item} />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
