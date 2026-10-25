"use client";

import type { Option } from "@/lib/types";

type Props = {
  options: Option[];
  canUndo: boolean;
  onPick: (id: number) => void;
  onUndo: () => void;
};

export function ResultButtons({ options, canUndo, onPick, onUndo }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className="min-h-12 min-w-[4.5rem] flex-1 rounded-xl border border-zinc-600 bg-zinc-800 px-4 text-base font-medium text-zinc-50 active:scale-[0.98] hover:border-sky-500 hover:bg-zinc-700"
            onClick={() => onPick(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="min-h-11 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:border-zinc-500"
        disabled={!canUndo}
        onClick={onUndo}
      >
        撤銷上一筆
      </button>
    </section>
  );
}
