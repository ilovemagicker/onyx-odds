import { describe, expect, it } from "vitest";
import {
  appendOutcomeRound,
  commitBetRound,
  undoRound,
  togglePendingId,
} from "@/lib/rounds";

describe("appendOutcomeRound", () => {
  it("appends a singleton round", () => {
    expect(appendOutcomeRound([], 2)).toEqual([[2]]);
    expect(appendOutcomeRound([[0]], 1)).toEqual([[0], [1]]);
  });
});

describe("commitBetRound", () => {
  it("no-ops on empty selection", () => {
    const prev = [[0]];
    expect(commitBetRound(prev, [])).toBe(prev);
  });

  it("appends unique ids in selection order", () => {
    expect(commitBetRound([], [1, 0, 1])).toEqual([[1, 0]]);
  });
});

describe("undoRound", () => {
  it("pops the whole last round", () => {
    expect(undoRound([[0], [1, 2]])).toEqual([[0]]);
    expect(undoRound([])).toEqual([]);
  });
});

describe("togglePendingId", () => {
  it("toggles membership", () => {
    expect(togglePendingId([], 3)).toEqual([3]);
    expect(togglePendingId([3, 1], 3)).toEqual([1]);
    expect(togglePendingId([3], 1)).toEqual([3, 1]);
  });
});
