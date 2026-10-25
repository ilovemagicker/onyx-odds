# Onyx Odds v1 — Design Spec

**Date:** 2026-10-25 (Asia/Hong_Kong)  
**Brand:** Onyx Labs · onyxlab.dev  
**Product (working name):** Odds  
**Domain:** https://odds.onyxlab.dev  
**Status:** Design approved by 老闆 (brainstorming complete)

## Goal

Ship a **generic N-option casino-style probability tracker** as an independent web app. Players set how many outcomes exist, name them, enter observed results (tap or paste), and see **frequency (hot)** plus **gap since last hit (due)** as a reference for the next round. Pure client-side stats — no claim that history changes true odds.

## Decisions (locked)

| Topic | Choice |
| --- | --- |
| Scope | **Generic N options** with custom labels (not locked to baccarat/roulette) |
| “Prediction” | **Both** frequency (hottest) and due (longest gap) shown; user judges |
| Input | **Both** option buttons and paste/parse of a result sequence |
| Surface | **Independent Next.js site** on Vercel (`odds.onyxlab.dev`) |
| Persistence | Browser `localStorage` only |
| Auth / money | None — no accounts, wallets, or real stakes |
| UI language | Traditional Chinese primary |
| Option count | **2–20** inclusive |
| Brand chrome | Onyx Labs dark shell (aligned with Plinko / Swap / Seal) |

## Out of scope (v1)

- Accounts, sync across devices, or cloud history
- Real-money betting, wallet connect, or payouts
- Game-specific roadmaps (baccarat bead plate, roulette wheel UI) as first-class modes (labels can still mimic them)
- ML / Bayesian “true” predictors beyond frequency + gap
- Homepage card on onyxlab.dev (add later if wanted)
- Native apps
- Backend API

## Architecture

```
Browser (Next.js App Router · Vercel)
  ├─ Onyx shell: title, disclaimer, clear / export
  ├─ Setup: N (2–20), editable labels per option
  ├─ Input: big option buttons + undo; paste box (comma / space / newline)
  ├─ Road: chronological chips of recorded outcomes
  └─ Stats: per-option count, frequency %, gap, fair 1/N; highlight hot + due
        │
        ▼ localStorage key e.g. onyx-odds:v1
  { options: [{id, label}], results: number[] /* option ids */, updatedAt }
```

- Deploy: Vercel project `onyx-odds` + DNS `odds.onyxlab.dev`
- Repo: `ilovemagicker/onyx-odds` (public, same pattern as other Onyx indie tools)
- All probability math runs in pure TS modules, unit-tested with Vitest

## Data model

- **Option:** `{ id: number, label: string }` — ids stable `0..N-1` (or `1..N` displayed; store as `0..N-1`)
- **Results:** ordered array of option ids (oldest → newest)
- **Rename label:** does not rewrite history (ids unchanged)
- **Change N or reset options:** confirm → clear `results`
- **Undo:** pop last result
- **Clear:** empty `results` (keep options) or full reset

## Stats (definitions)

Let `N` = option count, `T` = `results.length`.

| Metric | Definition |
| --- | --- |
| Count `c_i` | Number of times option `i` appears in `results` |
| Frequency | `c_i / T` when `T > 0`; else `0` (show “—” or 0%) |
| Fair odds | Always `1 / N` |
| Gap (due) | Games since last occurrence of `i` (not counting the current unfinished game). If never appeared, gap = `T` |
| Hottest | Option(s) with max frequency; if `T = 0`, none |
| Most due | Option(s) with max gap; if `T = 0`, none |
| Next-round reference | Surface hottest + most due labels at top; if tie, list all tied |

No weighting, no decay, no Markov chains in v1.

## Paste parsing

- Split on commas, whitespace, and newlines
- Each token matches an option by **exact label** (case-sensitive trim) or by **1-based index** (`"1"` … `"N"`)
- Unknown tokens → reject whole paste with a clear error; do not partially apply
- Empty paste → no-op

## UI & layout

Mobile-first vertical page:

1. Header: Odds · Onyx Labs · short disclaimer (“歷史統計僅供參考，不影響真實下一局機率”)
2. Setup row: N stepper/select; list of label inputs
3. Reference banner: 最熱 / 該出最久 (or “尚無紀錄”)
4. Input: option buttons in a wrap grid; Undo; Paste textarea + Apply
5. Road: scrollable chip strip of recent results (newest at end)
6. Table: Label | Count | Freq% | Fair% | Gap | badges Hot / Due
7. Footer actions: Clear results · Export as text · optional “Reset all”

Visual: dark background, accent highlights for Hot/Due, readable large tap targets.

## Error handling

- N outside 2–20: clamp or block with message
- Changing N: confirm dialog before wipe
- Paste failure: inline error, keep prior results
- Corrupt localStorage: reset to default 2 options (“A”,“B”) and empty results

## Testing

Vitest covering:

- Frequency and gap edge cases (`T=0`, never appeared, ties)
- Paste: labels, 1-based indices, mixed separators, reject unknown
- Changing N clears results; rename does not

## Success criteria

- Live at https://odds.onyxlab.dev
- Player can set N, rename, tap and paste results, see hot + due update live
- Data survives refresh via localStorage
- `npm test` and `npm run build` green
- Disclaimer visible without scrolling on a typical phone viewport

## Non-goals reminder

This tool **does not** improve casino EV. Copy and meta description must stay honest.
