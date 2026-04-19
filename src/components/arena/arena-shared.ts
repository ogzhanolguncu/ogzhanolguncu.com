import type { CSSProperties } from "react";

export type Hue = "emerald" | "sky" | "amber" | "rose";
export type Cell = null | { kind: "data" | "pad"; hue: Hue };
export type Preview = { start: number; size: number; hue: Hue } | null;

export const dataBg: Record<Hue, string> = {
  emerald: "bg-emerald-500/75",
  sky: "bg-sky-500/75",
  amber: "bg-amber-500/75",
  rose: "bg-rose-500/75",
};

export const previewOutline: Record<Hue, string> = {
  emerald: "outline-emerald-400/70",
  sky: "outline-sky-400/70",
  amber: "outline-amber-400/70",
  rose: "outline-rose-400/70",
};

export const padStyle: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(45deg, rgb(var(--color-text-base)) 0 2px, transparent 2px 6px)",
  opacity: 0.5,
};
