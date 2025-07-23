import type { TimeUnit, UseTimeUnitOptions } from "../types/reactive";
import type { TimeUnitKind } from "../types/core";

// Registry for composable functions
const composableRegistry = new Map<TimeUnitKind, (options: UseTimeUnitOptions) => TimeUnit>();

// Register a composable for a specific time unit
export function registerComposable(
  unit: TimeUnitKind,
  composable: (options: UseTimeUnitOptions) => TimeUnit
): void {
  composableRegistry.set(unit, composable);
}

// Get a composable for a specific time unit
export function getComposable(unit: TimeUnitKind): ((options: UseTimeUnitOptions) => TimeUnit) | undefined {
  return composableRegistry.get(unit);
}

// Create a TimeUnit instance
export function createTimeUnit(
  unit: TimeUnitKind,
  options: UseTimeUnitOptions
): TimeUnit | null {
  const composable = getComposable(unit);
  if (!composable) {
    console.warn(`No composable registered for unit: ${unit}`);
    return null;
  }
  return composable(options);
}