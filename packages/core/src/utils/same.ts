import type { DateAdapter } from "../types/core";

export const same = (
  a: Date | null | undefined,
  b: Date | null | undefined,
  unit: string,
  adapter: DateAdapter
): boolean => {
  if (!a || !b) return false;
  return adapter.isSame(a, b, unit as any);
};