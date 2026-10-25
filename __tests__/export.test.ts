import { describe, expect, it } from "vitest";
import { exportResultsText } from "@/lib/export";

describe("exportResultsText", () => {
  it("joins labels in order", () => {
    const options = [
      { id: 0, label: "莊" },
      { id: 1, label: "閒" },
    ];
    expect(exportResultsText(options, [0, 1, 0])).toBe("莊,閒,莊");
  });
});
