import { describe, expect, it } from "vitest";
import { MAX_OPTIONS, MIN_OPTIONS } from "@/lib/options";
import { baccaratTemplate } from "@/lib/templates/baccarat";
import { dragonTigerTemplate } from "@/lib/templates/dragon-tiger";
import type { GameTemplate } from "@/lib/types";

function assertTemplateShape(t: GameTemplate) {
  expect(t.outcomeOptions.length).toBeGreaterThanOrEqual(MIN_OPTIONS);
  expect(t.outcomeOptions.length).toBeLessThanOrEqual(MAX_OPTIONS);
  expect(t.betOptions.length).toBeGreaterThanOrEqual(MIN_OPTIONS);
  expect(t.betOptions.length).toBeLessThanOrEqual(MAX_OPTIONS);
  expect(t.payoutRows.length).toBeGreaterThan(0);
  t.outcomeOptions.forEach((o, i) => expect(o.id).toBe(i));
  t.betOptions.forEach((o, i) => expect(o.id).toBe(i));
  for (const row of t.payoutRows) {
    expect(row.label.length).toBeGreaterThan(0);
    expect(row.payout.length).toBeGreaterThan(0);
  }
}

describe("baccaratTemplate", () => {
  it("has locked outcome and bet sets", () => {
    assertTemplateShape(baccaratTemplate);
    expect(baccaratTemplate.outcomeOptions.map((o) => o.label)).toEqual([
      "莊",
      "閑",
      "和",
    ]);
    expect(baccaratTemplate.betOptions.map((o) => o.label)).toEqual([
      "莊",
      "閑",
      "和",
      "莊對",
      "閑對",
    ]);
    const labels = baccaratTemplate.payoutRows.map((r) => r.label);
    expect(labels).toEqual(
      expect.arrayContaining(["莊", "閑", "和", "莊對", "閑對"]),
    );
  });
});

describe("dragonTigerTemplate", () => {
  it("has locked dragon/tiger/tie sets", () => {
    assertTemplateShape(dragonTigerTemplate);
    expect(dragonTigerTemplate.outcomeOptions.map((o) => o.label)).toEqual([
      "龍",
      "虎",
      "和",
    ]);
    expect(dragonTigerTemplate.betOptions.map((o) => o.label)).toEqual([
      "龍",
      "虎",
      "和",
    ]);
  });
});
