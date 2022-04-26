export const rand = (min: number, max: number) => {
  return Math.floor(Math.random() * (+max - +min)) + +min;
};

export const groupBy = <T extends Record<string, any>, K extends keyof T>(
  arr: T[],
  key: K,
): Record<string, T[]> =>
  arr.reduce(
    (acc, item) => ((acc[item[key]] = [...(acc[item[key]] || []), item]), acc),
    {} as Record<string, T[]>,
  );
