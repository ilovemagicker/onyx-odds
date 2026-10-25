import { describe, expect, it } from "vitest";
import { computeStats } from "@/lib/stats";
import { defaultOptions } from "@/lib/options";

describe("computeStats", () => {
  it("returns empty highlights when no results", () => {
    const s = computeStats(defaultOptions(2), []);
    expect(s.total).toBe(0);
    expect(s.hottestIds).toEqual([]);
    expect(s.dueIds).toEqual([]);
    expect(s.predictedIds).toEqual([]);
    expect(s.rows[0].gap).toBe(0);
    expect(s.rows[0].fair).toBeCloseTo(0.5);
  });

  it("counts frequency and gap", () => {
    // results: A,B,A  (ids 0,1,0) — last A at end → gap A=0, B=1
    const s = computeStats(defaultOptions(2), [0, 1, 0]);
    expect(s.total).toBe(3);
    expect(s.rows[0].count).toBe(2);
    expect(s.rows[0].frequency).toBeCloseTo(2 / 3);
    expect(s.rows[0].gap).toBe(0);
    expect(s.rows[1].count).toBe(1);
    expect(s.rows[1].gap).toBe(1);
    expect(s.hottestIds).toEqual([0]);
    expect(s.dueIds).toEqual([1]);
  });

  it("predicts B for A,B,A (combined hot+due)", () => {
    // A: freq 2/3, gap 0 → hotNorm=1, dueNorm=0 → score=1
    // B: freq 1/3, gap 1 → hotNorm=0.5, dueNorm=1 → score=1.5 → B
    const s = computeStats(defaultOptions(2), [0, 1, 0]);
    expect(s.predictedIds).toEqual([1]);
  });

  it("never-appeared gap equals total", () => {
    const opts = defaultOptions(3);
    const s = computeStats(opts, [0, 0, 1]);
    expect(s.rows[2].count).toBe(0);
    expect(s.rows[2].gap).toBe(3);
    expect(s.dueIds).toContain(2);
  });

  it("never-appeared with high gap ties appropriately in prediction", () => {
    // [0,0,0] N=3: A hot gap0 score=1; B,C never dueNorm=1 score=1 → all tie
    const s = computeStats(defaultOptions(3), [0, 0, 0]);
    expect(s.predictedIds).toContain(2);
    expect(s.predictedIds.sort()).toEqual([0, 1, 2]);
  });

  it("marks all ties for hot and due", () => {
    const s = computeStats(defaultOptions(2), [0, 1]);
    expect(s.hottestIds.sort()).toEqual([0, 1]);
  });

  it("includes all tied ids in predictedIds when scores equal", () => {
    // [0] N=2: A hotNorm=1 dueNorm=0 score=1; B never hotNorm=0 dueNorm=1 score=1
    const s = computeStats(defaultOptions(2), [0]);
    expect(s.predictedIds.sort()).toEqual([0, 1]);
  });
});
