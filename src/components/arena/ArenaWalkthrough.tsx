import { useEffect, useState } from "react";
import ArenaGrid, { type GridLabel } from "./ArenaGrid";
import { dataBg, type Cell, type Hue } from "./arena-shared";
import { useArenaScript } from "./useArenaScript";

type RawStep = { label: string; size: number; align: number; hue: Hue };
type Step = RawStep & {
  offsetBefore: number;
  padStart: number;
  padSize: number;
  dataStart: number;
  offsetAfter: number;
};

type FormulaPhase = "intro" | "subst1" | "subst2" | "result" | "write";

const ARENA_SIZE = 25;

function computeSteps(raw: RawStep[]): Step[] {
  let offset = 0;
  return raw.map(s => {
    const padSize = (s.align - (offset % s.align)) % s.align;
    const padStart = offset;
    const dataStart = offset + padSize;
    const offsetAfter = dataStart + s.size;
    const step: Step = {
      ...s,
      offsetBefore: offset,
      padStart,
      padSize,
      dataStart,
      offsetAfter,
    };
    offset = offsetAfter;
    return step;
  });
}

const steps = computeSteps([
  { label: '"hi"', size: 2, align: 1, hue: "emerald" },
  { label: "int32(99)", size: 4, align: 4, hue: "sky" },
  { label: '"x"', size: 1, align: 1, hue: "emerald" },
  { label: "int64(7)", size: 8, align: 8, hue: "amber" },
  { label: "bool(true)", size: 1, align: 1, hue: "rose" },
]);

function formulaText(s: Step, phase: FormulaPhase): string {
  if (phase === "intro") return "pad = (align - offset % align) % align";
  if (phase === "subst1") return `pad = (${s.align} - offset % ${s.align}) % ${s.align}`;
  return `pad = (${s.align} - ${s.offsetBefore} % ${s.align}) % ${s.align}`;
}

export default function ArenaWalkthrough() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [phase, setPhase] = useState<FormulaPhase>("intro");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const fn = () => setReduced(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);

  const { cells, cursor, visibleLabels } = useArenaScript(
    ARENA_SIZE,
    async ({ wait, placeCell, showLabel, setCursor, setCells, setVisibleLabels, cancelled }) => {
      const fadeOutArena = async () => {
        if (reduced) {
          setCells(Array(ARENA_SIZE).fill(null));
          setVisibleLabels(new Set());
          return;
        }
        setVisibleLabels(new Set());
        for (let i = ARENA_SIZE - 1; i >= 0; i--) {
          placeCell(i, null as Cell);
          await wait(20);
          if (cancelled()) return;
        }
      };

      while (!cancelled()) {
        setCells(Array(ARENA_SIZE).fill(null));
        setCursor(0);
        setActiveStep(null);
        setPhase("intro");
        setVisibleLabels(new Set());
        await wait(1400);
        if (cancelled()) return;

        for (let si = 0; si < steps.length; si++) {
          const step = steps[si];
          setActiveStep(si);
          setPhase("intro");
          await wait(800);
          if (cancelled()) return;

          setPhase("subst1");
          await wait(350);
          if (cancelled()) return;

          setPhase("subst2");
          await wait(450);
          if (cancelled()) return;

          if (step.padSize === 0) {
            setPhase("result");
            await wait(700);
            if (cancelled()) return;
          } else {
            for (let i = 0; i < step.padSize; i++) {
              await wait(160);
              if (cancelled()) return;
              if (i === 0) setPhase("result");
              placeCell(step.padStart + i, { kind: "pad", hue: step.hue });
              setCursor(step.padStart + i + 1);
            }
            await wait(500);
            if (cancelled()) return;
          }

          setPhase("write");
          await wait(300);
          if (cancelled()) return;

          showLabel(si);
          for (let i = 0; i < step.size; i++) {
            await wait(180);
            if (cancelled()) return;
            placeCell(step.dataStart + i, { kind: "data", hue: step.hue });
            setCursor(step.dataStart + i + 1);
          }
          await wait(900);
          if (cancelled()) return;
        }

        setActiveStep(null);
        await wait(2200);
        if (cancelled()) return;
        await fadeOutArena();
        if (cancelled()) return;
        setCursor(0);
        await wait(600);
      }
    },
    [reduced],
    { timeScale: reduced ? 0.25 : 1 }
  );

  const active = activeStep !== null ? steps[activeStep] : null;
  const showPreview = active !== null && (phase === "subst2" || phase === "result");

  const labels: GridLabel[] = steps.map((s, i) => ({
    start: s.dataStart,
    span: s.size,
    text: s.label,
    visible: visibleLabels.has(i),
  }));

  return (
    <div className="not-prose my-8 select-none font-mono">
      <div className="flex flex-col gap-5">
        <div className="min-w-0 overflow-x-auto">
          <ArenaGrid
            size={ARENA_SIZE}
            cells={cells}
            cursor={cursor}
            labels={labels}
            preview={
              showPreview && active
                ? { start: active.dataStart, size: active.size, hue: active.hue }
                : null
            }
            rulerTargetIndex={showPreview && active ? active.dataStart : null}
            minCellWidthPx={10}
            minWidthClass="min-w-[22rem]"
          />
        </div>

        <div>
          <div className="min-h-[8rem] rounded border border-skin-line bg-skin-card/20 p-3 text-xs leading-6">
            {activeStep === null ? (
              <div className="flex h-full flex-col justify-center gap-1 text-skin-base/60">
                <div>
                  <span className="text-skin-base/80">arena</span>{" "}
                  <span className="text-skin-accent">{ARENA_SIZE}</span> bytes
                </div>
                <div>
                  <span className="text-skin-base/80">Reset()</span> → offset ={" "}
                  <span className="text-skin-accent">0</span>
                </div>
              </div>
            ) : (
              (() => {
                const s = steps[activeStep];
                const showResult = phase === "result" || phase === "write";
                const showWrite = phase === "write";
                const zeroPad = s.padSize === 0;
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-[2px] ${dataBg[s.hue]}`}
                          aria-hidden
                        />
                        <span className="text-sm font-medium text-skin-accent">{s.label}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-skin-base/50">
                        step {activeStep + 1} / {steps.length}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded border border-skin-line bg-skin-card/40 px-1.5 py-0.5 text-[10px] text-skin-base/80">
                        offset <span className="text-skin-accent">{s.offsetBefore}</span>
                      </span>
                      <span className="rounded border border-skin-line bg-skin-card/40 px-1.5 py-0.5 text-[10px] text-skin-base/80">
                        align <span className="text-skin-accent">{s.align}</span>
                      </span>
                      <span className="rounded border border-skin-line bg-skin-card/40 px-1.5 py-0.5 text-[10px] text-skin-base/80">
                        size <span className="text-skin-accent">{s.size}</span>
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-skin-base">{formulaText(s, phase)}</span>
                      <span
                        className={`flex items-center gap-2 transition-opacity duration-200 ${showResult ? "opacity-100" : "opacity-0"}`}
                      >
                        <span className="text-skin-base/60">=</span>
                        <span className="font-medium text-skin-accent">{s.padSize}</span>
                        {zeroPad && (
                          <span className="rounded bg-emerald-500/20 px-1 text-[10px] text-emerald-700 dark:text-emerald-300">
                            already aligned ✓
                          </span>
                        )}
                      </span>
                    </div>

                    <div
                      className={`mt-2 flex items-center gap-2 text-skin-base/80 transition-opacity duration-200 ${showWrite ? "opacity-100" : "opacity-0"}`}
                    >
                      <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                      <span>
                        wrote <span className="text-skin-accent">{s.size}</span> byte
                        {s.size > 1 ? "s" : ""} at{" "}
                        <span className="text-skin-accent">
                          [{s.dataStart}, {s.offsetAfter})
                        </span>
                      </span>
                    </div>
                  </>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
