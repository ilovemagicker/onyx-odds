"use client";

import type { Option } from "@/lib/types";

type Props = {
  options: Option[];
  results: number[];
};

export function Road({ options, results }: Props) {
  const map = new Map(options.map((o) => [o.id, o.label]));

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium text-zinc-400">路單</h2>
      {results.length === 0 ? (
        <p className="text-sm text-zinc-500">尚無結果</p>
      ) : (
        <div className="road-scroll flex gap-2 overflow-x-auto pb-1">
          {results.map((id, i) => (
            <span
              key={`${i}-${id}`}
              className="road-chip inline-flex min-h-9 shrink-0 items-center rounded-full border border-zinc-600 bg-zinc-800 px-3 text-sm text-zinc-100"
            >
              {map.get(id) ?? String(id + 1)}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
