import type { Option } from "./types";

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 50;

function clampN(n: number): number {
  if (!Number.isFinite(n)) return MIN_OPTIONS;
  return Math.min(MAX_OPTIONS, Math.max(MIN_OPTIONS, Math.trunc(n)));
}

function defaultLabel(id: number): string {
  if (id >= 0 && id < 26) return String.fromCharCode(65 + id);
  return `選項${id + 1}`;
}

export function defaultOptions(n: number): Option[] {
  const count = clampN(n);
  return Array.from({ length: count }, (_, id) => ({
    id,
    label: defaultLabel(id),
  }));
}

export function resizeOptions(
  options: Option[],
  n: number,
): { options: Option[]; resultsCleared: true } {
  const count = clampN(n);
  const next: Option[] = [];
  for (let id = 0; id < count; id++) {
    const prev = options.find((o) => o.id === id);
    next.push({
      id,
      label: prev?.label ?? defaultLabel(id),
    });
  }
  return { options: next, resultsCleared: true };
}

export function renameOption(
  options: Option[],
  id: number,
  label: string,
): Option[] {
  const trimmed = label.trim();
  return options.map((o) => {
    if (o.id !== id) return o;
    return {
      id: o.id,
      label: trimmed.length > 0 ? trimmed : o.label || `選項${id + 1}`,
    };
  });
}
