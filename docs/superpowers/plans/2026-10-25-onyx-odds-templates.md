# Onyx Odds Casino Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four built-in casino game templates (百家樂、龍虎、歐式輪盤、骰寶) with same-page payout tables, dual track modes (`outcome` | `bet`), `MAX_OPTIONS=50`, and `onyx-odds:v2` storage with v1 migration — while keeping custom N-option mode.

**Architecture:** Extend pure TypeScript modules (`lib/types`, `options`, `stats`, `storage`, `paste`, `export`) so history is `rounds: number[][]` (inclusion-based stats). Add `lib/templates/` registry of game constants. Thin React components gain a game picker, mode toggle, bet multi-select +「記入本局」, `PayoutTable`, and grouped Road chips. No backend.

**Tech Stack:** Next.js 15, React 19, Tailwind 4, Vitest, TypeScript, localStorage

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-25-onyx-odds-templates-design.md` (extends v1 design).
- Approach **A**: templates fill trackable options + embed payout table on the same page.
- Games: `baccarat` | `dragon-tiger` | `european-roulette` | `sic-bo`.
- Track modes: both; default **`outcome`**; bet mode commits via **記入本局**.
- `MAX_OPTIONS = 50`; custom N still **2–50**.
- Storage key **`onyx-odds:v2`**; migrate readable v1 → custom (`templateId: null`).
- Payout columns: 注項｜賠率｜理論機率｜莊家優勢｜備註; missing optional fields → **—**.
- Disclaimer (extended, visible on phone viewport): `歷史統計僅供參考，不影響真實下一局機率。賠率表為常見規則整理，實際賭場可能不同；本工具不提供結果保證，亦不鼓勵賭博。`
- UI language: Traditional Chinese primary.
- No live odds, bead-plate/wheel first-class UI, accounts, gambling CTAs, or backend.
- `npm test` and `npm run build` must stay green.

## File map

```
Create:
  lib/templates/index.ts
  lib/templates/baccarat.ts
  lib/templates/dragon-tiger.ts
  lib/templates/european-roulette.ts
  lib/templates/sic-bo.ts
  lib/rounds.ts
  lib/switch.ts
  components/PayoutTable.tsx
  __tests__/templates.test.ts
  __tests__/rounds.test.ts
  __tests__/switch.test.ts

Modify:
  lib/types.ts
  lib/options.ts
  lib/stats.ts
  lib/storage.ts
  lib/paste.ts
  lib/export.ts
  components/Disclaimer.tsx
  components/SetupPanel.tsx
  components/ResultButtons.tsx
  components/Road.tsx
  components/PasteInput.tsx
  components/OddsApp.tsx
  __tests__/options.test.ts
  __tests__/stats.test.ts
  __tests__/storage.test.ts
  __tests__/export.test.ts
  __tests__/paste.test.ts
  README.md
```

---

### Task 1: Types + MAX_OPTIONS = 50

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/options.ts`
- Modify: `__tests__/options.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `export type Option = { id: number; label: string }`
  - `export type TrackMode = "outcome" | "bet"`
  - `export type TemplateId = "baccarat" | "dragon-tiger" | "european-roulette" | "sic-bo"`
  - `export type Round = number[]`
  - `export type PayoutRow = { label: string; payout: string; probability?: string; houseEdge?: string; note?: string }`
  - `export type GameTemplate = { id: TemplateId; nameZh: string; nameEn: string; outcomeOptions: Option[]; betOptions: Option[]; payoutRows: PayoutRow[] }`
  - `export type OddsState = { templateId: TemplateId | null; trackMode: TrackMode; options: Option[]; rounds: Round[]; updatedAt: number }`
  - `export const MIN_OPTIONS = 2`, `export const MAX_OPTIONS = 50`
  - `defaultOptions` / `resizeOptions` / `renameOption` unchanged signatures; clamp to 2–50; labels `A`–`Z` then `選項27`…

- [ ] **Step 1: Write failing tests for MAX_OPTIONS=50**

Replace `__tests__/options.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import {
  defaultOptions,
  resizeOptions,
  renameOption,
  MIN_OPTIONS,
  MAX_OPTIONS,
} from "@/lib/options";

describe("MAX_OPTIONS", () => {
  it("is 50", () => {
    expect(MAX_OPTIONS).toBe(50);
    expect(MIN_OPTIONS).toBe(2);
  });
});

describe("defaultOptions", () => {
  it("creates N options with ids 0..N-1", () => {
    const opts = defaultOptions(3);
    expect(opts.map((o) => o.id)).toEqual([0, 1, 2]);
    expect(opts.map((o) => o.label)).toEqual(["A", "B", "C"]);
  });

  it("clamps below min and above max", () => {
    expect(defaultOptions(1)).toHaveLength(MIN_OPTIONS);
    expect(defaultOptions(99)).toHaveLength(MAX_OPTIONS);
  });

  it("labels A–Z then 選項N for large N", () => {
    const opts = defaultOptions(50);
    expect(opts[0].label).toBe("A");
    expect(opts[25].label).toBe("Z");
    expect(opts[26].label).toBe("選項27");
    expect(opts[49].label).toBe("選項50");
  });
});

describe("resizeOptions", () => {
  it("keeps overlapping labels when growing and reports clear", () => {
    const base = [
      { id: 0, label: "莊" },
      { id: 1, label: "閒" },
    ];
    const { options, resultsCleared } = resizeOptions(base, 3);
    expect(resultsCleared).toBe(true);
    expect(options).toEqual([
      { id: 0, label: "莊" },
      { id: 1, label: "閒" },
      { id: 2, label: "C" },
    ]);
  });

  it("truncates when shrinking", () => {
    const { options } = resizeOptions(defaultOptions(4), 2);
    expect(options).toHaveLength(2);
    expect(options.map((o) => o.id)).toEqual([0, 1]);
  });

  it("allows resize to 50", () => {
    const { options } = resizeOptions(defaultOptions(2), 50);
    expect(options).toHaveLength(50);
  });
});

describe("renameOption", () => {
  it("renames by id without changing other labels", () => {
    const next = renameOption(defaultOptions(2), 1, "閒");
    expect(next[1].label).toBe("閒");
    expect(next[0].label).toBe("A");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/options.test.ts`  
Expected: FAIL — `MAX_OPTIONS` is still 20 and/or label `選項27` missing.

- [ ] **Step 3: Update `lib/types.ts`**

```ts
export type Option = { id: number; label: string };

export type TrackMode = "outcome" | "bet";

export type TemplateId =
  | "baccarat"
  | "dragon-tiger"
  | "european-roulette"
  | "sic-bo";

/** One recorded round: non-empty list of option ids. */
export type Round = number[];

export type PayoutRow = {
  label: string;
  payout: string;
  probability?: string;
  houseEdge?: string;
  note?: string;
};

export type GameTemplate = {
  id: TemplateId;
  nameZh: string;
  nameEn: string;
  outcomeOptions: Option[];
  betOptions: Option[];
  payoutRows: PayoutRow[];
};

export type OddsState = {
  templateId: TemplateId | null;
  trackMode: TrackMode;
  options: Option[];
  rounds: Round[];
  updatedAt: number;
};
```

- [ ] **Step 4: Update `lib/options.ts`**

```ts
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- __tests__/options.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/options.ts __tests__/options.test.ts
git commit -m "feat(odds): raise MAX_OPTIONS to 50 and extend types for templates"
```

---

### Task 2: Stats from rounds (inclusion)

**Files:**
- Modify: `lib/stats.ts`
- Modify: `__tests__/stats.test.ts`

**Interfaces:**
- Consumes: `Option`, `Round` from `lib/types.ts`
- Produces:
  - `computeStats(options: Option[], rounds: Round[]): StatsSummary` — `T = rounds.length`; count = rounds that **include** id; gap = trailing rounds since last inclusion (never → `T`); hot/due/predicted tie rules unchanged from v1

- [ ] **Step 1: Rewrite `__tests__/stats.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { computeStats } from "@/lib/stats";
import { defaultOptions } from "@/lib/options";

describe("computeStats (rounds)", () => {
  it("returns empty highlights when no rounds", () => {
    const s = computeStats(defaultOptions(2), []);
    expect(s.total).toBe(0);
    expect(s.hottestIds).toEqual([]);
    expect(s.dueIds).toEqual([]);
    expect(s.predictedIds).toEqual([]);
    expect(s.rows[0].gap).toBe(0);
    expect(s.rows[0].fair).toBeCloseTo(0.5);
  });

  it("singleton rounds match v1 flat-results parity", () => {
    const s = computeStats(defaultOptions(2), [[0], [1], [0]]);
    expect(s.total).toBe(3);
    expect(s.rows[0].count).toBe(2);
    expect(s.rows[0].frequency).toBeCloseTo(2 / 3);
    expect(s.rows[0].gap).toBe(0);
    expect(s.rows[1].count).toBe(1);
    expect(s.rows[1].gap).toBe(1);
    expect(s.hottestIds).toEqual([0]);
    expect(s.dueIds).toEqual([1]);
    expect(s.predictedIds).toEqual([1]);
  });

  it("multi-id round counts by inclusion once per round", () => {
    const s = computeStats(defaultOptions(2), [
      [0, 1],
      [0],
    ]);
    expect(s.total).toBe(2);
    expect(s.rows[0].count).toBe(2);
    expect(s.rows[1].count).toBe(1);
    expect(s.rows[0].gap).toBe(0);
    expect(s.rows[1].gap).toBe(1);
  });

  it("never-appeared gap equals total rounds", () => {
    const s = computeStats(defaultOptions(3), [[0], [0], [1]]);
    expect(s.rows[2].count).toBe(0);
    expect(s.rows[2].gap).toBe(3);
    expect(s.dueIds).toContain(2);
  });

  it("marks all ties for hot and due", () => {
    const s = computeStats(defaultOptions(2), [[0], [1]]);
    expect(s.hottestIds.sort()).toEqual([0, 1]);
  });

  it("includes all tied ids in predictedIds when scores equal", () => {
    const s = computeStats(defaultOptions(2), [[0]]);
    expect(s.predictedIds.sort()).toEqual([0, 1]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/stats.test.ts`  
Expected: FAIL — `computeStats` still expects flat `number[]`.

- [ ] **Step 3: Implement `lib/stats.ts`**

```ts
import type { Option, Round } from "./types";

export type OptionStat = {
  id: number;
  label: string;
  count: number;
  frequency: number;
  fair: number;
  gap: number;
  isHot: boolean;
  isDue: boolean;
  isPredicted: boolean;
};

export type StatsSummary = {
  total: number;
  rows: OptionStat[];
  hottestIds: number[];
  dueIds: number[];
  predictedIds: number[];
};

export function computeStats(
  options: Option[],
  rounds: Round[],
): StatsSummary {
  const N = options.length;
  const T = rounds.length;
  const fair = N > 0 ? 1 / N : 0;

  const counts = new Map<number, number>();
  for (const o of options) counts.set(o.id, 0);
  for (const round of rounds) {
    const seen = new Set<number>();
    for (const id of round) {
      if (!counts.has(id) || seen.has(id)) continue;
      seen.add(id);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  const lastIndex = new Map<number, number>();
  rounds.forEach((round, idx) => {
    const seen = new Set<number>();
    for (const id of round) {
      if (!counts.has(id) || seen.has(id)) continue;
      seen.add(id);
      lastIndex.set(id, idx);
    }
  });

  const rowsBase = options.map((o) => {
    const count = counts.get(o.id) ?? 0;
    const frequency = T > 0 ? count / T : 0;
    const last = lastIndex.get(o.id);
    const gap = last === undefined ? T : T - 1 - last;
    return {
      id: o.id,
      label: o.label,
      count,
      frequency,
      fair,
      gap,
      isHot: false,
      isDue: false,
      isPredicted: false,
    };
  });

  if (T === 0) {
    return {
      total: 0,
      rows: rowsBase,
      hottestIds: [],
      dueIds: [],
      predictedIds: [],
    };
  }

  const maxFreq = Math.max(...rowsBase.map((r) => r.frequency));
  const maxGap = Math.max(...rowsBase.map((r) => r.gap));
  const hottestIds = rowsBase
    .filter((r) => r.frequency === maxFreq)
    .map((r) => r.id);
  const dueIds = rowsBase.filter((r) => r.gap === maxGap).map((r) => r.id);

  const scores = rowsBase.map((r) => {
    const hotNorm = maxFreq > 0 ? r.frequency / maxFreq : 0;
    const dueNorm = maxGap > 0 ? r.gap / maxGap : 0;
    return hotNorm + dueNorm;
  });
  const maxScore = Math.max(...scores);
  const predictedIds = rowsBase
    .filter((_, i) => scores[i] === maxScore)
    .map((r) => r.id);

  const hotSet = new Set(hottestIds);
  const dueSet = new Set(dueIds);
  const predSet = new Set(predictedIds);
  const rows = rowsBase.map((r) => ({
    ...r,
    isHot: hotSet.has(r.id),
    isDue: dueSet.has(r.id),
    isPredicted: predSet.has(r.id),
  }));

  return { total: T, rows, hottestIds, dueIds, predictedIds };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- __tests__/stats.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/stats.ts __tests__/stats.test.ts
git commit -m "feat(odds): compute stats from rounds by inclusion"
```

---

### Task 3: Round helpers (append / undo / pending bets)

**Files:**
- Create: `lib/rounds.ts`
- Create: `__tests__/rounds.test.ts`

**Interfaces:**
- Consumes: `Round` from `lib/types.ts`
- Produces:
  - `appendOutcomeRound(rounds: Round[], id: number): Round[]` — append `[id]`
  - `commitBetRound(rounds: Round[], ids: number[]): Round[]` — empty ids → same ref; else append unique ids in selection order
  - `undoRound(rounds: Round[]): Round[]` — pop last round
  - `togglePendingId(pending: number[], id: number): number[]` — set toggle

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import {
  appendOutcomeRound,
  commitBetRound,
  undoRound,
  togglePendingId,
} from "@/lib/rounds";

describe("appendOutcomeRound", () => {
  it("appends a singleton round", () => {
    expect(appendOutcomeRound([], 2)).toEqual([[2]]);
    expect(appendOutcomeRound([[0]], 1)).toEqual([[0], [1]]);
  });
});

describe("commitBetRound", () => {
  it("no-ops on empty selection", () => {
    const prev = [[0]];
    expect(commitBetRound(prev, [])).toBe(prev);
  });

  it("appends unique ids in selection order", () => {
    expect(commitBetRound([], [1, 0, 1])).toEqual([[1, 0]]);
  });
});

describe("undoRound", () => {
  it("pops the whole last round", () => {
    expect(undoRound([[0], [1, 2]])).toEqual([[0]]);
    expect(undoRound([])).toEqual([]);
  });
});

describe("togglePendingId", () => {
  it("toggles membership", () => {
    expect(togglePendingId([], 3)).toEqual([3]);
    expect(togglePendingId([3, 1], 3)).toEqual([1]);
    expect(togglePendingId([3], 1)).toEqual([3, 1]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/rounds.test.ts`  
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `lib/rounds.ts`**

```ts
import type { Round } from "./types";

export function appendOutcomeRound(rounds: Round[], id: number): Round[] {
  return [...rounds, [id]];
}

export function commitBetRound(rounds: Round[], ids: number[]): Round[] {
  if (ids.length === 0) return rounds;
  const unique: number[] = [];
  const seen = new Set<number>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push(id);
  }
  return [...rounds, unique];
}

export function undoRound(rounds: Round[]): Round[] {
  if (rounds.length === 0) return rounds;
  return rounds.slice(0, -1);
}

export function togglePendingId(pending: number[], id: number): number[] {
  if (pending.includes(id)) return pending.filter((x) => x !== id);
  return [...pending, id];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- __tests__/rounds.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/rounds.ts __tests__/rounds.test.ts
git commit -m "feat(odds): round append/undo and bet pending helpers"
```

---

### Task 4: Storage v2 + v1 migration

**Files:**
- Modify: `lib/storage.ts`
- Modify: `__tests__/storage.test.ts`

**Interfaces:**
- Consumes: `OddsState`, `Option`, `Round`, `TrackMode`, `TemplateId`; `defaultOptions`, `MIN_OPTIONS`, `MAX_OPTIONS`
- Produces:
  - `export const STORAGE_KEY = "onyx-odds:v2"`
  - `export const STORAGE_KEY_V1 = "onyx-odds:v1"`
  - `loadState(storage?: Storage | null): OddsState`
  - `saveState(state: OddsState, storage?: Storage | null): void` — writes **only** v2
  - Fallback: `{ templateId: null, trackMode: "outcome", options: defaultOptions(2), rounds: [], updatedAt }`
  - v1 map: `rounds = results.map(id => [id])`, `templateId: null`, `trackMode: "outcome"`; write v2 after migrate; leave v1 key intact
  - Option count outside 2–50 → fallback; corrupt JSON → fallback; empty round arrays dropped

- [ ] **Step 1: Rewrite `__tests__/storage.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  loadState,
  saveState,
  STORAGE_KEY,
  STORAGE_KEY_V1,
} from "@/lib/storage";
import type { OddsState } from "@/lib/types";

class MemoryStorage implements Storage {
  store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(k: string) {
    return this.store.has(k) ? this.store.get(k)! : null;
  }
  key(i: number) {
    return [...this.store.keys()][i] ?? null;
  }
  removeItem(k: string) {
    this.store.delete(k);
  }
  setItem(k: string, v: string) {
    this.store.set(k, v);
  }
}

describe("storage v2", () => {
  it("round-trips state", () => {
    const mem = new MemoryStorage();
    const state: OddsState = {
      templateId: null,
      trackMode: "outcome",
      options: [
        { id: 0, label: "A" },
        { id: 1, label: "B" },
      ],
      rounds: [[0], [1]],
      updatedAt: 1,
    };
    saveState(state, mem);
    expect(mem.getItem(STORAGE_KEY)).toBeTruthy();
    expect(loadState(mem)).toEqual(state);
  });

  it("falls back on corrupt JSON", () => {
    const mem = new MemoryStorage();
    mem.setItem(STORAGE_KEY, "{not-json");
    const s = loadState(mem);
    expect(s.templateId).toBeNull();
    expect(s.trackMode).toBe("outcome");
    expect(s.options).toHaveLength(2);
    expect(s.rounds).toEqual([]);
  });

  it("falls back when option count > 50", () => {
    const mem = new MemoryStorage();
    const options = Array.from({ length: 51 }, (_, id) => ({
      id,
      label: `X${id}`,
    }));
    mem.setItem(
      STORAGE_KEY,
      JSON.stringify({
        templateId: null,
        trackMode: "outcome",
        options,
        rounds: [],
        updatedAt: 1,
      }),
    );
    const s = loadState(mem);
    expect(s.options).toHaveLength(2);
    expect(s.rounds).toEqual([]);
  });

  it("migrates v1 results into singleton rounds as custom", () => {
    const mem = new MemoryStorage();
    mem.setItem(
      STORAGE_KEY_V1,
      JSON.stringify({
        options: [
          { id: 0, label: "莊" },
          { id: 1, label: "閒" },
        ],
        results: [0, 1, 0],
        updatedAt: 42,
      }),
    );
    const s = loadState(mem);
    expect(s.templateId).toBeNull();
    expect(s.trackMode).toBe("outcome");
    expect(s.options.map((o) => o.label)).toEqual(["莊", "閒"]);
    expect(s.rounds).toEqual([[0], [1], [0]]);
    expect(s.updatedAt).toBe(42);
    expect(mem.getItem(STORAGE_KEY)).toBeTruthy();
    expect(mem.getItem(STORAGE_KEY_V1)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/storage.test.ts`  
Expected: FAIL — still v1-shaped / missing migration.

- [ ] **Step 3: Implement `lib/storage.ts`**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- __tests__/storage.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/storage.ts __tests__/storage.test.ts
git commit -m "feat(odds): persist onyx-odds:v2 with v1 migration"
```

---

### Task 5: Baccarat + dragon-tiger template constants

**Files:**
- Create: `lib/templates/baccarat.ts`
- Create: `lib/templates/dragon-tiger.ts`
- Create: `__tests__/templates.test.ts` (partial; expanded in Task 6)

**Interfaces:**
- Consumes: `GameTemplate` from `lib/types.ts`; `MIN_OPTIONS`/`MAX_OPTIONS`
- Produces:
  - `export const baccaratTemplate: GameTemplate`
  - `export const dragonTigerTemplate: GameTemplate`
- Locked sets:
  - Baccarat outcome: 莊、閑、和 (ids 0–2)
  - Baccarat bet: 莊、閑、和、莊對、閑對 (ids 0–4)
  - Dragon Tiger outcome/bet: 龍、虎、和 (ids 0–2)

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import { MAX_OPTIONS, MIN_OPTIONS } from "@/lib/options";
import { baccaratTemplate } from "@/lib/templates/baccarat";
import { dragonTigerTemplate } from "@/lib/templates/dragon-tiger";
import type { GameTemplate } from "@/lib/types";

function assertTemplateShape(t: GameTemplate) {
  expect(t.outcomeOptions.length).toBeGreaterThanOrEqual(MIN_OPTIONS);
  expect(t.outcomeOptions.length).toBeLessThanOrEqual(MAX_OPTIONS);
  expect(t.betOptions.length).toBeGreaterThanOrEqual(MIN_OPTIONS);
  expect(t.betOptions.length).toBeLessThanOrEqual(MAX_OPTIONS);
  expect(t.payoutRows.length).toBeGreaterThan(0);
  t.outcomeOptions.forEach((o, i) => expect(o.id).toBe(i));
  t.betOptions.forEach((o, i) => expect(o.id).toBe(i));
  for (const row of t.payoutRows) {
    expect(row.label.length).toBeGreaterThan(0);
    expect(row.payout.length).toBeGreaterThan(0);
  }
}

describe("baccaratTemplate", () => {
  it("has locked outcome and bet sets", () => {
    assertTemplateShape(baccaratTemplate);
    expect(baccaratTemplate.outcomeOptions.map((o) => o.label)).toEqual([
      "莊",
      "閑",
      "和",
    ]);
    expect(baccaratTemplate.betOptions.map((o) => o.label)).toEqual([
      "莊",
      "閑",
      "和",
      "莊對",
      "閑對",
    ]);
    const labels = baccaratTemplate.payoutRows.map((r) => r.label);
    expect(labels).toEqual(
      expect.arrayContaining(["莊", "閑", "和", "莊對", "閑對"]),
    );
  });
});

describe("dragonTigerTemplate", () => {
  it("has locked dragon/tiger/tie sets", () => {
    assertTemplateShape(dragonTigerTemplate);
    expect(dragonTigerTemplate.outcomeOptions.map((o) => o.label)).toEqual([
      "龍",
      "虎",
      "和",
    ]);
    expect(dragonTigerTemplate.betOptions.map((o) => o.label)).toEqual([
      "龍",
      "虎",
      "和",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/templates.test.ts`  
Expected: FAIL — modules missing.

- [ ] **Step 3: Implement baccarat + dragon-tiger**

`lib/templates/baccarat.ts`:

```ts
import type { GameTemplate } from "@/lib/types";

export const baccaratTemplate: GameTemplate = {
  id: "baccarat",
  nameZh: "百家樂",
  nameEn: "Baccarat",
  outcomeOptions: [
    { id: 0, label: "莊" },
    { id: 1, label: "閑" },
    { id: 2, label: "和" },
  ],
  betOptions: [
    { id: 0, label: "莊" },
    { id: 1, label: "閑" },
    { id: 2, label: "和" },
    { id: 3, label: "莊對" },
    { id: 4, label: "閑對" },
  ],
  payoutRows: [
    {
      label: "莊",
      payout: "0.95:1",
      probability: "45.86%",
      houseEdge: "1.06%",
      note: "抽水制常見；免佣莊另計",
    },
    {
      label: "閑",
      payout: "1:1",
      probability: "44.62%",
      houseEdge: "1.24%",
    },
    {
      label: "和",
      payout: "8:1",
      probability: "9.52%",
      houseEdge: "14.36%",
      note: "部分桌 9:1",
    },
    {
      label: "莊對",
      payout: "11:1",
      probability: "7.47%",
      houseEdge: "10.36%",
    },
    {
      label: "閑對",
      payout: "11:1",
      probability: "7.47%",
      houseEdge: "10.36%",
    },
  ],
};
```

`lib/templates/dragon-tiger.ts`:

```ts
import type { GameTemplate } from "@/lib/types";

export const dragonTigerTemplate: GameTemplate = {
  id: "dragon-tiger",
  nameZh: "龍虎",
  nameEn: "Dragon Tiger",
  outcomeOptions: [
    { id: 0, label: "龍" },
    { id: 1, label: "虎" },
    { id: 2, label: "和" },
  ],
  betOptions: [
    { id: 0, label: "龍" },
    { id: 1, label: "虎" },
    { id: 2, label: "和" },
  ],
  payoutRows: [
    {
      label: "龍",
      payout: "1:1",
      probability: "48.63%",
      houseEdge: "3.73%",
      note: "和局常見為退半注或全退，視賭場",
    },
    {
      label: "虎",
      payout: "1:1",
      probability: "48.63%",
      houseEdge: "3.73%",
    },
    {
      label: "和",
      payout: "8:1",
      probability: "7.47%",
      houseEdge: "32.77%",
      note: "部分桌 11:1",
    },
  ],
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- __tests__/templates.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/templates/baccarat.ts lib/templates/dragon-tiger.ts __tests__/templates.test.ts
git commit -m "feat(odds): add baccarat and dragon-tiger templates"
```

---

### Task 6: European roulette + sic-bo + registry

**Files:**
- Create: `lib/templates/european-roulette.ts`
- Create: `lib/templates/sic-bo.ts`
- Create: `lib/templates/index.ts`
- Modify: `__tests__/templates.test.ts`

**Interfaces:**
- Produces:
  - `europeanRouletteTemplate`, `sicBoTemplate`
  - `TEMPLATES: Record<TemplateId, GameTemplate>`
  - `getTemplate(id: TemplateId): GameTemplate`
  - `optionsForTemplate(id: TemplateId, mode: TrackMode): Option[]`
  - `templateDisplayName(id: TemplateId | null): string`
  - `TEMPLATE_PICKER: { id: TemplateId | null; label: string }[]`
- Locked:
  - Roulette outcomes: `"0"`…`"36"` (37)
  - Roulette bets (12): 紅、黑、單、雙、小(1–18)、大(19–36)、第一打、第二打、第三打、第一列、第二列、第三列
  - Sic Bo outcomes: `"3"`…`"18"` (16)
  - Sic Bo bets (**39** ≤ 50): 大、小、單、雙 + 總點3–18 + 任意圍骰 + 圍骰1–6 + 雙骰1–6 + 單骰1–6 (1/2/3-dice payout tiers only in `payoutRows`)

- [ ] **Step 1: Replace `__tests__/templates.test.ts` with full registry tests**

```ts
import { describe, expect, it } from "vitest";
import { MAX_OPTIONS, MIN_OPTIONS } from "@/lib/options";
import {
  TEMPLATES,
  TEMPLATE_PICKER,
  getTemplate,
  optionsForTemplate,
  templateDisplayName,
} from "@/lib/templates";
import type { GameTemplate, TemplateId } from "@/lib/types";

function assertTemplateShape(t: GameTemplate) {
  expect(t.outcomeOptions.length).toBeGreaterThanOrEqual(MIN_OPTIONS);
  expect(t.outcomeOptions.length).toBeLessThanOrEqual(MAX_OPTIONS);
  expect(t.betOptions.length).toBeGreaterThanOrEqual(MIN_OPTIONS);
  expect(t.betOptions.length).toBeLessThanOrEqual(MAX_OPTIONS);
  expect(t.payoutRows.length).toBeGreaterThan(0);
  t.outcomeOptions.forEach((o, i) => expect(o.id).toBe(i));
  t.betOptions.forEach((o, i) => expect(o.id).toBe(i));
}

const IDS: TemplateId[] = [
  "baccarat",
  "dragon-tiger",
  "european-roulette",
  "sic-bo",
];

describe("TEMPLATES registry", () => {
  it("registers all four games within option caps", () => {
    for (const id of IDS) {
      assertTemplateShape(TEMPLATES[id]);
      expect(getTemplate(id).id).toBe(id);
    }
    expect(TEMPLATE_PICKER.map((p) => p.id)).toEqual([
      null,
      "baccarat",
      "dragon-tiger",
      "european-roulette",
      "sic-bo",
    ]);
    expect(templateDisplayName(null)).toBe("自訂");
    expect(templateDisplayName("baccarat")).toBe("百家樂");
  });

  it("european roulette has 37 outcomes and 12 bet options", () => {
    const t = TEMPLATES["european-roulette"];
    expect(t.outcomeOptions).toHaveLength(37);
    expect(t.outcomeOptions[0].label).toBe("0");
    expect(t.outcomeOptions[36].label).toBe("36");
    expect(t.betOptions.map((o) => o.label)).toEqual([
      "紅",
      "黑",
      "單",
      "雙",
      "小(1–18)",
      "大(19–36)",
      "第一打",
      "第二打",
      "第三打",
      "第一列",
      "第二列",
      "第三列",
    ]);
    const labels = t.payoutRows.map((r) => r.label);
    expect(labels).toEqual(
      expect.arrayContaining([
        "直注",
        "分注",
        "街注",
        "角注",
        "線注",
        "列注",
        "打注",
        "紅／黑",
        "單／雙",
        "小／大",
      ]),
    );
  });

  it("sic bo has totals 3–18 outcomes and 39 bet options", () => {
    const t = TEMPLATES["sic-bo"];
    expect(t.outcomeOptions).toHaveLength(16);
    expect(t.outcomeOptions[0].label).toBe("3");
    expect(t.outcomeOptions[15].label).toBe("18");
    expect(t.betOptions).toHaveLength(39);
    expect(t.betOptions.map((o) => o.label)).toEqual(
      expect.arrayContaining([
        "大",
        "小",
        "單",
        "雙",
        "任意圍骰",
        "圍骰1",
        "雙骰1",
        "單骰1",
      ]),
    );
  });

  it("optionsForTemplate switches by mode", () => {
    expect(optionsForTemplate("baccarat", "outcome")).toHaveLength(3);
    expect(optionsForTemplate("baccarat", "bet")).toHaveLength(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/templates.test.ts`  
Expected: FAIL — roulette/sic-bo/index missing.

- [ ] **Step 3: Implement european-roulette, sic-bo, index**

`lib/templates/european-roulette.ts`:

```ts
import type { GameTemplate, Option, PayoutRow } from "@/lib/types";

const outcomeOptions: Option[] = Array.from({ length: 37 }, (_, id) => ({
  id,
  label: String(id),
}));

const betOptions: Option[] = [
  { id: 0, label: "紅" },
  { id: 1, label: "黑" },
  { id: 2, label: "單" },
  { id: 3, label: "雙" },
  { id: 4, label: "小(1–18)" },
  { id: 5, label: "大(19–36)" },
  { id: 6, label: "第一打" },
  { id: 7, label: "第二打" },
  { id: 8, label: "第三打" },
  { id: 9, label: "第一列" },
  { id: 10, label: "第二列" },
  { id: 11, label: "第三列" },
];

const payoutRows: PayoutRow[] = [
  {
    label: "直注",
    payout: "35:1",
    probability: "2.70%",
    houseEdge: "2.70%",
    note: "單一號碼 0–36",
  },
  {
    label: "分注",
    payout: "17:1",
    probability: "5.41%",
    houseEdge: "2.70%",
  },
  {
    label: "街注",
    payout: "11:1",
    probability: "8.11%",
    houseEdge: "2.70%",
  },
  {
    label: "角注",
    payout: "8:1",
    probability: "10.81%",
    houseEdge: "2.70%",
  },
  {
    label: "線注",
    payout: "5:1",
    probability: "16.22%",
    houseEdge: "2.70%",
    note: "六號／雙街",
  },
  {
    label: "列注",
    payout: "2:1",
    probability: "32.43%",
    houseEdge: "2.70%",
  },
  {
    label: "打注",
    payout: "2:1",
    probability: "32.43%",
    houseEdge: "2.70%",
  },
  {
    label: "紅／黑",
    payout: "1:1",
    probability: "48.65%",
    houseEdge: "2.70%",
    note: "歐式單零；美式雙零莊家優勢更高",
  },
  {
    label: "單／雙",
    payout: "1:1",
    probability: "48.65%",
    houseEdge: "2.70%",
  },
  {
    label: "小／大",
    payout: "1:1",
    probability: "48.65%",
    houseEdge: "2.70%",
    note: "小 1–18／大 19–36",
  },
];

export const europeanRouletteTemplate: GameTemplate = {
  id: "european-roulette",
  nameZh: "歐式輪盤",
  nameEn: "European Roulette",
  outcomeOptions,
  betOptions,
  payoutRows,
};
```

`lib/templates/sic-bo.ts`:

```ts
import type { GameTemplate, Option, PayoutRow } from "@/lib/types";

const outcomeOptions: Option[] = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  label: String(i + 3),
}));

const betOptions: Option[] = [
  { id: 0, label: "大" },
  { id: 1, label: "小" },
  { id: 2, label: "單" },
  { id: 3, label: "雙" },
  ...Array.from({ length: 16 }, (_, i) => ({
    id: 4 + i,
    label: `總點${i + 3}`,
  })),
  { id: 20, label: "任意圍骰" },
  ...Array.from({ length: 6 }, (_, i) => ({
    id: 21 + i,
    label: `圍骰${i + 1}`,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: 27 + i,
    label: `雙骰${i + 1}`,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: 33 + i,
    label: `單骰${i + 1}`,
  })),
]; // length 39

const totalPayouts: {
  n: number;
  payout: string;
  probability: string;
  houseEdge: string;
}[] = [
  { n: 3, payout: "180:1", probability: "0.46%", houseEdge: "16.20%" },
  { n: 4, payout: "60:1", probability: "1.39%", houseEdge: "15.28%" },
  { n: 5, payout: "30:1", probability: "2.78%", houseEdge: "13.89%" },
  { n: 6, payout: "18:1", probability: "4.63%", houseEdge: "11.57%" },
  { n: 7, payout: "12:1", probability: "6.94%", houseEdge: "9.72%" },
  { n: 8, payout: "8:1", probability: "9.72%", houseEdge: "12.50%" },
  { n: 9, payout: "6:1", probability: "11.57%", houseEdge: "18.98%" },
  { n: 10, payout: "6:1", probability: "12.50%", houseEdge: "12.50%" },
  { n: 11, payout: "6:1", probability: "12.50%", houseEdge: "12.50%" },
  { n: 12, payout: "6:1", probability: "11.57%", houseEdge: "18.98%" },
  { n: 13, payout: "8:1", probability: "9.72%", houseEdge: "12.50%" },
  { n: 14, payout: "12:1", probability: "6.94%", houseEdge: "9.72%" },
  { n: 15, payout: "18:1", probability: "4.63%", houseEdge: "11.57%" },
  { n: 16, payout: "30:1", probability: "2.78%", houseEdge: "13.89%" },
  { n: 17, payout: "60:1", probability: "1.39%", houseEdge: "15.28%" },
  { n: 18, payout: "180:1", probability: "0.46%", houseEdge: "16.20%" },
];

const payoutRows: PayoutRow[] = [
  {
    label: "大",
    payout: "1:1",
    probability: "48.61%",
    houseEdge: "2.78%",
    note: "11–17；圍骰通殺常見",
  },
  {
    label: "小",
    payout: "1:1",
    probability: "48.61%",
    houseEdge: "2.78%",
    note: "4–10；圍骰通殺常見",
  },
  {
    label: "單",
    payout: "1:1",
    probability: "48.61%",
    houseEdge: "2.78%",
    note: "常見規則；圍骰處理視賭場",
  },
  {
    label: "雙",
    payout: "1:1",
    probability: "48.61%",
    houseEdge: "2.78%",
  },
  ...totalPayouts.map((t) => ({
    label: `總點${t.n}`,
    payout: t.payout,
    probability: t.probability,
    houseEdge: t.houseEdge,
  })),
  {
    label: "任意圍骰",
    payout: "30:1",
    probability: "2.78%",
    houseEdge: "13.89%",
  },
  {
    label: "指定圍骰",
    payout: "150:1",
    probability: "0.46%",
    houseEdge: "30.09%",
    note: "部分桌 180:1",
  },
  {
    label: "指定雙骰",
    payout: "8:1",
    probability: "7.41%",
    houseEdge: "33.33%",
    note: "常見 8:1 或 10:1",
  },
  {
    label: "指定單骰（一骰）",
    payout: "1:1",
    probability: "34.72%",
    houseEdge: "7.87%",
    note: "出現一次",
  },
  {
    label: "指定單骰（兩骰）",
    payout: "2:1",
    note: "出現兩次；機率／優勢視規則",
  },
  {
    label: "指定單骰（三骰）",
    payout: "3:1",
    note: "出現三次；機率／優勢視規則",
  },
];

export const sicBoTemplate: GameTemplate = {
  id: "sic-bo",
  nameZh: "骰寶",
  nameEn: "Sic Bo",
  outcomeOptions,
  betOptions,
  payoutRows,
};
```

`lib/templates/index.ts`:

```ts
import type { GameTemplate, Option, TemplateId, TrackMode } from "@/lib/types";
import { baccaratTemplate } from "./baccarat";
import { dragonTigerTemplate } from "./dragon-tiger";
import { europeanRouletteTemplate } from "./european-roulette";
import { sicBoTemplate } from "./sic-bo";

export const TEMPLATES: Record<TemplateId, GameTemplate> = {
  baccarat: baccaratTemplate,
  "dragon-tiger": dragonTigerTemplate,
  "european-roulette": europeanRouletteTemplate,
  "sic-bo": sicBoTemplate,
};

export const TEMPLATE_PICKER: { id: TemplateId | null; label: string }[] = [
  { id: null, label: "自訂" },
  { id: "baccarat", label: "百家樂" },
  { id: "dragon-tiger", label: "龍虎" },
  { id: "european-roulette", label: "歐式輪盤" },
  { id: "sic-bo", label: "骰寶" },
];

export function getTemplate(id: TemplateId): GameTemplate {
  return TEMPLATES[id];
}

export function optionsForTemplate(
  id: TemplateId,
  mode: TrackMode,
): Option[] {
  const t = TEMPLATES[id];
  const src = mode === "bet" ? t.betOptions : t.outcomeOptions;
  return src.map((o) => ({ ...o }));
}

export function templateDisplayName(id: TemplateId | null): string {
  if (id === null) return "自訂";
  return TEMPLATES[id].nameZh;
}

export {
  baccaratTemplate,
  dragonTigerTemplate,
  europeanRouletteTemplate,
  sicBoTemplate,
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- __tests__/templates.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/templates/ __tests__/templates.test.ts
git commit -m "feat(odds): add roulette, sic-bo templates and registry"
```

---

### Task 7: Switch helpers + export rounds

**Files:**
- Create: `lib/switch.ts`
- Create: `__tests__/switch.test.ts`
- Modify: `lib/export.ts`
- Modify: `__tests__/export.test.ts`

**Interfaces:**
- Consumes: `OddsState`, `TemplateId`, `TrackMode`; `optionsForTemplate`, `templateDisplayName`; `defaultOptions`
- Produces:
  - `applyTemplate(state, templateId: TemplateId | null): OddsState` — custom keeps N via `defaultOptions(n)`; template loads outcome options + `trackMode: "outcome"`; **always clears rounds**
  - `applyTrackMode(state, mode: TrackMode): OddsState` — template swaps options; custom keeps options; **clears rounds**
  - `exportRoundsText({ templateId, trackMode, options, rounds }): string` — header `自訂|nameZh · 結果|注項`, then one line per round (`label` or `a+b+c`)

- [ ] **Step 1: Write failing switch + export tests**

`__tests__/switch.test.ts`:

```ts
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
});
```

`__tests__/export.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { exportRoundsText } from "@/lib/export";

describe("exportRoundsText", () => {
  it("exports custom outcome rounds", () => {
    const text = exportRoundsText({
      templateId: null,
      trackMode: "outcome",
      options: [
        { id: 0, label: "莊" },
        { id: 1, label: "閑" },
      ],
      rounds: [[0], [1], [0]],
    });
    expect(text.split("\n")[0]).toBe("自訂 · 結果");
    expect(text).toContain("莊\n閑\n莊");
  });

  it("exports bet multi-id rounds with +", () => {
    const text = exportRoundsText({
      templateId: "baccarat",
      trackMode: "bet",
      options: [
        { id: 0, label: "莊" },
        { id: 1, label: "閑" },
        { id: 2, label: "和" },
        { id: 3, label: "莊對" },
        { id: 4, label: "閑對" },
      ],
      rounds: [
        [0, 3],
        [1],
      ],
    });
    expect(text.split("\n")[0]).toBe("百家樂 · 注項");
    expect(text).toContain("莊+莊對");
    expect(text).toContain("閑");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- __tests__/switch.test.ts __tests__/export.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement `lib/switch.ts` and `lib/export.ts`**

```ts
// lib/switch.ts
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
```

```ts
// lib/export.ts
import { templateDisplayName } from "./templates";
import type { Option, Round, TemplateId, TrackMode } from "./types";

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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- __tests__/switch.test.ts __tests__/export.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/switch.ts lib/export.ts __tests__/switch.test.ts __tests__/export.test.ts
git commit -m "feat(odds): template/mode switch helpers and rounds export"
```

---

### Task 8: Paste bet-mode contract + help text

**Files:**
- Modify: `__tests__/paste.test.ts`
- Modify: `components/PasteInput.tsx`
- Leave: `lib/paste.ts` API unchanged (`parsePaste` → `{ ok, ids }`; callers wrap `ids.map(id => [id])`)

**Interfaces:**
- Produces: PasteInput optional `trackMode?: TrackMode`; bet help copy documents singleton-round paste

- [ ] **Step 1: Add documentation test to `__tests__/paste.test.ts`**

Append:

```ts
describe("parsePaste bet-mode caller contract", () => {
  it("returns flat ids that callers wrap as singleton rounds", () => {
    const opts = [
      { id: 0, label: "莊" },
      { id: 1, label: "閑" },
    ];
    const r = parsePaste("莊 閑 莊", opts);
    expect(r).toEqual({ ok: true, ids: [0, 1, 0] });
    if (r.ok) {
      expect(r.ids.map((id) => [id])).toEqual([[0], [1], [0]]);
    }
  });
});
```

- [ ] **Step 2: Run paste tests**

Run: `npm test -- __tests__/paste.test.ts`  
Expected: PASS (no `paste.ts` change required).

- [ ] **Step 3: Update `components/PasteInput.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { TrackMode } from "@/lib/types";

type Props = {
  error: string | null;
  trackMode?: TrackMode;
  onApply: (text: string) => boolean;
};

export function PasteInput({ error, trackMode = "outcome", onApply }: Props) {
  const [text, setText] = useState("");
  const help =
    trackMode === "bet"
      ? "注項模式：每個符號各自成為一局（單選項）；多選同局請用上方按鈕＋記入本局。逗號／空白／換行；標籤或 1-based 編號。"
      : "貼上結果（逗號／空白／換行；標籤或 1-based 編號）";

  return (
    <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <label className="block text-sm text-zinc-400" htmlFor="paste-input">
        {help}
      </label>
      <textarea
        id="paste-input"
        className="min-h-24 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-base text-zinc-100 outline-none focus:border-sky-500"
        value={text}
        placeholder="例如：1,2,1 或 A B A"
        onChange={(e) => setText(e.target.value)}
      />
      {error ? (
        <p className="text-sm text-rose-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        className="min-h-12 rounded-lg bg-sky-600 px-4 text-base font-medium text-white hover:bg-sky-500"
        onClick={() => {
          if (onApply(text)) setText("");
        }}
      >
        套用貼上
      </button>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add __tests__/paste.test.ts components/PasteInput.tsx
git commit -m "docs(odds): clarify paste singleton rounds in bet mode"
```

---

### Task 9: PayoutTable + Disclaimer

**Files:**
- Create: `components/PayoutTable.tsx`
- Modify: `components/Disclaimer.tsx`

**Interfaces:**
- `PayoutTable({ rows: PayoutRow[] | null })` — `null` →「自訂模式無內建賠率表」; else columns 注項｜賠率｜理論機率｜莊家優勢｜備註; missing → `—`; footnote「常見規則／僅供參考」
- `Disclaimer` uses extended Global Constraints copy

- [ ] **Step 1: Update Disclaimer**

```tsx
export function Disclaimer() {
  return (
    <p className="disclaimer text-sm text-amber-100/95 leading-snug">
      歷史統計僅供參考，不影響真實下一局機率。賠率表為常見規則整理，實際賭場可能不同；本工具不提供結果保證，亦不鼓勵賭博。
    </p>
  );
}
```

- [ ] **Step 2: Create PayoutTable**

```tsx
"use client";

import type { PayoutRow } from "@/lib/types";

type Props = { rows: PayoutRow[] | null };

function cell(v: string | undefined): string {
  return v && v.length > 0 ? v : "—";
}

export function PayoutTable({ rows }: Props) {
  if (rows === null) {
    return (
      <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="text-sm font-medium text-zinc-400">賠率表</h2>
        <p className="text-sm text-zinc-500">自訂模式無內建賠率表</p>
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-zinc-400">賠率表</h2>
        <span className="text-xs text-zinc-500">常見規則／僅供參考</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-3 py-2 font-medium">注項</th>
              <th className="px-3 py-2 font-medium">賠率</th>
              <th className="px-3 py-2 font-medium">理論機率</th>
              <th className="px-3 py-2 font-medium">莊家優勢</th>
              <th className="px-3 py-2 font-medium">備註</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.label}-${row.payout}`}
                className="border-t border-zinc-800 odd:bg-zinc-950/40"
              >
                <td className="px-3 py-2 font-medium text-zinc-100">
                  {row.label}
                </td>
                <td className="px-3 py-2 tabular-nums">{row.payout}</td>
                <td className="px-3 py-2 tabular-nums">
                  {cell(row.probability)}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {cell(row.houseEdge)}
                </td>
                <td className="px-3 py-2 text-zinc-400">{cell(row.note)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/PayoutTable.tsx components/Disclaimer.tsx
git commit -m "feat(odds): PayoutTable and extended disclaimer"
```

---

### Task 10: SetupPanel — game picker + mode toggle

**Files:**
- Modify: `components/SetupPanel.tsx`

**Interfaces:**
- Props:
  ```ts
  type Props = {
    templateId: TemplateId | null;
    trackMode: TrackMode;
    options: Option[];
    onSelectTemplate: (id: TemplateId | null) => void;
    onSelectTrackMode: (mode: TrackMode) => void;
    onChangeN: (n: number) => void;
    onRenameChange: (id: number, label: string) => void;
    onRenameCommit: (id: number, label: string) => void;
  };
  ```
- Custom only: N stepper 2–50. Template: labels still editable. Mode buttons: **結果（互斥）** / **注項（可多選）**.

- [ ] **Step 1: Rewrite SetupPanel**

```tsx
"use client";

import { MAX_OPTIONS, MIN_OPTIONS } from "@/lib/options";
import { TEMPLATE_PICKER } from "@/lib/templates";
import type { Option, TemplateId, TrackMode } from "@/lib/types";

type Props = {
  templateId: TemplateId | null;
  trackMode: TrackMode;
  options: Option[];
  onSelectTemplate: (id: TemplateId | null) => void;
  onSelectTrackMode: (mode: TrackMode) => void;
  onChangeN: (n: number) => void;
  onRenameChange: (id: number, label: string) => void;
  onRenameCommit: (id: number, label: string) => void;
};

export function SetupPanel({
  templateId,
  trackMode,
  options,
  onSelectTemplate,
  onSelectTrackMode,
  onChangeN,
  onRenameChange,
  onRenameCommit,
}: Props) {
  const n = options.length;
  const counts = Array.from(
    { length: MAX_OPTIONS - MIN_OPTIONS + 1 },
    (_, i) => MIN_OPTIONS + i,
  );
  const canDec = n > MIN_OPTIONS;
  const canInc = n < MAX_OPTIONS;
  const isCustom = templateId === null;

  return (
    <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="space-y-2">
        <span className="text-sm text-zinc-400">遊戲</span>
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_PICKER.map((p) => {
            const active = p.id === templateId;
            return (
              <button
                key={String(p.id)}
                type="button"
                className={`min-h-12 rounded-lg border px-3 text-sm ${
                  active
                    ? "border-sky-500 bg-sky-950 text-sky-100"
                    : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500"
                }`}
                aria-pressed={active}
                onClick={() => onSelectTemplate(p.id)}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm text-zinc-400">追蹤模式</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="追蹤模式">
          {(
            [
              ["outcome", "結果（互斥）"],
              ["bet", "注項（可多選）"],
            ] as const
          ).map(([mode, label]) => {
            const active = trackMode === mode;
            return (
              <button
                key={mode}
                type="button"
                className={`min-h-12 rounded-lg border px-3 text-sm ${
                  active
                    ? "border-sky-500 bg-sky-950 text-sky-100"
                    : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500"
                }`}
                aria-pressed={active}
                onClick={() => onSelectTrackMode(mode)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {isCustom ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-zinc-400" id="option-count-label">
            選項數
          </span>
          <div
            className="flex items-center gap-1"
            role="group"
            aria-labelledby="option-count-label"
          >
            <button
              type="button"
              className="flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 text-xl text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="減少選項數"
              disabled={!canDec}
              onClick={() => onChangeN(n - 1)}
            >
              −
            </button>
            <select
              id="option-count"
              key={n}
              className="min-h-12 min-w-[4.5rem] rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-center text-base text-zinc-100"
              value={n}
              aria-label="選項數"
              onChange={(e) => {
                const next = Number(e.target.value);
                if (
                  !Number.isInteger(next) ||
                  next < MIN_OPTIONS ||
                  next > MAX_OPTIONS
                ) {
                  return;
                }
                onChangeN(next);
              }}
            >
              {counts.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 text-xl text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="增加選項數"
              disabled={!canInc}
              onClick={() => onChangeN(n + 1)}
            >
              +
            </button>
          </div>
        </div>
      ) : null}

      <ul className="grid gap-2 sm:grid-cols-2">
        {options.map((o, index) => (
          <li key={o.id} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-center text-xs text-zinc-500">
              {index + 1}
            </span>
            <input
              type="text"
              className="min-h-12 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-base text-zinc-100 outline-none focus:border-sky-500"
              value={o.label}
              aria-label={`選項 ${index + 1} 名稱`}
              onChange={(e) => onRenameChange(o.id, e.target.value)}
              onBlur={(e) => onRenameCommit(o.id, e.target.value)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/SetupPanel.tsx
git commit -m "feat(odds): SetupPanel game picker and track mode toggle"
```

---

### Task 11: ResultButtons bet UX + Road grouped chips

**Files:**
- Modify: `components/ResultButtons.tsx`
- Modify: `components/Road.tsx`

**Interfaces:**
- `ResultButtons`: outcome tap → `onPickOutcome`; bet toggle via `pendingIds` + **記入本局** when non-empty; undo label **撤銷上一局**
- `Road`: `{ options, rounds: Round[] }` — each round a bordered chip group

- [ ] **Step 1: Rewrite ResultButtons**

```tsx
"use client";

import type { Option, TrackMode } from "@/lib/types";

type Props = {
  options: Option[];
  trackMode: TrackMode;
  pendingIds: number[];
  canUndo: boolean;
  onPickOutcome: (id: number) => void;
  onToggleBet: (id: number) => void;
  onCommitBet: () => void;
  onUndo: () => void;
};

export function ResultButtons({
  options,
  trackMode,
  pendingIds,
  canUndo,
  onPickOutcome,
  onToggleBet,
  onCommitBet,
  onUndo,
}: Props) {
  const pending = new Set(pendingIds);
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-zinc-400">
        {trackMode === "bet" ? "選擇注項" : "記錄結果"}
      </h2>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = pending.has(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={trackMode === "bet" ? selected : undefined}
              className={`min-h-12 min-w-[4.5rem] flex-1 rounded-xl border px-4 text-base font-medium active:scale-[0.98] ${
                trackMode === "bet" && selected
                  ? "border-sky-400 bg-sky-900 text-sky-50"
                  : "border-zinc-600 bg-zinc-800 text-zinc-50 hover:border-sky-500 hover:bg-zinc-700"
              }`}
              onClick={() =>
                trackMode === "bet"
                  ? onToggleBet(o.id)
                  : onPickOutcome(o.id)
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {trackMode === "bet" ? (
          <button
            type="button"
            className="min-h-12 rounded-lg bg-sky-600 px-4 text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-sky-500"
            disabled={pendingIds.length === 0}
            onClick={onCommitBet}
          >
            記入本局
          </button>
        ) : null}
        <button
          type="button"
          className="min-h-12 rounded-lg border border-zinc-700 px-4 text-base text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:border-zinc-500"
          disabled={!canUndo}
          onClick={onUndo}
        >
          撤銷上一局
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Rewrite Road**

```tsx
"use client";

import type { Option, Round } from "@/lib/types";

type Props = {
  options: Option[];
  rounds: Round[];
};

export function Road({ options, rounds }: Props) {
  const map = new Map(options.map((o) => [o.id, o.label]));

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium text-zinc-400">路單</h2>
      {rounds.length === 0 ? (
        <p className="text-sm text-zinc-500">尚無結果</p>
      ) : (
        <div className="road-scroll flex gap-2 overflow-x-auto pb-1">
          {rounds.map((round, i) => (
            <div
              key={`${i}-${round.join("-")}`}
              className="inline-flex shrink-0 items-center gap-1 rounded-2xl border border-zinc-600 bg-zinc-900/80 p-1"
            >
              {round.map((id, j) => (
                <span
                  key={`${i}-${j}-${id}`}
                  className="road-chip inline-flex min-h-9 items-center rounded-full border border-zinc-600 bg-zinc-800 px-3 text-sm text-zinc-100"
                >
                  {map.get(id) ?? String(id + 1)}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ResultButtons.tsx components/Road.tsx
git commit -m "feat(odds): bet multi-select commit UX and grouped road chips"
```

---

### Task 12: Wire OddsApp end-to-end

**Files:**
- Modify: `components/OddsApp.tsx`

**Interfaces:**
- State: `templateId`, `trackMode`, `options`, `rounds`, `pendingIds`, hydration, paste/export msgs, `nSelectEpoch`
- Confirm: template switch / mode switch / N change clear rounds when data present
- Paste → singleton rounds; export → `exportRoundsText`; payout from `getTemplate`
- Reset → custom 2 / outcome / empty

- [ ] **Step 1: Rewrite `components/OddsApp.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Disclaimer } from "@/components/Disclaimer";
import { PasteInput } from "@/components/PasteInput";
import { PayoutTable } from "@/components/PayoutTable";
import { ReferenceBanner } from "@/components/ReferenceBanner";
import { ResultButtons } from "@/components/ResultButtons";
import { Road } from "@/components/Road";
import { SetupPanel } from "@/components/SetupPanel";
import { StatsTable } from "@/components/StatsTable";
import { exportRoundsText } from "@/lib/export";
import {
  MAX_OPTIONS,
  MIN_OPTIONS,
  defaultOptions,
  renameOption,
  resizeOptions,
} from "@/lib/options";
import { parsePaste } from "@/lib/paste";
import {
  appendOutcomeRound,
  commitBetRound,
  togglePendingId,
  undoRound,
} from "@/lib/rounds";
import { computeStats } from "@/lib/stats";
import { loadState, saveState } from "@/lib/storage";
import { applyTemplate, applyTrackMode } from "@/lib/switch";
import { getTemplate } from "@/lib/templates";
import type { Option, Round, TemplateId, TrackMode } from "@/lib/types";

export function OddsApp() {
  const [templateId, setTemplateId] = useState<TemplateId | null>(null);
  const [trackMode, setTrackMode] = useState<TrackMode>("outcome");
  const [options, setOptions] = useState<Option[]>(() => defaultOptions(2));
  const [rounds, setRounds] = useState<Round[]>([]);
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [nSelectEpoch, setNSelectEpoch] = useState(0);

  useEffect(() => {
    const state = loadState();
    setTemplateId(state.templateId);
    setTrackMode(state.trackMode);
    setOptions(state.options);
    setRounds(state.rounds);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({
      templateId,
      trackMode,
      options,
      rounds,
      updatedAt: Date.now(),
    });
  }, [templateId, trackMode, options, rounds, hydrated]);

  const stats = useMemo(
    () => computeStats(options, rounds),
    [options, rounds],
  );

  const payoutRows =
    templateId === null ? null : getTemplate(templateId).payoutRows;

  const handleSelectTemplate = useCallback(
    (id: TemplateId | null) => {
      if (id === templateId) return;
      if (rounds.length > 0) {
        const ok = window.confirm("確定切換遊戲並清空目前紀錄？");
        if (!ok) return;
      }
      const next = applyTemplate(
        { templateId, trackMode, options, rounds, updatedAt: Date.now() },
        id,
      );
      setTemplateId(next.templateId);
      setTrackMode(next.trackMode);
      setOptions(next.options);
      setRounds(next.rounds);
      setPendingIds([]);
      setPasteError(null);
    },
    [templateId, trackMode, options, rounds],
  );

  const handleSelectTrackMode = useCallback(
    (mode: TrackMode) => {
      if (mode === trackMode) return;
      if (rounds.length > 0) {
        const ok = window.confirm("確定切換追蹤模式並清空目前紀錄？");
        if (!ok) return;
      }
      const next = applyTrackMode(
        { templateId, trackMode, options, rounds, updatedAt: Date.now() },
        mode,
      );
      setTrackMode(next.trackMode);
      setOptions(next.options);
      setRounds(next.rounds);
      setPendingIds([]);
      setPasteError(null);
    },
    [templateId, trackMode, options, rounds],
  );

  const handleChangeN = useCallback(
    (n: number) => {
      if (
        templateId !== null ||
        !Number.isInteger(n) ||
        n < MIN_OPTIONS ||
        n > MAX_OPTIONS ||
        n === options.length
      ) {
        return;
      }
      const ok = window.confirm(
        "變更選項數會清空目前所有結果，確定繼續？",
      );
      if (!ok) {
        setNSelectEpoch((e) => e + 1);
        return;
      }
      const { options: next } = resizeOptions(options, n);
      setOptions(next);
      setRounds([]);
      setPendingIds([]);
      setPasteError(null);
    },
    [options, templateId],
  );

  const handleRenameChange = useCallback((id: number, label: string) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, label } : o)),
    );
  }, []);

  const handleRenameCommit = useCallback((id: number, label: string) => {
    setOptions((prev) => renameOption(prev, id, label));
  }, []);

  const handlePickOutcome = useCallback((id: number) => {
    setRounds((prev) => appendOutcomeRound(prev, id));
    setPasteError(null);
  }, []);

  const handleToggleBet = useCallback((id: number) => {
    setPendingIds((prev) => togglePendingId(prev, id));
  }, []);

  const handleCommitBet = useCallback(() => {
    setRounds((prev) => commitBetRound(prev, pendingIds));
    setPendingIds([]);
    setPasteError(null);
  }, [pendingIds]);

  const handleUndo = useCallback(() => {
    setRounds((prev) => undoRound(prev));
  }, []);

  const handlePasteApply = useCallback(
    (text: string): boolean => {
      const parsed = parsePaste(text, options);
      if (!parsed.ok) {
        setPasteError(parsed.error);
        return false;
      }
      setPasteError(null);
      if (parsed.ids.length > 0) {
        setRounds((prev) => [...prev, ...parsed.ids.map((id) => [id])]);
      }
      return true;
    },
    [options],
  );

  const handleClear = useCallback(() => {
    if (rounds.length === 0) return;
    const ok = window.confirm("確定清空所有結果？（選項會保留）");
    if (!ok) return;
    setRounds([]);
    setPendingIds([]);
    setPasteError(null);
  }, [rounds.length]);

  const handleResetAll = useCallback(() => {
    const ok = window.confirm("確定重設為預設 2 選項並清空結果？");
    if (!ok) return;
    setTemplateId(null);
    setTrackMode("outcome");
    setOptions(defaultOptions(2));
    setRounds([]);
    setPendingIds([]);
    setPasteError(null);
  }, []);

  const handleExport = useCallback(async () => {
    const text = exportRoundsText({
      templateId,
      trackMode,
      options,
      rounds,
    });
    setExportMsg(null);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setExportMsg(
          rounds.length > 0
            ? "已複製到剪貼簿"
            : "尚無結果可匯出（已複製標題）",
        );
        return;
      }
      throw new Error("clipboard unavailable");
    } catch {
      window.prompt("複製以下文字：", text);
      setExportMsg("請手動複製上方文字");
    }
  }, [templateId, trackMode, options, rounds]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-4 px-4 py-5 sm:gap-5 sm:px-6 sm:py-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Odds
          </h1>
          <span className="text-xs uppercase tracking-wider text-zinc-500">
            Onyx Labs
          </span>
        </div>
        <p className="text-sm text-zinc-400">
          賭場模板／自訂統計 · 非保證預測
        </p>
        <Disclaimer />
      </header>

      <SetupPanel
        key={`${templateId ?? "custom"}-${options.length}-${nSelectEpoch}`}
        templateId={templateId}
        trackMode={trackMode}
        options={options}
        onSelectTemplate={handleSelectTemplate}
        onSelectTrackMode={handleSelectTrackMode}
        onChangeN={handleChangeN}
        onRenameChange={handleRenameChange}
        onRenameCommit={handleRenameCommit}
      />

      <ReferenceBanner options={options} stats={stats} />

      <ResultButtons
        options={options}
        trackMode={trackMode}
        pendingIds={pendingIds}
        canUndo={rounds.length > 0}
        onPickOutcome={handlePickOutcome}
        onToggleBet={handleToggleBet}
        onCommitBet={handleCommitBet}
        onUndo={handleUndo}
      />

      <PasteInput
        error={pasteError}
        trackMode={trackMode}
        onApply={handlePasteApply}
      />

      <PayoutTable rows={payoutRows} />

      <Road options={options} rounds={rounds} />

      <StatsTable stats={stats} />

      <footer className="flex flex-wrap gap-2 border-t border-zinc-800 pt-4 pb-8">
        <button
          type="button"
          className="min-h-12 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 hover:border-zinc-500"
          onClick={handleClear}
        >
          清空結果
        </button>
        <button
          type="button"
          className="min-h-12 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 hover:border-zinc-500"
          onClick={handleExport}
        >
          匯出文字
        </button>
        <button
          type="button"
          className="min-h-12 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-500 hover:border-zinc-500"
          onClick={handleResetAll}
        >
          全部重設
        </button>
        {exportMsg ? (
          <span className="w-full text-xs text-sky-300">{exportMsg}</span>
        ) : null}
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Run full test + build**

Run: `npm test && npm run build`  
Expected: all tests PASS; Next.js build succeeds. Fix any leftover `results` references if TypeScript errors appear.

- [ ] **Step 3: Commit**

```bash
git add components/OddsApp.tsx
git commit -m "feat(odds): wire templates, track modes, and payout table in OddsApp"
```

---

### Task 13: README + final verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add templates section to README**

Append:

```md
## Casino templates

Built-in games: 百家樂、龍虎、歐式輪盤、骰寶. Pick a template, choose **結果（互斥）** or **注項（可多選）**, record rounds, and read the same-page payout table (common rules / reference only). Custom 2–50 options remain. Data: `localStorage` key `onyx-odds:v2` (migrates `onyx-odds:v1`).
```

- [ ] **Step 2: Final gate**

Run: `npm test && npm run build`  
Expected: PASS / build OK.

Manual smoke (do not automate in CI):
1. Select each of 4 templates — payout columns + disclaimer with 賠率表 caveat.
2. Outcome tap immediate; bet multi-select + 記入本局; undo pops whole round.
3. Switch template/mode with data → confirm clears.
4. Refresh persists under `onyx-odds:v2`.
5. Custom mode shows「自訂模式無內建賠率表」.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(odds): document casino templates and v2 storage"
```

---

## Self-review (plan author)

**Spec coverage**

| Spec requirement | Task |
| --- | --- |
| MAX_OPTIONS=50 / custom 2–50 | 1, 10, 12 |
| Types: TrackMode, TemplateId, Round, PayoutRow, GameTemplate, OddsState | 1 |
| rounds inclusion stats + hot/due/predicted | 2 |
| append/undo/pending bet | 3 |
| onyx-odds:v2 + v1→rounds migration | 4 |
| Four templates + payout categories | 5–6 |
| Switch template/mode clears rounds | 7, 12 |
| Export with template/mode + `a+b+c` | 7 |
| Paste singleton rounds in bet mode + help | 8 |
| PayoutTable + extended disclaimer | 9 |
| Setup picker + mode toggle + editable labels | 10 |
| Bet UX 記入本局 + Road groups | 11 |
| OddsApp confirm gates + persistence | 12 |
| Success criteria / build green / README | 13 |

**Placeholder scan:** No TBD/TODO/"similar to Task N". Concrete payout numbers and locked option lists included. Sic Bo bet set locked at **39** (single-dice trackables are per face 1–6; 1/2/3-dice payout tiers live in `payoutRows` only) so ≤50 without dropping 任意圍骰.

**Type consistency:** `rounds: Round[]` throughout; `computeStats(options, rounds)`; storage `OddsState` matches types; UI uses `templateId`/`trackMode`/`pendingIds`; export `exportRoundsText`; `templateDisplayName` lives in `lib/templates/index.ts` (no export↔switch cycle).

**Gaps vs spec:** None.
