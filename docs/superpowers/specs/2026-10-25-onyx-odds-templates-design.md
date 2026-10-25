# Onyx Odds — Casino Templates Design Spec

**Date:** 2026-10-25 (Asia/Hong_Kong)  
**Brand:** Onyx Labs · onyxlab.dev  
**Product:** Odds  
**Domain:** https://odds.onyxlab.dev  
**Status:** Design approved by 老闆 (brainstorming complete)  
**Extends:** [2026-10-25-onyx-odds-design.md](./2026-10-25-onyx-odds-design.md) (v1 generic tracker)

## Overview

Add **built-in casino game templates** to Odds so a player can pick a game, tap results to record a road, and read a **same-page full payout table** (common rules) without leaving the tracker. Custom N-option mode remains. This is still a **client-side history / reference tool** — not live odds, not a betting engine, and not a claim that past results change true probabilities.

Approach locked: **A** — templates fill trackable options + embed the payout table on the same page (toggleable track modes).

## Goals

1. Ship four game templates: **百家樂 (Baccarat)**, **龍虎 (Dragon Tiger)**, **歐式輪盤 (European Roulette)**, **骰寶 (Sic Bo)**.
2. Support two switchable track modes:
   - **`outcome`** (default): mutually exclusive result per round — one tap records the round.
   - **`bet`**: multi-select bet items for the round, then press **「記入本局」** to commit.
3. Raise **`MAX_OPTIONS` to 50** (custom N still works; range **2–50**).
4. Show a **PayoutTable** on the same page: columns **注項｜賠率｜理論機率｜莊家優勢｜備註**, sourced from common standard rules and labeled as reference (may differ by casino).
5. Persist via `localStorage` key **`onyx-odds:v2`**, with readable migration from v1 (imported as custom, no template).
6. Reuse Road / Stats / hot+due prediction with clear semantics for multi-id rounds.
7. Keep / extend the honesty disclaimer to cover the odds-table reference caveat.

## Non-goals

- Casino-specific bead-plate / dragon-tiger road / roulette-wheel UIs as first-class surfaces (chip road stays chronological).
- Live odds feeds, casino APIs, or per-operator rule packs.
- Accounts, cloud sync, real-money stakes, wallets, or payouts.
- Encouraging gambling; copy must stay statistical/reference.
- ML / Bayesian predictors beyond frequency + gap.
- Backend API.
- Perfect numeric parity with every casino’s side bets (table is **常見規則／僅供參考**).

## Locked decisions

| Topic | Choice |
| --- | --- |
| Approach | **A** — built-in templates + same-page payout table |
| Games | Baccarat, Dragon Tiger, European Roulette, Sic Bo |
| Track modes | Both; switchable; default **`outcome`** |
| Bet-mode commit | Select ≥1 bets → **記入本局** |
| Outcome-mode commit | Single tap records immediately |
| Option cap | **MAX_OPTIONS = 50**; custom N still available |
| Template / mode switch with data | Confirm → clear recorded rounds |
| Payout columns | 注項 \| 賠率 \| 理論機率 \| 莊家優勢 \| 備註 |
| Storage | `onyx-odds:v2`; v1 loadable as custom |
| Architecture | `lib/templates/` per-game constants |

## Data model

### Core types

```ts
export type Option = { id: number; label: string };

export type TrackMode = "outcome" | "bet";

export type TemplateId =
  | "baccarat"
  | "dragon-tiger"
  | "european-roulette"
  | "sic-bo";

/** One recorded round: list of option ids that belong to that round. */
export type Round = number[]; // length ≥ 1; outcome mode always length === 1

export type PayoutRow = {
  label: string;
  payout: string; // display string, e.g. "1:1", "8:1", "0.95:1"
  probability?: string; // e.g. "50.68%"; omit → UI shows "—"
  houseEdge?: string; // e.g. "1.06%"; omit → UI shows "—"
  note?: string;
};

export type GameTemplate = {
  id: TemplateId;
  nameZh: string;
  nameEn: string;
  outcomeOptions: Option[]; // mutually exclusive round results
  betOptions: Option[]; // trackable bet items (may exceed outcome set)
  payoutRows: PayoutRow[]; // full reference table for the game
};

export type OddsState = {
  templateId: TemplateId | null; // null = custom
  trackMode: TrackMode;
  options: Option[]; // active button set (= outcome or bet options, or custom)
  /** Chronological rounds, oldest → newest. Always Round[]. */
  rounds: Round[];
  updatedAt: number;
};
```

### Results representation (bet mode and outcome mode)

**Single coherent scheme: `rounds: number[][]`.**

- Each element of `rounds` is one **round**.
- A round is a non-empty array of **option ids**.
- **`outcome` mode:** every round is a singleton `[id]` (enforced on write).
- **`bet` mode:** a round is `[id₁, id₂, …]` after the user multi-selects and presses **記入本局**. Order inside a round is the order of selection; duplicates within one round are not allowed (toggling off removes).
- Undo pops the last **round** (not a single id inside a multi-bet round).
- Road renders one chip (outcome) or one chip-group (bet) per round.
- Stats operate on **rounds** as the time unit:
  - **Count `c_i`:** number of rounds that **include** option `i`.
  - **Frequency:** `c_i / T` where `T = rounds.length` (`T = 0` → show 0 / "—").
  - **Gap:** number of trailing rounds since the last round that included `i`; if never appeared, gap = `T`.
  - **Hottest / most due:** unchanged tie rules from v1, computed from the above.

This replaces v1’s flat `results: number[]`. On migration from v1, each legacy id `x` becomes round `[x]`.

### Active options vs payout table

- `options` drives tap targets, Road labels, and Stats rows.
- Switching **track mode** (when confirmed) rebuilds `options` from the template’s `outcomeOptions` or `betOptions` and clears `rounds`.
- `payoutRows` is **display-only** reference data from the template; it is not required to be 1:1 with `options` (the table may list more bet names than the active track set).
- Custom mode (`templateId: null`): user edits labels / N as today; no payout table (or empty state message「自訂模式無內建賠率表」).

### Option ids

- Within a template’s `outcomeOptions` and within `betOptions`, ids are stable `0..length-1` in that array.
- `outcomeOptions` and `betOptions` are **separate namespaces**; only one set is loaded into `options` at a time, so stored round ids always refer to the **currently active** `options` list.
- Because mode/template switches clear rounds, historical ids never cross namespaces.

### Limits

- Custom / template active option count: **2 ≤ N ≤ 50**.
- Each template’s `outcomeOptions` and `betOptions` must each satisfy **2 ≤ length ≤ 50**. If a natural bet catalog would exceed 50, omit fringe side bets from `betOptions` (they may remain in `payoutRows` only). The four games above fit this cap with the locked sets.
- Changing N in custom mode with existing rounds: confirm → clear (same as v1, updated cap).

## Templates content outline

Files under `lib/templates/`:

- `index.ts` — registry `TEMPLATES: Record<TemplateId, GameTemplate>` + helpers
- `baccarat.ts`, `dragon-tiger.ts`, `european-roulette.ts`, `sic-bo.ts`
- Shared display helpers as needed (e.g. format percent strings)

Numeric cells live in code constants; this spec lists **categories** each payout table must cover.

### 百家樂 (Baccarat)

| Set | Contents |
| --- | --- |
| `outcomeOptions` | 莊、閑、和 |
| `betOptions` | 莊、閑、和、莊對、閑對（exactly these five） |
| `payoutRows` categories | Banker (commission 0.95:1), Player 1:1, Tie (common 8:1), Banker Pair, Player Pair; 備註 covers commission vs no-commission banker where relevant. Extra side-bet names may appear in the table without being trackable. |

### 龍虎 (Dragon Tiger)

| Set | Contents |
| --- | --- |
| `outcomeOptions` | 龍、虎、和 |
| `betOptions` | 龍、虎、和（exactly these three） |
| `payoutRows` categories | Dragon, Tiger, Tie (common payout); optional suit/pair side bets may appear in the table only (not necessarily in `betOptions`); 備註 for variants |

### 歐式輪盤 (European Roulette, single zero)

| Set | Contents |
| --- | --- |
| `outcomeOptions` | `0`–`36` (37 mutually exclusive results) |
| `betOptions` | Exactly twelve outside-style trackables: 紅、黑、單、雙、小(1–18)、大(19–36)、第一打、第二打、第三打、第一列、第二列、第三列. Straight-up 0–36 are recorded via **outcome** mode, not duplicated here. |
| `payoutRows` categories | Straight up; Split; Street; Corner; Six-line / double street; Column; Dozen; Red/Black; Odd/Even; Low (1–18) / High (19–36); 備註 notes European single-zero house edge (vs American where useful). Inside combination bets appear in the table even when not in `betOptions`. |

### 骰寶 (Sic Bo)

| Set | Contents |
| --- | --- |
| `outcomeOptions` | Mutually exclusive dice **totals 3–18** (16 options). Covers triple-1 (sum 3) and triple-6 (sum 18) as totals. |
| `betOptions` | 大、小、單、雙、指定總點 3–18、任意圍骰、指定圍骰（1–6）、指定雙骰（1–6）、指定單骰出現次數（一骰／兩骰／三骰）— trim only if needed to keep length ≤ 50; ship the full common set when ≤ 50. |
| `payoutRows` categories | Big / Small; Odd / Even; Specific totals (3–18); Any triple; Specific triple; Double; Single number (one / two / three dice); other combinations documented in the constant |

All `payoutRows` use Traditional Chinese labels for UI consistency; English may appear in `note` or code comments.

## UI

Mobile-first vertical page (extends v1 layout):

1. **Header** — Odds · Onyx Labs · disclaimer (see below).
2. **Setup**
   - Game picker: 自訂｜百家樂｜龍虎｜歐式輪盤｜骰寶.
   - Track mode toggle: **結果（互斥）** / **注項（可多選）** — confirm-gated when `rounds.length > 0` (confirm → clear rounds, then apply).
   - Custom only: N stepper (2–50) + label editors.
   - Template modes: labels come from the template and **remain editable** (rename does not clear rounds or change ids); changing template clears rounds after confirm.
3. **Reference banner** — 最熱 / 該出最久 (reuse; semantics use round-based stats).
4. **Input**
   - **Outcome:** large option buttons; tap → append `[id]` to `rounds`; Undo; Paste (see below).
   - **Bet:** toggleable multi-select on option buttons; primary button **記入本局** enabled when selection non-empty; clears selection after commit; Undo pops last round.
5. **PayoutTable** (hidden in custom mode) — same page, below input or in a collapsible section default-expanded on first template select: columns 注項｜賠率｜理論機率｜莊家優勢｜備註; missing optional fields render **—**.
6. **Road** — chronological rounds; bet mode shows grouped chips per round.
7. **StatsTable** — Label｜Count｜Freq%｜Fair%｜Gap｜Hot/Due (Fair% = `1/N` over active options).
8. **Footer** — Clear rounds · Export · Reset all.

### Paste behavior

- **Outcome mode:** same as v1 (labels or 1-based indices → each token one round).
- **Bet mode:** paste applies **one option id per token as its own round** (singleton rounds), matching “quick import” of a sequence; multi-id rounds are created only via the multi-select + 記入本局 UI. Document this in the paste error/help text so users are not surprised.
- Unknown tokens reject the whole paste.

### Confirmations

- Switch template with `rounds.length > 0` → confirm → clear rounds, load new options / mode default `outcome`.
- Switch track mode with `rounds.length > 0` → confirm → clear rounds, swap `options` to the other set.
- Change N (custom) with rounds → confirm → clear (v1 behavior).
- Clear / Reset all unchanged in spirit.

### Disclaimer (extended)

Visible without scrolling on a typical phone viewport:

> 歷史統計僅供參考，不影響真實下一局機率。賠率表為常見規則整理，實際賭場可能不同；本工具不提供結果保證，亦不鼓勵賭博。

## Storage migration

| Key | Shape |
| --- | --- |
| Legacy | `onyx-odds:v1` → `{ options, results: number[], updatedAt }` |
| Current | `onyx-odds:v2` → full `OddsState` (`templateId`, `trackMode`, `options`, `rounds`, `updatedAt`) |

Load algorithm:

1. Try `onyx-odds:v2`. Validate types; on success return it (clamp / repair empty rounds).
2. Else try `onyx-odds:v1`. If valid, map to v2:
   - `templateId: null`, `trackMode: "outcome"`
   - `options` preserved
   - `rounds = results.map((id) => [id])`
   - write v2; **do not delete** v1 in the same tick required, but subsequent saves only write v2 (v1 may remain stale — acceptable).
3. Else fallback: custom 2 options `A`/`B`, empty rounds, `trackMode: "outcome"`, `templateId: null`.

Corrupt JSON → fallback. Option count outside 2–50 after migration → **fallback to default** (consistent with v1 corrupt handling).

Export text should include template name (or 自訂), mode, and rounds in a readable form (e.g. outcome: labels joined; bet: `round` as `a+b+c` per line).

## Edge cases

| Case | Behavior |
| --- | --- |
| `rounds.length === 0` | No hot/due; banner「尚無紀錄」 |
| Bet commit with empty selection | No-op; button disabled |
| Outcome tap | Always commits one round immediately |
| Duplicate id in pending bet selection | Toggle off (set semantics) |
| Template bet/outcome length 1 | Disallowed by constants (min 2) |
| Fair% with N options | Always `1/N` over **active** options |
| Missing `probability` / `houseEdge` | PayoutTable shows **—** |
| Mode switch mid-selection (bet pending) | Discard pending selection on confirmed switch |
| MAX 50 | Setup blocks N > 50; templates must ship ≤ 50 active options per mode |
| Rename label | Ids unchanged; history kept |
| European Roulette outcome N = 37 | Allowed (≤ 50) |

## Testing notes

Vitest (extend existing suites):

- Round stats: frequency/gap with singleton rounds (parity with v1 flat results).
- Round stats: multi-id rounds — count/gap by **inclusion**, ties for hot/due.
- Undo removes whole last round.
- Mode/template switch clears rounds only after confirm path (unit the pure “apply switch” helpers).
- v1 → v2 migration maps `results` → `rounds` correctly; custom `templateId: null`.
- Paste outcome vs bet documented behaviors; reject unknown tokens.
- Template registry: each game has non-empty `outcomeOptions`, `betOptions` (length 2–50), and `payoutRows` covering the categories listed above.
- `MAX_OPTIONS === 50` enforced in options helpers.

Manual / smoke:

- Select each template; verify payout table columns and reference disclaimer.
- Outcome tap vs bet multi-select + 記入本局 on phone-width layout.
- Refresh persistence under `onyx-odds:v2`.

## Success criteria

- Player can pick a game template, record via outcome or bet mode, see Road/Stats/hot+due update, and read the same-page payout table.
- Custom 2–50 mode still works without a payout table.
- `npm test` and `npm run build` green after implementation.
- Disclaimer (including odds-table caveat) visible on typical phone viewport.
- No live odds, no gambling CTA, no bead-plate/wheel first-class UI in this release.

## Implementation sketch (non-normative)

Suggested touch points when coding (not extra product scope):

- `lib/types.ts` — extend as above; remove reliance on flat `results`.
- `lib/storage.ts` — `STORAGE_KEY = "onyx-odds:v2"` + migration.
- `lib/stats.ts` — compute from `rounds: Round[]`.
- `lib/templates/*` — constants.
- `components/SetupPanel.tsx` — game picker + mode toggle.
- `components/PayoutTable.tsx` — new.
- `components/ResultButtons.tsx` / `OddsApp.tsx` — outcome vs bet UX.
- `components/Disclaimer.tsx` — extended copy.
- `__tests__/*` — migration, rounds stats, templates smoke.
