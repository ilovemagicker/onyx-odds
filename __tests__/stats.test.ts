import { describe, expect, it } from "vitest";
import { computeStats } from "@/lib/stats";
import { defaultOptions } from "@/lib/options";

describe("computeStats (rounds)", () => {
  it("returns empty highlights when no rounds", () => {
    const s = computeStats(defaultOptions(2), []);
    expect(s.total).toBe(0);
    expect(s.hottestIds).toEqual([]);
    expect(s.dueIds).toEqual([]);
    expect(s.predictedIds).toEqual([]);
    expect(s.rows[0].gap).toBe(0);
    expect(s.rows[0].fair).toBeCloseTo(0.5);
  });

  it("singleton rounds match v1 flat-results parity", () => {
    const s = computeStats(defaultOptions(2), [[0], [1], [0]]);
    expect(s.total).toBe(3);
    expect(s.rows[0].count).toBe(2);
    expect(s.rows[0].frequency).toBeCloseTo(2 / 3);
    expect(s.rows[0].gap).toBe(0);
    expect(s.rows[1].count).toBe(1);
    expect(s.rows[1].gap).toBe(1);
    expect(s.hottestIds).toEqual([0]);
    expect(s.dueIds).toEqual([1]);
    expect(s.predictedIds).toEqual([1]);
  });

  it("multi-id round counts by inclusion once per round", () => {
    const s = computeStats(defaultOptions(2), [
      [0, 1],
      [0],
    ]);
    expect(s.total).toBe(2);
    expect(s.rows[0].count).toBe(2);
    expect(s.rows[1].count).toBe(1);
    expect(s.rows[0].gap).toBe(0);
    expect(s.rows[1].gap).toBe(1);
  });

  it("never-appeared gap equals total rounds", () => {
    const s = computeStats(defaultOptions(3), [[0], [0], [1]]);
    expect(s.rows[2].count).toBe(0);
    expect(s.rows[2].gap).toBe(3);
    expect(s.dueIds).toContain(2);
  });

  it("marks all ties for hot and due", () => {
    const s = computeStats(defaultOptions(2), [[0], [1]]);
    expect(s.hottestIds.sort()).toEqual([0, 1]);
  });

  it("includes all tied ids in predictedIds when scores equal", () => {
    const s = computeStats(defaultOptions(2), [[0]]);
    expect(s.predictedIds.sort()).toEqual([0, 1]);
  });
});
