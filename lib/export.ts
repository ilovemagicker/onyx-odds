import type { Option } from "./types";

export function exportResultsText(
  options: Option[],
  results: number[],
): string {
  const map = new Map(options.map((o) => [o.id, o.label]));
  return results.map((id) => map.get(id) ?? String(id + 1)).join(",");
}
