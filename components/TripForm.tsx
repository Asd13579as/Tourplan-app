"use client";

import {
  MapPin,
  Navigation,
  CalendarDays,
  Clock,
  Car,
  Bus,
  Footprints,
  Zap,
  Leaf,
  Compass,
} from "lucide-react";
import { TripRequest, Transport, TripStyle } from "@/lib/types";

interface TripFormProps {
  value: TripRequest;
  onChange: (next: TripRequest) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const TRANSPORT_OPTIONS: { value: Transport; label: string; icon: typeof Car }[] = [
  { value: "car", label: "自動車", icon: Car },
  { value: "public", label: "公共交通", icon: Bus },
  { value: "walk", label: "徒歩", icon: Footprints },
];

const STYLE_OPTIONS: { value: TripStyle; label: string; icon: typeof Zap; note: string }[] = [
  { value: "active", label: "アクティブ", icon: Zap, note: "多め・テンポよく巡る" },
  { value: "relaxed", label: "ゆったり", icon: Leaf, note: "少なめ・余裕を持って" },
];

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium tracking-wide text-ink/60">
        <Icon size={14} strokeWidth={2.25} />
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink/35 outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/15";

export default function TripForm({ value, onChange, onSubmit, isLoading }: TripFormProps) {
  const set = <K extends keyof TripRequest>(key: K, v: TripRequest[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex h-full flex-col"
    >
      <div className="flex items-center gap-2 border-b border-line px-5 py-4 lg:px-6">
        <Compass size={18} className="text-forest" strokeWidth={2.25} />
        <h1 className="font-display text-lg font-bold tracking-wide text-ink">旅のしるべ</h1>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 lg:px-6 lg:py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="出発地" icon={MapPin}>
            <input
              className={inputClass}
              placeholder="例：東京駅"
              value={value.origin}
              onChange={(e) => set("origin", e.target.value)}
              required
            />
          </Field>
          <Field label="目的地" icon={Navigation}>
            <input
              className={inputClass}
              placeholder="例：蓼科高原"
              value={value.destination}
              onChange={(e) => set("destination", e.target.value)}
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="日にち" icon={CalendarDays}>
            <input
              type="date"
              className={`${inputClass} font-mono text-[13px]`}
              value={value.date}
              onChange={(e) => set("date", e.target.value)}
              required
            />
          </Field>
          <Field label="出発時刻" icon={Clock}>
            <input
              type="time"
              className={`${inputClass} font-mono text-[13px]`}
              value={value.time}
              onChange={(e) => set("time", e.target.value)}
              required
            />
          </Field>
        </div>

        <div>
          <span className="mb-2 block text-xs font-medium tracking-wide text-ink/60">移動手段</span>
          <div className="grid grid-cols-3 gap-2">
            {TRANSPORT_OPTIONS.map(({ value: v, label, icon: Icon }) => {
              const active = value.transport === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => set("transport", v)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition ${
                    active
                      ? "border-forest bg-forest-light text-forest-dark"
                      : "border-line bg-paper text-ink/60 hover:border-forest/40"
                  }`}
                >
                  <Icon size={18} strokeWidth={2.1} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-xs font-medium tracking-wide text-ink/60">旅のスタイル</span>
          <div className="grid grid-cols-2 gap-2">
            {STYLE_OPTIONS.map(({ value: v, label, icon: Icon, note }) => {
              const active = value.style === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => set("style", v)}
                  aria-pressed={active}
                  className={`rounded-lg border px-3 py-3 text-left transition ${
                    active
                      ? "border-ember bg-ember-light text-ember-dark"
                      : "border-line bg-paper text-ink/60 hover:border-ember/40"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <Icon size={15} strokeWidth={2.1} />
                    {label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-ink/45">{note}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-xs font-medium tracking-wide text-ink/60">
            提案してほしいプラン数
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((n) => {
              const active = value.planCount === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("planCount", n as TripRequest["planCount"])}
                  aria-pressed={active}
                  className={`rounded-lg border py-2.5 font-mono text-sm font-semibold transition ${
                    active
                      ? "border-forest bg-forest-light text-forest-dark"
                      : "border-line bg-paper text-ink/60 hover:border-forest/40"
                  }`}
                >
                  {n}案
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-line px-5 py-4 lg:px-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-ember px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-ember-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "プランを組み立て中…" : "観光プランを作成する"}
        </button>
      </div>
    </form>
  );
}
