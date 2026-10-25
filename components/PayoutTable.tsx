"use client";

import type { PayoutRow } from "@/lib/types";

type Props = { rows: PayoutRow[] | null };

function cell(v: string | undefined): string {
  return v && v.length > 0 ? v : "—";
}

export function PayoutTable({ rows }: Props) {
  if (rows === null) {
    return (
      <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-sm font-medium text-zinc-400">賠率表</h2>
        <p className="text-sm text-zinc-500">自訂模式無內建賠率表</p>
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-zinc-400">賠率表</h2>
        <span className="text-xs text-zinc-500">常見規則／僅供參考</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-3 py-2 font-medium">注項</th>
              <th className="px-3 py-2 font-medium">賠率</th>
              <th className="px-3 py-2 font-medium">理論機率</th>
              <th className="px-3 py-2 font-medium">莊家優勢</th>
              <th className="px-3 py-2 font-medium">備註</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.label}-${row.payout}`}
                className="border-t border-zinc-800 odd:bg-zinc-950/40"
              >
                <td className="px-3 py-2 font-medium text-zinc-100">
                  {row.label}
                </td>
                <td className="px-3 py-2 tabular-nums">{row.payout}</td>
                <td className="px-3 py-2 tabular-nums">
                  {cell(row.probability)}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {cell(row.houseEdge)}
                </td>
                <td className="px-3 py-2 text-zinc-400">{cell(row.note)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
