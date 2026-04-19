import { useState } from "react";
import ArenaGrid, { type GridLabel } from "./ArenaGrid";
import type { Hue, Preview } from "./arena-shared";
import { useArenaScript } from "./useArenaScript";

const ARENA_SIZE = 32;

const steps = [
  { label: '"hello"', size: 5, hue: "emerald" as Hue, offset: 0 },
  { label: '"oz"', size: 2, hue: "emerald" as Hue, offset: 5 },
  { label: "int64(42)", size: 8, hue: "sky" as Hue, offset: 8 },
];

export default function ArenaBumpLoop() {
  const [preview, setPreview] = useState<Preview>(null);

  const { cells, cursor, visibleLabels } = useArenaScript(
    ARENA_SIZE,
    async ({ wait, placeCell, showLabel, setCursor, setCells, setVisibleLabels, cancelled }) => {
      while (!cancelled()) {
        setCells(Array(ARENA_SIZE).fill(null));
        setCursor(0);
        setVisibleLabels(new Set());
        setPreview(null);
        await wait(1100);
        if (cancelled()) return;

        setPreview({ start: steps[0].offset, size: steps[0].size, hue: steps[0].hue });
        await wait(500);
        if (cancelled()) return;
        showLabel(0);
        for (let i = 0; i < steps[0].size; i++) {
          await wait(i === 0 ? 240 : 160);
          if (cancelled()) return;
          placeCell(steps[0].offset + i, { kind: "data", hue: steps[0].hue });
          setCursor(steps[0].offset + i + 1);
        }
        setPreview(null);
        await wait(800);
        if (cancelled()) return;

        setPreview({ start: steps[1].offset, size: steps[1].size, hue: steps[1].hue });
        await wait(500);
        if (cancelled()) return;
        showLabel(1);
        for (let i = 0; i < steps[1].size; i++) {
          await wait(160);
          if (cancelled()) return;
          placeCell(steps[1].offset + i, { kind: "data", hue: steps[1].hue });
          setCursor(steps[1].offset + i + 1);
        }
        setPreview(null);
        await wait(950);
        if (cancelled()) return;

        setPreview({ start: 7, size: 1, hue: "sky" });
        await wait(450);
        if (cancelled()) return;
        placeCell(7, { kind: "pad", hue: "sky" });
        setCursor(8);
        setPreview(null);
        await wait(1100);
        if (cancelled()) return;

        setPreview({ start: steps[2].offset, size: steps[2].size, hue: steps[2].hue });
        await wait(500);
        if (cancelled()) return;
        showLabel(2);
        for (let i = 0; i < steps[2].size; i++) {
          await wait(160);
          if (cancelled()) return;
          placeCell(steps[2].offset + i, { kind: "data", hue: steps[2].hue });
          setCursor(steps[2].offset + i + 1);
        }
        setPreview(null);
        await wait(2400);
      }
    },
    []
  );

  const labels: GridLabel[] = steps.map((s, i) => ({
    start: s.offset,
    span: s.size,
    text: s.label,
    visible: visibleLabels.has(i),
  }));

  return (
    <div className="not-prose my-8 select-none overflow-x-auto font-mono">
      <ArenaGrid
        size={ARENA_SIZE}
        cells={cells}
        cursor={cursor}
        labels={labels}
        preview={preview}
        previewEmptyOnly
        minCellWidthPx={8}
        minWidthClass="min-w-[28rem]"
        cursorCaptionMode="right"
      />
    </div>
  );
}
