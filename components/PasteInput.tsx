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
