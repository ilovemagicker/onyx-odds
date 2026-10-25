import { describe, expect, it } from "vitest";
import { exportResultsText, exportRoundsText } from "@/lib/export";

describe("exportResultsText", () => {
  it("joins labels in order", () => {
    const options = [
      { id: 0, label: "莊" },
      { id: 1, label: "閒" },
    ];
    expect(exportResultsText(options, [0, 1, 0])).toBe("莊,閒,莊");
  });
});

describe("exportRoundsText", () => {
  it("exports custom outcome rounds", () => {
    const text = exportRoundsText({
      templateId: null,
      trackMode: "outcome",
      options: [
        { id: 0, label: "莊" },
        { id: 1, label: "閑" },
      ],
      rounds: [[0], [1], [0]],
    });
    expect(text.split("\n")[0]).toBe("自訂 · 結果");
    expect(text).toContain("莊\n閑\n莊");
  });

  it("exports bet multi-id rounds with +", () => {
    const text = exportRoundsText({
      templateId: "baccarat",
      trackMode: "bet",
      options: [
        { id: 0, label: "莊" },
        { id: 1, label: "閑" },
        { id: 2, label: "和" },
        { id: 3, label: "莊對" },
        { id: 4, label: "閑對" },
      ],
      rounds: [
        [0, 3],
        [1],
      ],
    });
    expect(text.split("\n")[0]).toBe("百家樂 · 注項");
    expect(text).toContain("莊+莊對");
    expect(text).toContain("閑");
  });
});
