import type { Option, PayoutRow } from "./types";

export type BuySuggestion = {
  label: string;
  payout?: string;
  probability?: string;
  houseEdge?: string;
  reason?: string;
};

function expandLabel(label: string): string[] {
  if (/^\d+$/.test(label)) {
    const n = Number(label);
    if (n >= 3 && n <= 18) {
      const out: string[] = [`總點${n}`];
      if (n >= 4 && n <= 10) out.push("小");
      else if (n >= 11 && n <= 17) out.push("大");
      if (n % 2 === 1) out.push("單");
      else out.push("雙");
      return out;
    }
  }
  return [label];
}

/** Sort key: exact total → 大/小 → 單/雙 → others. */
function category(label: string): number {
  if (/^總點\d+$/.test(label)) return 0;
  if (label === "大" || label === "小") return 1;
  if (label === "單" || label === "雙") return 2;
  return 3;
}

/**
 * Map predicted outcome options to buyable casino bet names.
 * Recommendation = current predictedIds (hotNorm + dueNorm), framed as 應該買.
 */
export function suggestBuys({
  options,
  predictedIds,
  payoutRows,
}: {
  options: Option[];
  predictedIds: number[];
  payoutRows?: PayoutRow[] | null;
}): BuySuggestion[] {
  if (predictedIds.length === 0) return [];

  const labelById = new Map(options.map((o) => [o.id, o.label]));
  const expanded: string[] = [];
  for (const id of predictedIds) {
    const optionLabel = labelById.get(id) ?? String(id + 1);
    for (const buy of expandLabel(optionLabel)) {
      expanded.push(buy);
    }
  }

  const seen = new Set<string>();
  const unique: { label: string; i: number }[] = [];
  for (let i = 0; i < expanded.length; i++) {
    const label = expanded[i];
    if (seen.has(label)) continue;
    seen.add(label);
    unique.push({ label, i });
  }

  unique.sort((a, b) => {
    const ca = category(a.label);
    const cb = category(b.label);
    if (ca !== cb) return ca - cb;
    return a.i - b.i;
  });

  const payoutMap = new Map(
    (payoutRows ?? []).map((r) => [r.label, r] as const),
  );

  return unique.map(({ label }) => {
    const row = payoutMap.get(label);
    return {
      label,
      payout: row?.payout,
      probability: row?.probability,
      houseEdge: row?.houseEdge,
      reason: "綜合最熱＋該出",
    };
  });
}
