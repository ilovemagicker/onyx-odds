"use client";

import { useEffect, useMemo, useState } from "react";
import type { Option, PayoutRow } from "@/lib/types";
import type { StatsSummary } from "@/lib/stats";

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

function defaultRowIndex(rows: PayoutRow[]): number {
  const withProb = rows.findIndex(
    (r) => r.probability != null && r.probability.length > 0,
  );
  return withProb >= 0 ? withProb : 0;
}

function rowsKey(rows: PayoutRow[]): string {
  return rows.map((r) => r.label).join("\0");
}

export function ReferenceBanner({
  options,
  stats,
  payoutRows = null,
}: Props) {
  const empty = stats.total === 0;
  const hasPayout =
    Array.isArray(payoutRows) && payoutRows.length > 0 ? payoutRows : null;

  const key = useMemo(
    () => (hasPayout ? rowsKey(hasPayout) : ""),
    [hasPayout],
  );

  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!hasPayout) {
      setSelected(0);
      return;
    }
    setSelected(defaultRowIndex(hasPayout));
    // Reset when template payout label set changes (key), not on every parent re-render.
  }, [key, hasPayout]);

  const row =
    hasPayout && selected >= 0 && selected < hasPayout.length
      ? hasPayout[selected]
      : null;

  return (
    <section className="rounded-xl border border-sky-900/50 bg-sky-950/40 p-4">
      <h2 className="mb-2 text-sm font-medium text-sky-200">下一場參考</h2>
      {empty ? (
        <div className="space-y-1">
          <p className="text-base font-medium text-zinc-200">尚無紀錄</p>
          <p className="text-sm text-zinc-500">
            記入結果或貼上後，會顯示預測、最熱與該出最久
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

      {hasPayout && row ? (
        <div className="mt-4 space-y-2 border-t border-sky-900/40 pt-3">
          <label className="block text-xs text-zinc-400" htmlFor="ref-payout-select">
            倍率
          </label>
          <select
            id="ref-payout-select"
            className="min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
          >
            {hasPayout.map((r, i) => (
              <option key={`${r.label}-${i}`} value={i}>
                {r.label}
              </option>
            ))}
          </select>
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <dt className="text-xs text-zinc-500">賠率</dt>
              <dd className="font-medium tabular-nums text-zinc-100">
                {cell(row.payout)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">理論機率</dt>
              <dd className="font-medium tabular-nums text-sky-200">
                {cell(row.probability)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">莊家優勢</dt>
              <dd className="font-medium tabular-nums text-zinc-300">
                {cell(row.houseEdge)}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </section>
  );
}
