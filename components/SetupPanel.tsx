"use client";

import { MAX_OPTIONS, MIN_OPTIONS } from "@/lib/options";
import type { Option } from "@/lib/types";

type Props = {
  options: Option[];
  onChangeN: (n: number) => void;
  onRenameChange: (id: number, label: string) => void;
  onRenameCommit: (id: number, label: string) => void;
};

export function SetupPanel({
  options,
  onChangeN,
  onRenameChange,
  onRenameCommit,
}: Props) {
  const n = options.length;
  const counts = Array.from(
    { length: MAX_OPTIONS - MIN_OPTIONS + 1 },
    (_, i) => MIN_OPTIONS + i,
  );

  return (
    <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-zinc-400" htmlFor="option-count">
          選項數
        </label>
        <select
          id="option-count"
          key={n}
          className="min-h-11 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-base text-zinc-100"
          value={n}
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
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {options.map((o, index) => (
          <li key={o.id} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-center text-xs text-zinc-500">
              {index + 1}
            </span>
            <input
              type="text"
              className="min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-base text-zinc-100 outline-none focus:border-sky-500"
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
