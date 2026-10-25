"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DiePip } from "@/components/DiePip";
import {
  DIE_FACES,
  diceToOutcomeId,
  diceTotal,
  type DieFace,
} from "@/lib/sic-bo-dice";

type Slot = DieFace | null;

type Props = {
  canUndo: boolean;
  onCommit: (outcomeId: number) => void;
  onUndo: () => void;
};

const COMMIT_HOLD_MS = 280;
const TOAST_MS = 1200;

function nextEmptyFocus(slots: [Slot, Slot, Slot]): 0 | 1 | 2 {
  for (let i = 0; i < 3; i++) {
    if (slots[i] === null) return i as 0 | 1 | 2;
  }
  return 0;
}

function helperLine(slots: [Slot, Slot, Slot], focus: 0 | 1 | 2): string {
  const filled = slots.filter((s) => s !== null).length;
  if (filled === 0) return `選第 ${focus + 1} 顆`;
  if (filled === 1) {
    const a = slots.find((s) => s !== null)!;
    return `預估總點 ${a}+? · 選第 ${focus + 1} 顆`;
  }
  if (filled === 2) {
    const [a, b] = slots.filter((s) => s !== null) as DieFace[];
    return `預估總點 ${a + b}+? · 再選一顆`;
  }
  return "";
}

export function SicBoDicePad({ canUndo, onCommit, onUndo }: Props) {
  const [slots, setSlots] = useState<[Slot, Slot, Slot]>([null, null, null]);
  const [focus, setFocus] = useState<0 | 1 | 2>(0);
  const [toast, setToast] = useState<string | null>(null);
  const [committing, setCommitting] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const clearPending = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setSlots([null, null, null]);
    setFocus(0);
    setCommitting(false);
  }, []);

  const writeFace = useCallback(
    (face: DieFace) => {
      if (committing) return;

      const next: [Slot, Slot, Slot] = [...slots];
      next[focus] = face;

      if (next[0] !== null && next[1] !== null && next[2] !== null) {
        const sum = diceTotal(next[0], next[1], next[2]);
        const outcomeId = diceToOutcomeId(next[0], next[1], next[2]);
        setSlots(next);
        setCommitting(true);
        setToast(`已記入 · 總點 ${sum}`);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
        onCommit(outcomeId);
        holdTimer.current = setTimeout(() => {
          setSlots([null, null, null]);
          setFocus(0);
          setCommitting(false);
          holdTimer.current = null;
        }, COMMIT_HOLD_MS);
        return;
      }

      setSlots(next);
      setFocus(nextEmptyFocus(next));
    },
    [slots, focus, committing, onCommit],
  );

  const filled = slots.filter((s) => s !== null).length;
  const helper = helperLine(slots, focus);

  return (
    <section className="space-y-4 rounded-xl border border-zinc-700 bg-zinc-900 p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-zinc-50">記入骰子</h2>
        <p className="text-sm tabular-nums text-zinc-400" aria-live="polite">
          已選 {filled}/3
        </p>
      </div>

      {toast ? (
        <p
          className="rounded-lg border border-sky-500/50 bg-sky-950 px-3 py-2 text-sm text-sky-100"
          role="status"
          aria-live="polite"
        >
          {toast}
        </p>
      ) : null}

      {/* Three die slots */}
      <div
        className="flex items-center justify-center gap-3"
        role="group"
        aria-label="三顆骰子槽位"
      >
        {([0, 1, 2] as const).map((i) => {
          const selected = slots[i];
          const isFocus = focus === i && !committing;
          return (
            <button
              key={i}
              type="button"
              disabled={committing}
              aria-label={
                selected === null
                  ? `第 ${i + 1} 顆，未選`
                  : `第 ${i + 1} 顆，已選 ${selected}`
              }
              aria-pressed={isFocus}
              className="rounded-xl p-0.5 disabled:opacity-80"
              onClick={() => {
                if (committing) return;
                if (selected !== null) setFocus(i);
                else setFocus(i);
              }}
            >
              <DiePip value={selected} size="slot" focused={isFocus} />
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm tabular-nums text-zinc-400" aria-live="polite">
        {helper}
      </p>

      {/* Shared face palette */}
      <div
        className="flex flex-wrap items-center justify-center gap-2"
        role="group"
        aria-label="骰子點數"
      >
        {DIE_FACES.map((face) => (
          <DiePip
            key={face}
            value={face}
            size="face"
            asButton
            pressed={slots[focus] === face}
            disabled={committing}
            aria-label={`點數 ${face}`}
            onClick={() => writeFace(face)}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="min-h-12 flex-1 rounded-lg border border-zinc-700 px-4 text-base text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:border-zinc-500"
          disabled={committing || !slots.some((s) => s !== null)}
          onClick={clearPending}
        >
          清除未記入
        </button>
        <button
          type="button"
          className="min-h-12 flex-1 rounded-lg border border-zinc-700 px-4 text-base text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:border-zinc-500"
          disabled={!canUndo}
          onClick={onUndo}
        >
          撤銷上一局
        </button>
      </div>
    </section>
  );
}
