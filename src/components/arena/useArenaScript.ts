import {
  useEffect,
  useRef,
  useState,
  type DependencyList,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Cell } from "./arena-shared";

export type ScriptCtx = {
  wait: (ms: number) => Promise<void>;
  placeCell: (i: number, value: Cell) => void;
  showLabel: (i: number) => void;
  setCursor: Dispatch<SetStateAction<number>>;
  setCells: Dispatch<SetStateAction<Cell[]>>;
  setVisibleLabels: Dispatch<SetStateAction<Set<number>>>;
  cancelled: () => boolean;
};

export function useArenaScript(
  size: number,
  script: (ctx: ScriptCtx) => Promise<void>,
  deps: DependencyList,
  opts?: { timeScale?: number }
) {
  const [cells, setCells] = useState<Cell[]>(() => Array(size).fill(null));
  const [cursor, setCursor] = useState(0);
  const [visibleLabels, setVisibleLabels] = useState<Set<number>>(() => new Set());

  const scaleRef = useRef(opts?.timeScale ?? 1);
  scaleRef.current = opts?.timeScale ?? 1;

  useEffect(() => {
    let cancelled = false;
    let timerId: number | null = null;

    const wait = (ms: number) =>
      new Promise<void>(resolve => {
        timerId = window.setTimeout(() => {
          timerId = null;
          resolve();
        }, ms * scaleRef.current);
      });

    const placeCell = (i: number, value: Cell) =>
      setCells(prev => {
        const next = prev.slice();
        next[i] = value;
        return next;
      });

    const showLabel = (i: number) =>
      setVisibleLabels(prev => {
        const next = new Set(prev);
        next.add(i);
        return next;
      });

    script({
      wait,
      placeCell,
      showLabel,
      setCursor,
      setCells,
      setVisibleLabels,
      cancelled: () => cancelled,
    });

    return () => {
      cancelled = true;
      if (timerId !== null) window.clearTimeout(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    cells,
    cursor,
    visibleLabels,
    setCells,
    setCursor,
    setVisibleLabels,
  };
}
