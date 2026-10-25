import { defaultOptions, MAX_OPTIONS, MIN_OPTIONS } from "./options";
import type { OddsState, Option, Round, TemplateId, TrackMode } from "./types";

export const STORAGE_KEY = "onyx-odds:v2";
export const STORAGE_KEY_V1 = "onyx-odds:v1";

const TEMPLATE_IDS: TemplateId[] = [
  "baccarat",
  "dragon-tiger",
  "european-roulette",
  "sic-bo",
];

function fallback(): OddsState {
  return {
    templateId: null,
    trackMode: "outcome",
    options: defaultOptions(2),
    rounds: [],
    updatedAt: Date.now(),
  };
}

function isOption(x: unknown): x is Option {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as Option).id === "number" &&
    typeof (x as Option).label === "string"
  );
}

function isRound(x: unknown): x is Round {
  return (
    Array.isArray(x) &&
    x.length >= 1 &&
    x.every((n) => typeof n === "number" && Number.isFinite(n))
  );
}

function isTrackMode(x: unknown): x is TrackMode {
  return x === "outcome" || x === "bet";
}

function isTemplateId(x: unknown): x is TemplateId {
  return typeof x === "string" && (TEMPLATE_IDS as string[]).includes(x);
}

function resolveStore(storage?: Storage | null): Storage | null {
  return (
    storage ??
    (typeof globalThis !== "undefined"
      ? (globalThis as { localStorage?: Storage }).localStorage
      : undefined) ??
    null
  );
}

function validateV2(parsed: Partial<OddsState>): OddsState | null {
  if (!Array.isArray(parsed.options) || !parsed.options.every(isOption)) {
    return null;
  }
  const n = parsed.options.length;
  if (n < MIN_OPTIONS || n > MAX_OPTIONS) return null;
  if (!Array.isArray(parsed.rounds)) return null;

  const rounds: Round[] = [];
  for (const r of parsed.rounds) {
    if (Array.isArray(r) && r.length === 0) continue;
    if (!isRound(r)) return null;
    rounds.push(r);
  }

  if (
    parsed.templateId !== null &&
    parsed.templateId !== undefined &&
    !isTemplateId(parsed.templateId)
  ) {
    return null;
  }
  const templateId =
    parsed.templateId === null || parsed.templateId === undefined
      ? null
      : parsed.templateId;

  const trackMode = isTrackMode(parsed.trackMode)
    ? parsed.trackMode
    : "outcome";

  return {
    templateId,
    trackMode,
    options: parsed.options,
    rounds,
    updatedAt:
      typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
  };
}

function migrateV1(raw: string): OddsState | null {
  try {
    const parsed = JSON.parse(raw) as {
      options?: unknown;
      results?: unknown;
      updatedAt?: unknown;
    };
    if (!Array.isArray(parsed.options) || !parsed.options.every(isOption)) {
      return null;
    }
    const n = parsed.options.length;
    if (n < MIN_OPTIONS || n > MAX_OPTIONS) return null;
    if (
      !Array.isArray(parsed.results) ||
      !parsed.results.every((x) => typeof x === "number")
    ) {
      return null;
    }
    return {
      templateId: null,
      trackMode: "outcome",
      options: parsed.options,
      rounds: parsed.results.map((id) => [id as number]),
      updatedAt:
        typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function loadState(storage?: Storage | null): OddsState {
  const store = resolveStore(storage);
  if (!store) return fallback();
  try {
    const v2raw = store.getItem(STORAGE_KEY);
    if (v2raw) {
      const parsed = JSON.parse(v2raw) as Partial<OddsState>;
      const ok = validateV2(parsed);
      if (ok) return ok;
      return fallback();
    }
    const v1raw = store.getItem(STORAGE_KEY_V1);
    if (v1raw) {
      const migrated = migrateV1(v1raw);
      if (migrated) {
        store.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
    return fallback();
  } catch {
    return fallback();
  }
}

export function saveState(state: OddsState, storage?: Storage | null): void {
  const store = resolveStore(storage);
  if (!store) return;
  store.setItem(STORAGE_KEY, JSON.stringify(state));
}
