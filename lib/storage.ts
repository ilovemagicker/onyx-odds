import { defaultOptions } from "./options";
import type { OddsState, Option } from "./types";

export const STORAGE_KEY = "onyx-odds:v1";

function fallback(): OddsState {
  return { options: defaultOptions(2), results: [], updatedAt: Date.now() };
}

function isOption(x: unknown): x is Option {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Option).id === "number" &&
    typeof (x as Option).label === "string"
  );
}

export function loadState(storage?: Storage | null): OddsState {
  const store =
    storage ??
    (typeof globalThis !== "undefined"
      ? (globalThis as { localStorage?: Storage }).localStorage
      : undefined) ??
    null;
  if (!store) return fallback();
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return fallback();
    const parsed = JSON.parse(raw) as Partial<OddsState>;
    if (!Array.isArray(parsed.options) || !parsed.options.every(isOption)) {
      return fallback();
    }
    if (!Array.isArray(parsed.results) || !parsed.results.every((n) => typeof n === "number")) {
      return fallback();
    }
    return {
      options: parsed.options,
      results: parsed.results,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return fallback();
  }
}

export function saveState(state: OddsState, storage?: Storage | null): void {
  const store =
    storage ??
    (typeof globalThis !== "undefined"
      ? (globalThis as { localStorage?: Storage }).localStorage
      : undefined) ??
    null;
  if (!store) return;
  store.setItem(STORAGE_KEY, JSON.stringify(state));
}
