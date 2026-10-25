import type { Round } from "./types";

export function appendOutcomeRound(rounds: Round[], id: number): Round[] {
  return [...rounds, [id]];
}

export function commitBetRound(rounds: Round[], ids: number[]): Round[] {
  if (ids.length === 0) return rounds;
  const unique: number[] = [];
  const seen = new Set<number>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push(id);
  }
  return [...rounds, unique];
}

export function undoRound(rounds: Round[]): Round[] {
  if (rounds.length === 0) return rounds;
  return rounds.slice(0, -1);
}

export function togglePendingId(pending: number[], id: number): number[] {
  if (pending.includes(id)) return pending.filter((x) => x !== id);
  return [...pending, id];
}
