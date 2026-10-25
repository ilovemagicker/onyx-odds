"use client";

import type { DieFace } from "@/lib/sic-bo-dice";

/** Standard pip positions on a 3×3 grid (row-major 0–8). */
const PIP_MAP: Record<DieFace, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 3, 6, 2, 5, 8],
};

type Size = "slot" | "face";

type Props = {
  value: DieFace | null;
  size?: Size;
  focused?: boolean;
  className?: string;
  /** When true, render as button (palette / tappable slot). */
  asButton?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
  onClick?: () => void;
};

const SIZE_CLASS: Record<Size, string> = {
  // slot preview: 72 mobile / 88 sm+
  slot: "h-[72px] w-[72px] sm:h-[88px] sm:w-[88px] rounded-xl",
  // face palette: ≥48, max 56
  face: "h-12 w-12 max-w-14 min-h-12 min-w-12 sm:h-14 sm:w-14 rounded-xl",
};

const PIP_DOT: Record<Size, string> = {
  slot: "h-3 w-3 sm:h-3.5 sm:w-3.5",
  face: "h-2 w-2 sm:h-2.5 sm:w-2.5",
};

export function DiePip({
  value,
  size = "face",
  focused = false,
  className = "",
  asButton = false,
  pressed = false,
  disabled = false,
  "aria-label": ariaLabel,
  onClick,
}: Props) {
  const empty = value === null;
  const faceBg = empty ? "bg-zinc-900/40" : "bg-[#f4f0e6]";
  const borderCls = focused
    ? "border-sky-400 ring-2 ring-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.3)]"
    : empty
      ? "border-dashed border-zinc-600"
      : "border-zinc-300";
  const base =
    `relative flex shrink-0 items-center justify-center border text-zinc-900 ${faceBg} ` +
    SIZE_CLASS[size] +
    ` ${borderCls}` +
    (!focused && !empty && size === "slot" ? " opacity-90" : "") +
    (asButton
      ? " cursor-pointer active:scale-[0.97] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
      : "") +
    (pressed && asButton && !focused ? " ring-2 ring-sky-400" : "") +
    (className ? ` ${className}` : "");

  const pips = value === null ? [] : PIP_MAP[value];

  const inner = empty ? (
    <span className="text-lg font-medium tracking-widest text-zinc-600" aria-hidden>
      ··
    </span>
  ) : (
    <span
      className="grid h-[70%] w-[70%] grid-cols-3 grid-rows-3 place-items-center"
      aria-hidden
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className={
            pips.includes(i)
              ? `rounded-full bg-zinc-900 ${PIP_DOT[size]}`
              : "h-0 w-0"
          }
        />
      ))}
    </span>
  );

  if (asButton) {
    return (
      <button
        type="button"
        className={base}
        aria-label={ariaLabel}
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
      >
        {inner}
        {value !== null ? (
          <span className="sr-only">{value}</span>
        ) : null}
      </button>
    );
  }

  return (
    <div className={base} aria-label={ariaLabel} role="img">
      {inner}
      {value !== null ? <span className="sr-only">{value}</span> : null}
    </div>
  );
}
