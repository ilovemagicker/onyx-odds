import type { Option } from "./types";

export type PasteResult =
  | { ok: true; ids: number[] }
  | { ok: false; error: string };

export function parsePaste(text: string, options: Option[]): PasteResult {
  const trimmed = text.trim();
  if (!trimmed) return { ok: true, ids: [] };

  const tokens = trimmed.split(/[\s,]+/).filter(Boolean);
  const byLabel = new Map(options.map((o) => [o.label, o.id]));
  const ids: number[] = [];

  for (const token of tokens) {
    if (byLabel.has(token)) {
      ids.push(byLabel.get(token)!);
      continue;
    }
    const asNum = Number(token);
    if (
      Number.isInteger(asNum) &&
      asNum >= 1 &&
      asNum <= options.length
    ) {
      ids.push(asNum - 1);
      continue;
    }
    return { ok: false, error: `無法辨識：${token}` };
  }

  return { ok: true, ids };
}
