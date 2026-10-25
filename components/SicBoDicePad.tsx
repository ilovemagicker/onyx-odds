"use client";

import { useCallback, useState } from "react";
import {
  DIE_FACES,
  diceToOutcomeId,
  type DieFace,
} from "@/lib/sic-bo-dice";

type Slot = DieFace | null;

type Props = {
  canUndo: boolean;
  onCommit: (outcomeId: number) => void;
  onUndo: () => void;
};

const SLOT_LABELS = ["第1顆", "第2顆", "第3顆"] as const;

export function SicBoDicePad({ canUndo, onCommit, onUndo }: Props) {
  const [slots, setSlots] = useState<[Slot, Slot, Slot]>([null, null, null]);

  const setFace = useCallback(
    (index: 0 | 1 | 2, face: DieFace) => {
      const next: [Slot, Slot, Slot] = [...slots];
      next[index] = face;
      if (next[0] !== null && next[1] !== null && next[2] !== null) {
        onCommit(diceToOutcomeId(next[0], next[1], next[2]));
        setSlots([null, null, null]);
        return;
      }
      setSlots(next);
    },
    [slots, onCommit],
  );

  const filled = slots.filter((s) => s !== null).length;
  const pendingLabel = slots
    .map((s) => (s === null ? "—" : String(s)))
    .join(" · ");

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-zinc-400">點三顆骰子記入</h2>
        <p className="text-xs text-zinc-500" aria-live="polite">
          {filled === 0 ? "尚未選擇" : `已選 ${filled}/3 · ${pendingLabel}`}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {SLOT_LABELS.map((label, i) => {
          const index = i as 0 | 1 | 2;
          const selected = slots[index];
          return (
            <div
              key={label}
              className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-300">{label}</span>
                <span
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg border text-lg font-semibold ${
                    selected !== null
                      ? "border-sky-400 bg-sky-950 text-sky-100"
                      : "border-zinc-700 bg-zinc-950 text-zinc-600"
                  }`}
                >
                  {selected ?? "—"}
                </span>
              </div>
              <div
                className="grid grid-cols-3 gap-1.5"
                role="group"
                aria-label={label}
              >
                {DIE_FACES.map((face) => {
                  const active = selected === face;
                  return (
                    <button
                      key={face}
                      type="button"
                      aria-pressed={active}
                      aria-label={`${label} 點 ${face}`}
                      className={`min-h-12 rounded-xl border text-lg font-semibold active:scale-[0.97] ${
                        active
                          ? "border-sky-400 bg-sky-900 text-sky-50"
                          : "border-zinc-600 bg-zinc-800 text-zinc-50 hover:border-sky-500 hover:bg-zinc-700"
                      }`}
                      onClick={() => setFace(index, face)}
                    >
                      {face}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-12 rounded-lg border border-zinc-700 px-4 text-base text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:border-zinc-500"
          disabled={!slots.some((s) => s !== null)}
          onClick={() => setSlots([null, null, null])}
        >
          清除未記入
        </button>
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
