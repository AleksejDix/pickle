import type { DateAdapter } from "../adapters/types";

export const same = (
  a: Date | null | undefined,
  b: Date | null | undefined,
  unit: string,
  adapter: DateAdapter
): boolean => {
  if (!a || !b) return false;
  return adapter.isSame(a, b, unit as any);
};