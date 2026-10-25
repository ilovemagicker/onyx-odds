"use client";

import { useState } from "react";

type Props = {
  error: string | null;
  onApply: (text: string) => boolean;
};

export function PasteInput({ error, onApply }: Props) {
  const [text, setText] = useState("");

  return (
    <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <label className="block text-sm text-zinc-400" htmlFor="paste-input">
        貼上結果（逗號／空白／換行；標籤或 1-based 編號）
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
        className="min-h-11 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-500"
        onClick={() => {
          if (onApply(text)) setText("");
        }}
      >
        套用貼上
      </button>
    </section>
  );
}
