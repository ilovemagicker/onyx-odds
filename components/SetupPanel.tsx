"use client";

import { useState } from "react";
import { MAX_OPTIONS, MIN_OPTIONS } from "@/lib/options";
import { TEMPLATE_PICKER, templateDisplayName } from "@/lib/templates";
import type { Option, TemplateId, TrackMode } from "@/lib/types";

type Props = {
  templateId: TemplateId | null;
  trackMode: TrackMode;
  options: Option[];
  /** When true, start collapsed (sic-bo P0). */
  defaultCollapsed?: boolean;
  onSelectTemplate: (id: TemplateId | null) => void;
  onSelectTrackMode: (mode: TrackMode) => void;
  onChangeN: (n: number) => void;
  onRenameChange: (id: number, label: string) => void;
  onRenameCommit: (id: number, label: string) => void;
};

export function SetupPanel({
  templateId,
  trackMode,
  options,
  defaultCollapsed = false,
  onSelectTemplate,
  onSelectTrackMode,
  onChangeN,
  onRenameChange,
  onRenameCommit,
}: Props) {
  const [open, setOpen] = useState(!defaultCollapsed);
  const n = options.length;
  const counts = Array.from(
    { length: MAX_OPTIONS - MIN_OPTIONS + 1 },
    (_, i) => MIN_OPTIONS + i,
  );
  const canDec = n > MIN_OPTIONS;
  const canInc = n < MAX_OPTIONS;
  const isCustom = templateId === null;
  const gameLabel = templateDisplayName(templateId);

  if (!open && defaultCollapsed) {
    return (
      <section className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
        <p className="text-sm text-zinc-300">
          遊戲：<span className="font-medium text-zinc-50">{gameLabel}</span>
        </p>
        <button
          type="button"
          className="min-h-11 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-300 hover:border-zinc-500"
          onClick={() => setOpen(true)}
        >
          變更
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      {defaultCollapsed ? (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-zinc-300">設定</span>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-400 hover:border-zinc-500"
            onClick={() => setOpen(false)}
          >
            收合
          </button>
        </div>
      ) : null}

      <div className="space-y-2">
        <span className="text-sm text-zinc-400">遊戲</span>
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_PICKER.map((p) => {
            const active = p.id === templateId;
            return (
              <button
                key={String(p.id)}
                type="button"
                className={`min-h-12 rounded-lg border px-3 text-sm ${
                  active
                    ? "border-sky-500 bg-sky-950 text-sky-100"
                    : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500"
                }`}
                aria-pressed={active}
                onClick={() => onSelectTemplate(p.id)}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm text-zinc-400">追蹤模式</span>
        {templateId === "sic-bo" ? (
          <p className="text-sm text-zinc-400">
            骰寶固定為
            <strong className="font-medium text-zinc-200"> 結果（互斥）</strong>
            ：點三顆骰子記入總點，賠率表僅供參考。
          </p>
        ) : (
          <div className="flex flex-wrap gap-2" role="group" aria-label="追蹤模式">
            {(
              [
                ["outcome", "結果（互斥）"],
                ["bet", "注項（可多選）"],
              ] as const
            ).map(([mode, label]) => {
              const active = trackMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  className={`min-h-12 rounded-lg border px-3 text-sm ${
                    active
                      ? "border-sky-500 bg-sky-950 text-sky-100"
                      : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500"
                  }`}
                  aria-pressed={active}
                  onClick={() => onSelectTrackMode(mode)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isCustom ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-zinc-400" id="option-count-label">
            選項數
          </span>
          <div
            className="flex items-center gap-1"
            role="group"
            aria-labelledby="option-count-label"
          >
            <button
              type="button"
              className="flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 text-xl text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="減少選項數"
              disabled={!canDec}
              onClick={() => onChangeN(n - 1)}
            >
              −
            </button>
            <select
              id="option-count"
              key={n}
              className="min-h-12 min-w-[4.5rem] rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-center text-base text-zinc-100"
              value={n}
              aria-label="選項數"
              onChange={(e) => {
                const next = Number(e.target.value);
                if (
                  !Number.isInteger(next) ||
                  next < MIN_OPTIONS ||
                  next > MAX_OPTIONS
                ) {
                  return;
                }
                onChangeN(next);
              }}
            >
              {counts.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 text-xl text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="增加選項數"
              disabled={!canInc}
              onClick={() => onChangeN(n + 1)}
            >
              +
            </button>
          </div>
        </div>
      ) : null}

      <ul className="grid gap-2 sm:grid-cols-2">
        {options.map((o, index) => (
          <li key={o.id} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-center text-xs text-zinc-500">
              {index + 1}
            </span>
            <input
              type="text"
              className="min-h-12 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-base text-zinc-100 outline-none focus:border-sky-500"
              value={o.label}
              aria-label={`選項 ${index + 1} 名稱`}
              onChange={(e) => onRenameChange(o.id, e.target.value)}
              onBlur={(e) => onRenameCommit(o.id, e.target.value)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
