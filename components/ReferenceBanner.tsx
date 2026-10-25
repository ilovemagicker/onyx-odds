"use client";

import type { Option } from "@/lib/types";
import type { StatsSummary } from "@/lib/stats";

type Props = {
  options: Option[];
  stats: StatsSummary;
};

function labelsFor(ids: number[], options: Option[]): string {
  if (ids.length === 0) return "尚無紀錄";
  const map = new Map(options.map((o) => [o.id, o.label]));
  return ids.map((id) => map.get(id) ?? String(id + 1)).join("、");
}

export function ReferenceBanner({ options, stats }: Props) {
  const empty = stats.total === 0;
  return (
    <section className="rounded-xl border border-sky-900/50 bg-sky-950/40 p-4">
      <h2 className="mb-2 text-sm font-medium text-sky-200">下一場參考</h2>
      {empty ? (
        <p className="text-base text-zinc-300">尚無紀錄</p>
      ) : (
        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-400">最熱</dt>
            <dd className="text-lg font-semibold text-rose-300">
              {labelsFor(stats.hottestIds, options)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">該出最久</dt>
            <dd className="text-lg font-semibold text-amber-300">
              {labelsFor(stats.dueIds, options)}
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
}
