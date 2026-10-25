"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Disclaimer } from "@/components/Disclaimer";
import { PasteInput } from "@/components/PasteInput";
import { PayoutTable } from "@/components/PayoutTable";
import { ReferenceBanner } from "@/components/ReferenceBanner";
import { ResultButtons } from "@/components/ResultButtons";
import { SicBoDicePad } from "@/components/SicBoDicePad";
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
    let templateId = state.templateId;
    let trackMode = state.trackMode;
    let options = state.options;
    let rounds = state.rounds;
    // 骰寶只支援結果模式 + 骰子輸入；舊資料若為注項則強制切回結果
    if (templateId === "sic-bo" && trackMode === "bet") {
      const coerced = applyTrackMode(
        { templateId, trackMode, options, rounds, updatedAt: state.updatedAt },
        "outcome",
      );
      templateId = coerced.templateId;
      trackMode = coerced.trackMode;
      options = coerced.options;
      rounds = coerced.rounds;
    }
    setTemplateId(templateId);
    setTrackMode(trackMode);
    setOptions(options);
    setRounds(rounds);
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
      // 骰寶鎖定結果模式（骰子記入）
      if (templateId === "sic-bo" && mode === "bet") return;
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

  const isSicBo = templateId === "sic-bo";

  const setup = (
    <SetupPanel
      key={`${templateId ?? "custom"}-${options.length}-${nSelectEpoch}`}
      templateId={templateId}
      trackMode={trackMode}
      options={options}
      defaultCollapsed={isSicBo}
      onSelectTemplate={handleSelectTemplate}
      onSelectTrackMode={handleSelectTrackMode}
      onChangeN={handleChangeN}
      onRenameChange={handleRenameChange}
      onRenameCommit={handleRenameCommit}
    />
  );

  const inputPad = isSicBo ? (
    <SicBoDicePad
      canUndo={rounds.length > 0}
      onCommit={handlePickOutcome}
      onUndo={handleUndo}
    />
  ) : (
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
  );

  const road = <Road options={options} rounds={rounds} />;

  const payout = <PayoutTable rows={payoutRows} />;
  const statsBlock = <StatsTable stats={stats} />;
  const paste = (
    <PasteInput
      error={pasteError}
      trackMode={trackMode}
      onApply={handlePasteApply}
    />
  );

  const footer = (
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
  );

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

      {setup}

      {isSicBo ? (
        <>
          {inputPad}
          <ReferenceBanner
            options={options}
            stats={stats}
            payoutRows={payoutRows}
          />
          {road}
          <details className="rounded-xl border border-zinc-800 bg-zinc-900/40 open:pb-2">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm text-zinc-300 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="font-medium">賠率參考</span>
              <span className="ml-2 text-xs text-zinc-500">不影響記入</span>
            </summary>
            <div className="px-4 pb-3">{payout}</div>
          </details>
          <details className="rounded-xl border border-zinc-800 bg-zinc-900/40">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-zinc-300 marker:content-none [&::-webkit-details-marker]:hidden">
              統計
            </summary>
            <div className="px-4 pb-3">{statsBlock}</div>
          </details>
          <details className="rounded-xl border border-zinc-800 bg-zinc-900/40">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-zinc-300 marker:content-none [&::-webkit-details-marker]:hidden">
              貼上匯入
            </summary>
            <div className="px-4 pb-3">{paste}</div>
          </details>
        </>
      ) : (
        <>
          {inputPad}
          <ReferenceBanner
            options={options}
            stats={stats}
            payoutRows={payoutRows}
          />
          {paste}
          {payout}
          {road}
          {statsBlock}
        </>
      )}

      {footer}
    </div>
  );
}
