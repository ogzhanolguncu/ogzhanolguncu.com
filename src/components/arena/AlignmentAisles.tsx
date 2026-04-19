import { useEffect, useState } from "react";

const AISLE_SIZE = 8;
const TOTAL = AISLE_SIZE * 2;

const gridTemplate = `repeat(${AISLE_SIZE}, minmax(16px, 1fr)) 14px repeat(${AISLE_SIZE}, minmax(16px, 1fr))`;

function cellCol(idx: number): number {
  return idx < AISLE_SIZE ? idx + 1 : idx + 2;
}

export default function AlignmentAisles() {
  const [aFiring, setAFiring] = useState(-1);
  const [aFired, setAFired] = useState(0);
  const [uFiring, setUFiring] = useState(-1);
  const [uFired, setUFired] = useState(0);
  const [stitch, setStitch] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timerId: number | null = null;
    const wait = (ms: number) =>
      new Promise<void>(resolve => {
        timerId = window.setTimeout(() => {
          timerId = null;
          resolve();
        }, ms);
      });

    async function run() {
      while (!cancelled) {
        setAFiring(-1);
        setAFired(0);
        setUFiring(-1);
        setUFired(0);
        setStitch(false);
        await wait(700);
        if (cancelled) return;

        setAFiring(0);
        await wait(900);
        if (cancelled) return;
        setAFiring(-1);
        setAFired(1);
        await wait(700);
        if (cancelled) return;

        setUFiring(0);
        await wait(900);
        if (cancelled) return;
        setUFiring(-1);
        setUFired(1);
        await wait(450);
        if (cancelled) return;

        setUFiring(1);
        await wait(900);
        if (cancelled) return;
        setUFiring(-1);
        setUFired(2);
        await wait(300);
        if (cancelled) return;

        setStitch(true);
        await wait(2400);
        if (cancelled) return;
      }
    }
    run();
    return () => {
      cancelled = true;
      if (timerId !== null) window.clearTimeout(timerId);
    };
  }, []);

  return (
    <div className="not-prose my-8 select-none overflow-x-auto font-mono">
      <div className="min-w-[32rem] space-y-8">
        <Row
          label="address 0"
          ok
          hue="sky"
          intStart={0}
          intEnd={7}
          firing={aFiring}
          fired={aFired}
          totalReads={1}
          stitchOn={false}
          summary="fits in one aisle → one atomic read"
        />
        <Row
          label="address 3"
          ok={false}
          hue="amber"
          intStart={3}
          intEnd={10}
          firing={uFiring}
          fired={uFired}
          totalReads={2}
          stitchOn={stitch}
          summary="crosses the boundary → two reads + stitch"
        />
      </div>
    </div>
  );
}

type RowProps = {
  label: string;
  ok: boolean;
  hue: "sky" | "amber";
  intStart: number;
  intEnd: number;
  firing: number;
  fired: number;
  totalReads: number;
  stitchOn: boolean;
  summary: string;
};

function Row({
  label,
  ok,
  hue,
  intStart,
  intEnd,
  firing,
  fired,
  totalReads,
  stitchOn,
  summary,
}: RowProps) {
  const tone = hue === "sky" ? "text-sky-500" : "text-amber-500";
  const fillCls = hue === "sky" ? "bg-sky-500/70" : "bg-amber-500/70";
  const ringCls = hue === "sky" ? "ring-sky-400" : "ring-amber-400";
  const barCls =
    hue === "sky"
      ? "border-sky-500/50 bg-sky-500/15 text-sky-600 dark:text-sky-300"
      : "border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-300";
  const dotOnCls = hue === "sky" ? "bg-sky-500" : "bg-amber-500";

  const spansBoundary = intStart < AISLE_SIZE && intEnd >= AISLE_SIZE;
  const barCol = `${cellCol(intStart)} / ${cellCol(intEnd) + 1}`;
  const stitchLeftCol = `${cellCol(intStart)} / ${cellCol(AISLE_SIZE - 1) + 1}`;
  const stitchRightCol = `${cellCol(AISLE_SIZE)} / ${cellCol(intEnd) + 1}`;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold">{label}</span>
        <span className="text-skin-base/40">·</span>
        <span className="flex items-center gap-1">
          {Array.from({ length: totalReads }).map((_, i) => {
            const lit = i < fired || i === firing;
            const active = i === firing;
            return (
              <span
                key={i}
                className={`inline-block h-2 w-2 rounded-full transition-all duration-200 ${
                  lit ? dotOnCls : "bg-skin-base/20"
                } ${active ? "scale-150" : ""}`}
              />
            );
          })}
        </span>
        <span className="text-skin-base/70">
          {totalReads} read{totalReads > 1 ? "s" : ""}
          {stitchOn ? " + stitch" : ""}
        </span>
      </div>

      <div className="mb-1 grid" style={{ gridTemplateColumns: gridTemplate }}>
        <div
          className={`truncate rounded border px-2 text-[10px] leading-[18px] ${barCls}`}
          style={{ gridColumn: barCol }}
        >
          int64 · 8 bytes
        </div>
      </div>

      <div
        className="grid gap-[2px] rounded border border-skin-line bg-skin-card/20 p-[2px]"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {Array.from({ length: TOTAL }).map((_, i) => {
          const isTarget = i >= intStart && i <= intEnd;
          const aisle = i < AISLE_SIZE ? 0 : 1;
          const aisleActive = firing === aisle;
          const base = isTarget ? fillCls : "bg-skin-card/40";
          const ring = aisleActive && isTarget ? ` ring-2 ${ringCls}` : "";
          return (
            <div
              key={i}
              className={`aspect-square min-w-[16px] rounded-[2px] transition-all duration-300 ${base}${ring}`}
              style={{ gridColumn: cellCol(i) }}
            />
          );
        })}
      </div>

      <div
        className="mt-1 grid text-center text-[9px]"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {Array.from({ length: TOTAL }).map((_, i) => (
          <span
            key={i}
            className={i === intStart ? `${tone} font-bold` : "text-skin-base/50"}
            style={{ gridColumn: cellCol(i) }}
          >
            {i}
          </span>
        ))}
      </div>

      <div
        className="mt-1 grid text-[9px] uppercase tracking-wider text-skin-base/50"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        <span className="text-center" style={{ gridColumn: `1 / ${AISLE_SIZE + 1}` }}>
          Aisle 0
        </span>
        <span className="text-center" style={{ gridColumn: `${AISLE_SIZE + 2} / ${TOTAL + 2}` }}>
          Aisle 1
        </span>
      </div>

      {spansBoundary && (
        <div
          className="mt-2 grid transition-opacity duration-500"
          style={{
            gridTemplateColumns: gridTemplate,
            opacity: stitchOn ? 1 : 0,
          }}
        >
          <div
            className="self-center border-t border-dashed border-amber-500/70"
            style={{ gridColumn: stitchLeftCol }}
          />
          <div
            className="self-center text-center text-[11px] leading-none text-amber-500"
            style={{ gridColumn: `${AISLE_SIZE + 1} / ${AISLE_SIZE + 2}` }}
          >
            ⌣
          </div>
          <div
            className="self-center border-t border-dashed border-amber-500/70"
            style={{ gridColumn: stitchRightCol }}
          />
          <div
            className="mt-1 text-center text-[10px] text-amber-500"
            style={{ gridColumn: barCol }}
          >
            stitch
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-skin-base/70">{summary}</div>
    </div>
  );
}
