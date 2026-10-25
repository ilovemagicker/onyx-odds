import { describe, expect, it } from "vitest";
import {
  defaultOptions,
  resizeOptions,
  renameOption,
  MIN_OPTIONS,
  MAX_OPTIONS,
} from "@/lib/options";

describe("MAX_OPTIONS", () => {
  it("is 50", () => {
    expect(MAX_OPTIONS).toBe(50);
    expect(MIN_OPTIONS).toBe(2);
  });
});

describe("defaultOptions", () => {
  it("creates N options with ids 0..N-1", () => {
    const opts = defaultOptions(3);
    expect(opts.map((o) => o.id)).toEqual([0, 1, 2]);
    expect(opts.map((o) => o.label)).toEqual(["A", "B", "C"]);
  });

  it("clamps below min and above max", () => {
    expect(defaultOptions(1)).toHaveLength(MIN_OPTIONS);
    expect(defaultOptions(99)).toHaveLength(MAX_OPTIONS);
  });

  it("labels A–Z then 選項N for large N", () => {
    const opts = defaultOptions(50);
    expect(opts[0].label).toBe("A");
    expect(opts[25].label).toBe("Z");
    expect(opts[26].label).toBe("選項27");
    expect(opts[49].label).toBe("選項50");
  });
});

describe("resizeOptions", () => {
  it("keeps overlapping labels when growing and reports clear", () => {
    const base = [
      { id: 0, label: "莊" },
      { id: 1, label: "閒" },
    ];
    const { options, resultsCleared } = resizeOptions(base, 3);
    expect(resultsCleared).toBe(true);
    expect(options).toEqual([
      { id: 0, label: "莊" },
      { id: 1, label: "閒" },
      { id: 2, label: "C" },
    ]);
  });

  it("truncates when shrinking", () => {
    const { options } = resizeOptions(defaultOptions(4), 2);
    expect(options).toHaveLength(2);
    expect(options.map((o) => o.id)).toEqual([0, 1]);
  });

  it("allows resize to 50", () => {
    const { options } = resizeOptions(defaultOptions(2), 50);
    expect(options).toHaveLength(50);
  });
});

describe("renameOption", () => {
  it("renames by id without changing other labels", () => {
    const next = renameOption(defaultOptions(2), 1, "閒");
    expect(next[1].label).toBe("閒");
    expect(next[0].label).toBe("A");
  });
});
