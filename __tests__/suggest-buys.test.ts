import { describe, expect, it } from "vitest";
import { suggestBuys } from "@/lib/suggest-buys";
import type { Option, PayoutRow } from "@/lib/types";

const sicBoOptions: Option[] = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  label: String(i + 3),
}));

describe("suggestBuys", () => {
  it("returns empty when predictedIds empty", () => {
    expect(
      suggestBuys({
        options: sicBoOptions,
        predictedIds: [],
        payoutRows: [],
      }),
    ).toEqual([]);
  });

  it("passes through baccarat-like labels as-is", () => {
    const options: Option[] = [
      { id: 0, label: "莊" },
      { id: 1, label: "閑" },
    ];
    const result = suggestBuys({
      options,
      predictedIds: [0],
    });
    expect(result.map((r) => r.label)).toEqual(["莊"]);
  });

  it('maps sic-bo "10" → 總點10 + 小 + 雙', () => {
    // id 7 → label "10"
    const result = suggestBuys({
      options: sicBoOptions,
      predictedIds: [7],
    });
    expect(result.map((r) => r.label)).toEqual(["總點10", "小", "雙"]);
  });

  it('maps sic-bo "11" → 總點11 + 大 + 單', () => {
    // id 8 → label "11"
    const result = suggestBuys({
      options: sicBoOptions,
      predictedIds: [8],
    });
    expect(result.map((r) => r.label)).toEqual(["總點11", "大", "單"]);
  });

  it('maps sic-bo "3" → 總點3 + 單 (no 大/小)', () => {
    // id 0 → label "3"
    const result = suggestBuys({
      options: sicBoOptions,
      predictedIds: [0],
    });
    expect(result.map((r) => r.label)).toEqual(["總點3", "單"]);
  });

  it("attaches payout fields when rows provided", () => {
    const payoutRows: PayoutRow[] = [
      {
        label: "總點10",
        payout: "6:1",
        probability: "12.50%",
        houseEdge: "12.50%",
      },
      {
        label: "小",
        payout: "1:1",
        probability: "48.61%",
        houseEdge: "2.78%",
      },
      {
        label: "雙",
        payout: "1:1",
        probability: "48.61%",
        houseEdge: "2.78%",
      },
    ];
    const result = suggestBuys({
      options: sicBoOptions,
      predictedIds: [7],
      payoutRows,
    });
    expect(result[0]).toMatchObject({
      label: "總點10",
      payout: "6:1",
      probability: "12.50%",
      houseEdge: "12.50%",
    });
    expect(result[1]).toMatchObject({
      label: "小",
      payout: "1:1",
      probability: "48.61%",
    });
  });

  it("dedupes overlapping 大/小/單/雙 across predictions", () => {
    // "10" (小+雙) and "4" (小+雙) → one 小, one 雙
    const result = suggestBuys({
      options: sicBoOptions,
      predictedIds: [7, 1], // 10, 4
    });
    const labels = result.map((r) => r.label);
    expect(labels.filter((l) => l === "小")).toHaveLength(1);
    expect(labels.filter((l) => l === "雙")).toHaveLength(1);
    expect(labels[0]).toBe("總點10");
    expect(labels).toContain("總點4");
  });
});
