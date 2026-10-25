/** Sic Bo die face: 1–6. */
export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export const DIE_FACES: DieFace[] = [1, 2, 3, 4, 5, 6];

/** Map three faces to outcome option id (labels "3"…"18" → ids 0…15). */
export function diceToOutcomeId(
  d1: DieFace,
  d2: DieFace,
  d3: DieFace,
): number {
  return d1 + d2 + d3 - 3;
}

export function isDieFace(n: number): n is DieFace {
  return Number.isInteger(n) && n >= 1 && n <= 6;
}

/** Sum of three faces (3–18). */
export function diceTotal(d1: DieFace, d2: DieFace, d3: DieFace): number {
  return d1 + d2 + d3;
}
