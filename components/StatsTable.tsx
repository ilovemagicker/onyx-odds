"use client";

import type { StatsSummary } from "@/lib/stats";

type Props = {
  stats: StatsSummary;
};

function pct(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

export function StatsTable({ stats }: Props) {
  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-zinc-400">統計</h2>
        <span className="text-xs text-zinc-500">總局數 {stats.total}</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="stats-table w-full min-w-[28rem] text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-3 py-2 font-medium">標籤</th>
              <th className="px-3 py-2 font-medium">次數</th>
              <th className="px-3 py-2 font-medium">頻率</th>
              <th className="px-3 py-2 font-medium">公平</th>
              <th className="px-3 py-2 font-medium">距上次</th>
              <th className="px-3 py-2 font-medium">標記</th>
            </tr>
          </thead>
          <tbody>
            {stats.rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-zinc-800 odd:bg-zinc-950/40"
              >
                <td className="px-3 py-2 font-medium text-zinc-100">
                  {row.label}
                </td>
                <td className="px-3 py-2 tabular-nums">{row.count}</td>
                <td className="px-3 py-2 tabular-nums">
                  {stats.total === 0 ? "—" : pct(row.frequency)}
                </td>
                <td className="px-3 py-2 tabular-nums text-zinc-400">
                  {pct(row.fair)}
                </td>
                <td className="px-3 py-2 tabular-nums">{row.gap}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex flex-wrap gap-1">
                    {row.isHot ? (
                      <span className="badge-hot rounded-full bg-rose-900/70 px-2 py-0.5 text-xs text-rose-200">
                        Hot
                      </span>
                    ) : null}
                    {row.isDue ? (
                      <span className="badge-due rounded-full bg-amber-900/70 px-2 py-0.5 text-xs text-amber-200">
                        Due
                      </span>
                    ) : null}
                    {!row.isHot && !row.isDue ? (
                      <span className="text-zinc-600">—</span>
                    ) : null}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
