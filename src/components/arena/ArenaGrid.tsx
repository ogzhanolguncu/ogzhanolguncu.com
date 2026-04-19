import type { ReactNode } from "react";
import { dataBg, padStyle, previewOutline, type Cell, type Preview } from "./arena-shared";

export type GridLabel = {
  start: number;
  span: number;
  text: string;
  visible: boolean;
};

type ArenaGridProps = {
  size: number;
  cells: Cell[];
  cursor: number;
  labels: GridLabel[];
  preview?: Preview;
  previewEmptyOnly?: boolean;
  showRuler?: boolean;
  rulerTargetIndex?: number | null;
  minCellWidthPx?: number;
  minWidthClass?: string;
  cursorCaption?: ReactNode;
  cursorCaptionMode?: "follow" | "right";
};

export default function ArenaGrid({
  size,
  cells,
  cursor,
  labels,
  preview = null,
  previewEmptyOnly = false,
  showRuler = false,
  rulerTargetIndex = null,
  minCellWidthPx = 10,
  minWidthClass = "min-w-[22rem]",
  cursorCaption,
  cursorCaptionMode = "follow",
}: ArenaGridProps) {
  const caption = cursorCaption ?? <>offset = {cursor}</>;
  const gridTemplate = { gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` };

  return (
    <div className={`${minWidthClass}`}>
      <div className="grid h-5 gap-[2px] px-[3px]" style={gridTemplate}>
        {labels.map((label, i) =>
          label.visible ? (
            <span
              key={i}
              className="self-end whitespace-nowrap text-center text-xs text-skin-base transition-opacity duration-300"
              style={{ gridColumn: `${label.start + 1} / span ${label.span}` }}
            >
              {label.text}
            </span>
          ) : null
        )}
      </div>

      <div
        className="relative grid gap-[2px] rounded border border-skin-line bg-skin-card/20 p-[2px]"
        style={gridTemplate}
      >
        {cells.map((cell, i) => {
          const inPreviewRange =
            preview !== null && i >= preview.start && i < preview.start + preview.size;
          const inPreview = inPreviewRange && (!previewEmptyOnly || cell === null);
          const ringClass = inPreview
            ? ` outline outline-1 outline-dashed ${previewOutline[preview!.hue]}`
            : "";
          return (
            <div
              key={i}
              className={`aspect-square rounded-[2px] transition-all duration-300 ${
                cell?.kind === "data"
                  ? dataBg[cell.hue]
                  : cell?.kind === "pad"
                    ? ""
                    : "bg-skin-card/40"
              }${ringClass}`}
              style={{
                minWidth: `${minCellWidthPx}px`,
                ...(cell?.kind === "pad" ? padStyle : {}),
              }}
            />
          );
        })}
      </div>

      {showRuler && (
        <div className="grid h-3 gap-[2px] px-[3px]" style={gridTemplate}>
          {Array.from({ length: size }).map((_, i) => {
            const isEight = i % 8 === 0;
            const isFour = i % 4 === 0;
            const h = isEight ? "h-3" : isFour ? "h-2" : "h-1";
            const isTarget = rulerTargetIndex !== null && i === rulerTargetIndex;
            const color = isTarget
              ? "bg-skin-accent"
              : isEight
                ? "bg-skin-base/50"
                : "bg-skin-base/25";
            return (
              <div key={i} className="flex justify-center">
                <div className={`w-[1px] ${h} ${color} transition-colors duration-300`} />
              </div>
            );
          })}
        </div>
      )}

      {cursorCaptionMode === "follow" ? (
        <div className="relative mt-2 h-8 text-xs text-skin-accent">
          <span
            className="absolute transition-all duration-200 ease-out"
            style={{
              left: `calc(3px + ${cursor} * (100% - 6px) / ${size})`,
              transform: "translateX(-50%)",
            }}
          >
            ▲
          </span>
          <span
            className="absolute top-4 whitespace-nowrap leading-tight transition-all duration-200 ease-out"
            style={{
              left: `calc(3px + ${cursor} * (100% - 6px) / ${size})`,
              transform: `translateX(${
                cursor >= size - 3 ? "-100%" : cursor <= 3 ? "0%" : "-50%"
              })`,
            }}
          >
            {caption}
          </span>
        </div>
      ) : (
        <div className="relative mt-2 h-5 text-xs text-skin-accent">
          <span
            className="absolute transition-all duration-200"
            style={{
              left: `calc(3px + ${cursor} * (100% - 6px) / ${size})`,
              transform: "translateX(-50%)",
            }}
          >
            ▲
          </span>
          <span className="absolute right-0 whitespace-nowrap">{caption}</span>
        </div>
      )}
    </div>
  );
}
