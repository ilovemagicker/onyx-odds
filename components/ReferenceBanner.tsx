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
        <div className="space-y-1">
          <p className="text-base font-medium text-zinc-200">尚無紀錄</p>
          <p className="text-sm text-zinc-500">
            點選下方選項或貼上結果後，會顯示預測、最熱與該出最久
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-zinc-400">預測下一場</p>
            <p className="text-2xl font-bold tracking-tight text-sky-300">
              {labelsFor(stats.predictedIds, options)}
            </p>
          </div>
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
        </div>
      )}
    </section>
  );
}
