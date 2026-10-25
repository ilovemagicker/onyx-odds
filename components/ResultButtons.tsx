"use client";

import type { Option, TrackMode } from "@/lib/types";

type Props = {
  options: Option[];
  trackMode: TrackMode;
  pendingIds: number[];
  canUndo: boolean;
  onPickOutcome: (id: number) => void;
  onToggleBet: (id: number) => void;
  onCommitBet: () => void;
  onUndo: () => void;
};

export function ResultButtons({
  options,
  trackMode,
  pendingIds,
  canUndo,
  onPickOutcome,
  onToggleBet,
  onCommitBet,
  onUndo,
}: Props) {
  const pending = new Set(pendingIds);
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-zinc-400">
        {trackMode === "bet" ? "選擇注項" : "記錄結果"}
      </h2>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = pending.has(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={trackMode === "bet" ? selected : undefined}
              className={`min-h-12 min-w-[4.5rem] flex-1 rounded-xl border px-4 text-base font-medium active:scale-[0.98] ${
                trackMode === "bet" && selected
                  ? "border-sky-400 bg-sky-900 text-sky-50"
                  : "border-zinc-600 bg-zinc-800 text-zinc-50 hover:border-sky-500 hover:bg-zinc-700"
              }`}
              onClick={() =>
                trackMode === "bet"
                  ? onToggleBet(o.id)
                  : onPickOutcome(o.id)
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {trackMode === "bet" ? (
          <button
            type="button"
            className="min-h-12 rounded-lg bg-sky-600 px-4 text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-sky-500"
            disabled={pendingIds.length === 0}
            onClick={onCommitBet}
          >
            記入本局
          </button>
        ) : null}
        <button
          type="button"
          className="min-h-12 rounded-lg border border-zinc-700 px-4 text-base text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:border-zinc-500"
          disabled={!canUndo}
          onClick={onUndo}
        >
          撤銷上一局
        </button>
      </div>
    </section>
  );
}
