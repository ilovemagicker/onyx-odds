import { describe, expect, it } from "vitest";
import { applyTemplate, applyTrackMode } from "@/lib/switch";
import { defaultOptions } from "@/lib/options";
import type { OddsState } from "@/lib/types";

function base(): OddsState {
  return {
    templateId: null,
    trackMode: "outcome",
    options: defaultOptions(2),
    rounds: [[0], [1]],
    updatedAt: 1,
  };
}

describe("applyTemplate", () => {
  it("loads baccarat outcome options and clears rounds", () => {
    const next = applyTemplate(base(), "baccarat");
    expect(next.templateId).toBe("baccarat");
    expect(next.trackMode).toBe("outcome");
    expect(next.options.map((o) => o.label)).toEqual(["莊", "閑", "和"]);
    expect(next.rounds).toEqual([]);
  });

  it("returns to custom with default labels for current N", () => {
    const fromGame = applyTemplate(base(), "baccarat");
    fromGame.rounds = [[0]];
    const next = applyTemplate(fromGame, null);
    expect(next.templateId).toBeNull();
    expect(next.options).toHaveLength(3);
    expect(next.rounds).toEqual([]);
  });
});

describe("applyTrackMode", () => {
  it("swaps to bet options and clears rounds for template", () => {
    const state = applyTemplate(base(), "baccarat");
    state.rounds = [[0]];
    const next = applyTrackMode(state, "bet");
    expect(next.trackMode).toBe("bet");
    expect(next.options).toHaveLength(5);
    expect(next.rounds).toEqual([]);
  });

  it("custom mode keeps options when switching track mode", () => {
    const next = applyTrackMode(base(), "bet");
    expect(next.trackMode).toBe("bet");
    expect(next.options).toHaveLength(2);
    expect(next.rounds).toEqual([]);
  });
  it("forces outcome when sic-bo requests bet mode", () => {
    const state = applyTemplate(base(), "sic-bo");
    state.rounds = [[0]];
    const next = applyTrackMode(state, "bet");
    expect(next.trackMode).toBe("outcome");
    expect(next.options.map((o) => o.label)).toEqual(
      Array.from({ length: 16 }, (_, i) => String(i + 3)),
    );
    expect(next.rounds).toEqual([]);
  });
});
