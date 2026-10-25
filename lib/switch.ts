import { defaultOptions } from "./options";
import { optionsForTemplate } from "./templates";
import type { OddsState, TemplateId, TrackMode } from "./types";

export function applyTemplate(
  state: OddsState,
  templateId: TemplateId | null,
): OddsState {
  if (templateId === null) {
    const n = state.options.length;
    return {
      templateId: null,
      trackMode: "outcome",
      options: defaultOptions(n),
      rounds: [],
      updatedAt: Date.now(),
    };
  }
  return {
    templateId,
    trackMode: "outcome",
    options: optionsForTemplate(templateId, "outcome"),
    rounds: [],
    updatedAt: Date.now(),
  };
}

export function applyTrackMode(
  state: OddsState,
  mode: TrackMode,
): OddsState {
  // 骰寶只允許結果模式（三骰輸入）；請求注項時改為結果
  const resolved: TrackMode =
    state.templateId === "sic-bo" ? "outcome" : mode;
  if (state.templateId === null) {
    return {
      ...state,
      trackMode: resolved,
      rounds: [],
      updatedAt: Date.now(),
    };
  }
  return {
    ...state,
    trackMode: resolved,
    options: optionsForTemplate(state.templateId, resolved),
    rounds: [],
    updatedAt: Date.now(),
  };
}
