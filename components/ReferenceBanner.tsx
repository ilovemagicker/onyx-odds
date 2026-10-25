"use client";

import { useMemo } from "react";
import type { Option, PayoutRow } from "@/lib/types";
import type { StatsSummary } from "@/lib/stats";
import { suggestBuys } from "@/lib/suggest-buys";

type Props = {
  options: Option[];
  stats: StatsSummary;
  payoutRows?: PayoutRow[] | null;
};

function labelsFor(ids: number[], options: Option[]): string {
  if (ids.length === 0) return "尚無紀錄";
  const map = new Map(options.map((o) => [o.id, o.label]));
  return ids.map((id) => map.get(id) ?? String(id + 1)).join("、");
}

function cell(v: string | undefined): string {
  return v && v.length > 0 ? v : "—";
}

export function ReferenceBanner({
  options,
  stats,
  payoutRows = null,
}: Props) {
  const empty = stats.total === 0;
  const hasPayout =
    Array.isArray(payoutRows) && payoutRows.length > 0 ? payoutRows : null;

  const buys = useMemo(
    () =>
      suggestBuys({
        options,
        predictedIds: stats.predictedIds,
        payoutRows: hasPayout,
      }),
    [options, stats.predictedIds, hasPayout],
  );

  const buyLabelSet = useMemo(
    () => new Set(buys.map((b) => b.label)),
    [buys],
  );

  return (
    <section className="rounded-xl border border-sky-900/50 bg-sky-950/40 p-4">
      <h2 className="mb-2 text-sm font-medium text-sky-200">下一場參考</h2>
      {empty ? (
        <div className="space-y-1">
          <p className="text-base font-medium text-zinc-200">尚無紀錄</p>
          <p className="text-sm text-zinc-500">
            記入結果或貼上後，會顯示應該買、最熱與該出最久（參考／非保證）
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-zinc-400">應該買</p>
            <p className="text-[10px] text-zinc-500">綜合最熱＋該出 · 參考／非保證</p>
            {buys.length === 0 ? (
              <p className="mt-1 text-lg font-semibold text-zinc-400">—</p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-2">
                {buys.map((b) => (
                  <li
                    key={b.label}
                    className="rounded-lg border border-amber-500/40 bg-amber-950/50 px-3 py-2"
                  >
                    <p className="text-xl font-bold tracking-tight text-amber-200">
                      {b.label}
                    </p>
                    <p className="mt-0.5 text-xs tabular-nums text-zinc-300">
                      {b.payout || b.probability ? (
                        <>
                          {b.payout ? (
                            <span>賠率 {b.payout}</span>
                          ) : null}
                          {b.payout && b.probability ? (
                            <span className="text-zinc-600"> · </span>
                          ) : null}
                          {b.probability ? (
                            <span className="text-sky-300">
                              理論機率 {b.probability}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-zinc-500">倍率見下表</span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-zinc-400">最熱</dt>
              <dd className="text-base font-semibold text-rose-300">
                {labelsFor(stats.hottestIds, options)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400">該出最久</dt>
              <dd className="text-base font-semibold text-amber-300">
                {labelsFor(stats.dueIds, options)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {hasPayout ? (
        <div className="mt-4 space-y-2 border-t border-sky-900/40 pt-3">
          <p className="text-xs text-zinc-400">倍率</p>
          <div className="max-h-56 overflow-y-auto overflow-x-auto rounded-lg border border-sky-900/40">
            <table className="w-full min-w-[18rem] text-left text-xs">
              <thead className="sticky top-0 bg-sky-950 text-zinc-500">
                <tr>
                  <th className="px-2 py-1.5 font-medium">注項</th>
                  <th className="px-2 py-1.5 font-medium">賠率</th>
                  <th className="px-2 py-1.5 font-medium">理論機率</th>
                  <th className="px-2 py-1.5 font-medium">莊家優勢</th>
                </tr>
              </thead>
              <tbody>
                {hasPayout.map((row, i) => {
                  const highlighted = buyLabelSet.has(row.label);
                  return (
                    <tr
                      key={`${row.label}-${i}`}
                      className={
                        highlighted
                          ? "border-t border-amber-500/30 bg-amber-950/40"
                          : "border-t border-sky-900/30 odd:bg-sky-950/30"
                      }
                    >
                      <td
                        className={
                          highlighted
                            ? "px-2 py-1.5 font-semibold text-amber-200"
                            : "px-2 py-1.5 font-medium text-zinc-100"
                        }
                      >
                        {row.label}
                        {highlighted ? (
                          <span className="ml-1 text-[10px] font-normal text-amber-400/80">
                            應該買
                          </span>
                        ) : null}
                      </td>
                      <td className="px-2 py-1.5 tabular-nums text-zinc-100">
                        {cell(row.payout)}
                      </td>
                      <td className="px-2 py-1.5 tabular-nums text-sky-200">
                        {cell(row.probability)}
                      </td>
                      <td className="px-2 py-1.5 tabular-nums text-zinc-300">
                        {cell(row.houseEdge)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
