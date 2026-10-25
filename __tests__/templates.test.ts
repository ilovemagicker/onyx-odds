import { describe, expect, it } from "vitest";
import { MAX_OPTIONS, MIN_OPTIONS } from "@/lib/options";
import {
  TEMPLATES,
  TEMPLATE_PICKER,
  getTemplate,
  optionsForTemplate,
  templateDisplayName,
} from "@/lib/templates";
import type { GameTemplate, TemplateId } from "@/lib/types";

function assertTemplateShape(t: GameTemplate) {
  expect(t.outcomeOptions.length).toBeGreaterThanOrEqual(MIN_OPTIONS);
  expect(t.outcomeOptions.length).toBeLessThanOrEqual(MAX_OPTIONS);
  expect(t.betOptions.length).toBeGreaterThanOrEqual(MIN_OPTIONS);
  expect(t.betOptions.length).toBeLessThanOrEqual(MAX_OPTIONS);
  expect(t.payoutRows.length).toBeGreaterThan(0);
  t.outcomeOptions.forEach((o, i) => expect(o.id).toBe(i));
  t.betOptions.forEach((o, i) => expect(o.id).toBe(i));
}

const IDS: TemplateId[] = [
  "baccarat",
  "dragon-tiger",
  "european-roulette",
  "sic-bo",
];

describe("TEMPLATES registry", () => {
  it("registers all four games within option caps", () => {
    for (const id of IDS) {
      assertTemplateShape(TEMPLATES[id]);
      expect(getTemplate(id).id).toBe(id);
    }
    expect(TEMPLATE_PICKER.map((p) => p.id)).toEqual([
      null,
      "baccarat",
      "dragon-tiger",
      "european-roulette",
      "sic-bo",
    ]);
    expect(templateDisplayName(null)).toBe("自訂");
    expect(templateDisplayName("baccarat")).toBe("百家樂");
  });

  it("european roulette has 37 outcomes and 12 bet options", () => {
    const t = TEMPLATES["european-roulette"];
    expect(t.outcomeOptions).toHaveLength(37);
    expect(t.outcomeOptions[0].label).toBe("0");
    expect(t.outcomeOptions[36].label).toBe("36");
    expect(t.betOptions.map((o) => o.label)).toEqual([
      "紅",
      "黑",
      "單",
      "雙",
      "小(1–18)",
      "大(19–36)",
      "第一打",
      "第二打",
      "第三打",
      "第一列",
      "第二列",
      "第三列",
    ]);
    const labels = t.payoutRows.map((r) => r.label);
    expect(labels).toEqual(
      expect.arrayContaining([
        "直注",
        "分注",
        "街注",
        "角注",
        "線注",
        "列注",
        "打注",
        "紅／黑",
        "單／雙",
        "小／大",
      ]),
    );
  });

  it("sic bo has totals 3–18 outcomes and 39 bet options", () => {
    const t = TEMPLATES["sic-bo"];
    expect(t.outcomeOptions).toHaveLength(16);
    expect(t.outcomeOptions[0].label).toBe("3");
    expect(t.outcomeOptions[15].label).toBe("18");
    expect(t.betOptions).toHaveLength(39);
    expect(t.betOptions.map((o) => o.label)).toEqual(
      expect.arrayContaining([
        "大",
        "小",
        "單",
        "雙",
        "任意圍骰",
        "圍骰1",
        "雙骰1",
        "單骰1",
      ]),
    );
  });

  it("optionsForTemplate switches by mode", () => {
    expect(optionsForTemplate("baccarat", "outcome")).toHaveLength(3);
    expect(optionsForTemplate("baccarat", "bet")).toHaveLength(5);
  });
});
