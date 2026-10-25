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
  if (state.templateId === null) {
    return {
      ...state,
      trackMode: mode,
      rounds: [],
      updatedAt: Date.now(),
    };
  }
  return {
    ...state,
    trackMode: mode,
    options: optionsForTemplate(state.templateId, mode),
    rounds: [],
    updatedAt: Date.now(),
  };
}
