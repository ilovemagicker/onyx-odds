import { describe, expect, it } from "vitest";
import {
  diceToOutcomeId,
  diceTotal,
  isDieFace,
} from "@/lib/sic-bo-dice";

describe("diceToOutcomeId", () => {
  it("maps 1+1+1 → id 0 (total 3)", () => {
    expect(diceToOutcomeId(1, 1, 1)).toBe(0);
  });

  it("maps 6+6+6 → id 15 (total 18)", () => {
    expect(diceToOutcomeId(6, 6, 6)).toBe(15);
  });

  it("maps sum 7 → id 4", () => {
    expect(diceToOutcomeId(1, 2, 4)).toBe(4);
    expect(diceToOutcomeId(2, 2, 3)).toBe(4);
    expect(diceToOutcomeId(1, 1, 5)).toBe(4);
  });

  it("covers full 3–18 range as ids 0–15", () => {
    for (let t = 3; t <= 18; t++) {
      // find any triple summing to t
      let found = false;
      for (let a = 1; a <= 6 && !found; a++) {
        for (let b = 1; b <= 6 && !found; b++) {
          const c = t - a - b;
          if (c >= 1 && c <= 6) {
            expect(
              diceToOutcomeId(
                a as 1 | 2 | 3 | 4 | 5 | 6,
                b as 1 | 2 | 3 | 4 | 5 | 6,
                c as 1 | 2 | 3 | 4 | 5 | 6,
              ),
            ).toBe(t - 3);
            found = true;
          }
        }
      }
      expect(found).toBe(true);
    }
  });
});

describe("diceTotal", () => {
  it("sums three faces", () => {
    expect(diceTotal(4, 5, 6)).toBe(15);
  });
});

describe("isDieFace", () => {
  it("accepts 1–6 only", () => {
    expect(isDieFace(1)).toBe(true);
    expect(isDieFace(6)).toBe(true);
    expect(isDieFace(0)).toBe(false);
    expect(isDieFace(7)).toBe(false);
    expect(isDieFace(1.5)).toBe(false);
  });
});
