"use client";

import type { Option, Round } from "@/lib/types";

type Props = {
  options: Option[];
  rounds: Round[];
};

export function Road({ options, rounds }: Props) {
  const map = new Map(options.map((o) => [o.id, o.label]));

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium text-zinc-400">路單</h2>
      {rounds.length === 0 ? (
        <p className="text-sm text-zinc-500">尚無結果</p>
      ) : (
        <div className="road-scroll flex gap-2 overflow-x-auto pb-1">
          {rounds.map((round, i) => (
            <div
              key={`${i}-${round.join("-")}`}
              className="inline-flex shrink-0 items-center gap-1 rounded-2xl border border-zinc-600 bg-zinc-900/80 p-1"
            >
              {round.map((id, j) => (
                <span
                  key={`${i}-${j}-${id}`}
                  className="road-chip inline-flex min-h-9 items-center rounded-full border border-zinc-600 bg-zinc-800 px-3 text-sm text-zinc-100"
                >
                  {map.get(id) ?? String(id + 1)}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
