import type { DateAdapter } from "../types/core";

export const same = (
  a: Date | null | undefined,
  b: Date | null | undefined,
  unit: string,
  adapter: DateAdapter
): boolean => {
  if (!a || !b) return false;

  // Handle quarter comparison specially
  if (unit === "quarter") {
    const monthA = a.getMonth();
    const monthB = b.getMonth();
    const yearA = a.getFullYear();
    const yearB = b.getFullYear();

    // Calculate quarters (Q1 = Jan-Mar, Q2 = Apr-Jun, etc)
    const quarterA = Math.floor(monthA / 3);
    const quarterB = Math.floor(monthB / 3);

    return yearA === yearB && quarterA === quarterB;
  }

  return adapter.isSame(a, b, unit as any);
};
