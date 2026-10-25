import type { Option, Round } from "./types";

export type OptionStat = {
  id: number;
  label: string;
  count: number;
  frequency: number;
  fair: number;
  gap: number;
  isHot: boolean;
  isDue: boolean;
  isPredicted: boolean;
};

export type StatsSummary = {
  total: number;
  rows: OptionStat[];
  hottestIds: number[];
  dueIds: number[];
  predictedIds: number[];
};

export function computeStats(
  options: Option[],
  rounds: Round[],
): StatsSummary {
  const N = options.length;
  const T = rounds.length;
  const fair = N > 0 ? 1 / N : 0;

  const counts = new Map<number, number>();
  for (const o of options) counts.set(o.id, 0);
  for (const round of rounds) {
    const seen = new Set<number>();
    for (const id of round) {
      if (!counts.has(id) || seen.has(id)) continue;
      seen.add(id);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  const lastIndex = new Map<number, number>();
  rounds.forEach((round, idx) => {
    const seen = new Set<number>();
    for (const id of round) {
      if (!counts.has(id) || seen.has(id)) continue;
      seen.add(id);
      lastIndex.set(id, idx);
    }
  });

  const rowsBase = options.map((o) => {
    const count = counts.get(o.id) ?? 0;
    const frequency = T > 0 ? count / T : 0;
    const last = lastIndex.get(o.id);
    const gap = last === undefined ? T : T - 1 - last;
    return {
      id: o.id,
      label: o.label,
      count,
      frequency,
      fair,
      gap,
      isHot: false,
      isDue: false,
      isPredicted: false,
    };
  });

  if (T === 0) {
    return {
      total: 0,
      rows: rowsBase,
      hottestIds: [],
      dueIds: [],
      predictedIds: [],
    };
  }

  const maxFreq = Math.max(...rowsBase.map((r) => r.frequency));
  const maxGap = Math.max(...rowsBase.map((r) => r.gap));
  const hottestIds = rowsBase
    .filter((r) => r.frequency === maxFreq)
    .map((r) => r.id);
  const dueIds = rowsBase.filter((r) => r.gap === maxGap).map((r) => r.id);

  const scores = rowsBase.map((r) => {
    const hotNorm = maxFreq > 0 ? r.frequency / maxFreq : 0;
    const dueNorm = maxGap > 0 ? r.gap / maxGap : 0;
    return hotNorm + dueNorm;
  });
  const maxScore = Math.max(...scores);
  const predictedIds = rowsBase
    .filter((_, i) => scores[i] === maxScore)
    .map((r) => r.id);

  const hotSet = new Set(hottestIds);
  const dueSet = new Set(dueIds);
  const predSet = new Set(predictedIds);
  const rows = rowsBase.map((r) => ({
    ...r,
    isHot: hotSet.has(r.id),
    isDue: dueSet.has(r.id),
    isPredicted: predSet.has(r.id),
  }));

  return { total: T, rows, hottestIds, dueIds, predictedIds };
}
