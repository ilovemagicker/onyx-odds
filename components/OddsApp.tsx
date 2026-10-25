"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Disclaimer } from "@/components/Disclaimer";
import { PasteInput } from "@/components/PasteInput";
import { ReferenceBanner } from "@/components/ReferenceBanner";
import { ResultButtons } from "@/components/ResultButtons";
import { Road } from "@/components/Road";
import { SetupPanel } from "@/components/SetupPanel";
import { StatsTable } from "@/components/StatsTable";
import { exportResultsText } from "@/lib/export";
import {
  defaultOptions,
  renameOption,
  resizeOptions,
} from "@/lib/options";
import { parsePaste } from "@/lib/paste";
import { computeStats } from "@/lib/stats";
import { loadState, saveState } from "@/lib/storage";
import type { Option } from "@/lib/types";

export function OddsApp() {
  const [options, setOptions] = useState<Option[]>(() => defaultOptions(2));
  const [results, setResults] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  useEffect(() => {
    const state = loadState();
    setOptions(state.options);
    setResults(state.results);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({
      options,
      results,
      updatedAt: Date.now(),
    });
  }, [options, results, hydrated]);

  const stats = useMemo(
    () => computeStats(options, results),
    [options, results],
  );

  const handleChangeN = useCallback(
    (n: number) => {
      if (n === options.length) return;
      const ok = window.confirm(
        "變更選項數會清空目前所有結果，確定繼續？",
      );
      if (!ok) return;
      const { options: next } = resizeOptions(options, n);
      setOptions(next);
      setResults([]);
      setPasteError(null);
    },
    [options],
  );

  const handleRenameChange = useCallback((id: number, label: string) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, label } : o)),
    );
  }, []);

  const handleRenameCommit = useCallback((id: number, label: string) => {
    setOptions((prev) => renameOption(prev, id, label));
  }, []);

  const handlePick = useCallback((id: number) => {
    setResults((prev) => [...prev, id]);
    setPasteError(null);
  }, []);

  const handleUndo = useCallback(() => {
    setResults((prev) => (prev.length === 0 ? prev : prev.slice(0, -1)));
  }, []);

  const handlePasteApply = useCallback(
    (text: string) => {
      const parsed = parsePaste(text, options);
      if (!parsed.ok) {
        setPasteError(parsed.error);
        return;
      }
      setPasteError(null);
      if (parsed.ids.length === 0) return;
      setResults((prev) => [...prev, ...parsed.ids]);
    },
    [options],
  );

  const handleClear = useCallback(() => {
    if (results.length === 0) return;
    const ok = window.confirm("確定清空所有結果？（選項會保留）");
    if (!ok) return;
    setResults([]);
    setPasteError(null);
  }, [results.length]);

  const handleResetAll = useCallback(() => {
    const ok = window.confirm("確定重設為預設 2 選項並清空結果？");
    if (!ok) return;
    setOptions(defaultOptions(2));
    setResults([]);
    setPasteError(null);
  }, []);

  const handleExport = useCallback(async () => {
    const text = exportResultsText(options, results);
    setExportMsg(null);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setExportMsg(text ? "已複製到剪貼簿" : "尚無結果可匯出（已複製空字串）");
        return;
      }
      throw new Error("clipboard unavailable");
    } catch {
      window.prompt("複製以下文字：", text);
      setExportMsg("請手動複製上方文字");
    }
  }, [options, results]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-5 px-4 py-6 sm:px-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Odds
          </h1>
          <span className="text-xs uppercase tracking-wider text-zinc-500">
            Onyx Labs
          </span>
        </div>
        <Disclaimer />
      </header>

      <SetupPanel
        options={options}
        onChangeN={handleChangeN}
        onRenameChange={handleRenameChange}
        onRenameCommit={handleRenameCommit}
      />

      <ReferenceBanner options={options} stats={stats} />

      <ResultButtons
        options={options}
        canUndo={results.length > 0}
        onPick={handlePick}
        onUndo={handleUndo}
      />

      <PasteInput error={pasteError} onApply={handlePasteApply} />

      <Road options={options} results={results} />

      <StatsTable stats={stats} />

      <footer className="flex flex-wrap gap-2 border-t border-zinc-800 pt-4 pb-8">
        <button
          type="button"
          className="min-h-11 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 hover:border-zinc-500"
          onClick={handleClear}
        >
          清空結果
        </button>
        <button
          type="button"
          className="min-h-11 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-300 hover:border-zinc-500"
          onClick={handleExport}
        >
          匯出文字
        </button>
        <button
          type="button"
          className="min-h-11 rounded-lg border border-zinc-700 px-4 text-sm text-zinc-500 hover:border-zinc-500"
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
