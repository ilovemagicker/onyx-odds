import { templateDisplayName } from "./templates";
import type { Option, Round, TemplateId, TrackMode } from "./types";

export function exportResultsText(
  options: Option[],
  results: number[],
): string {
  const map = new Map(options.map((o) => [o.id, o.label]));
  return results.map((id) => map.get(id) ?? String(id + 1)).join(",");
}

export type ExportInput = {
  templateId: TemplateId | null;
  trackMode: TrackMode;
  options: Option[];
  rounds: Round[];
};

export function exportRoundsText(input: ExportInput): string {
  const modeLabel = input.trackMode === "bet" ? "注項" : "結果";
  const header = `${templateDisplayName(input.templateId)} · ${modeLabel}`;
  const map = new Map(input.options.map((o) => [o.id, o.label]));
  const lines = input.rounds.map((round) =>
    round.map((id) => map.get(id) ?? String(id + 1)).join("+"),
  );
  return [header, ...lines].join("\n");
}
