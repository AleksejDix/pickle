import type { TimeUnit, UseTimeUnitOptions } from "../types/reactive";
import type { TimeUnitType } from "../types/core";

// Registry for composable functions
const composableRegistry = new Map<TimeUnitType, (options: UseTimeUnitOptions) => TimeUnit>();

// Register a composable for a specific time unit
export function registerComposable(
  unit: TimeUnitType,
  composable: (options: UseTimeUnitOptions) => TimeUnit
): void {
  composableRegistry.set(unit, composable);
}

// Get a composable for a specific time unit
export function getComposable(unit: TimeUnitType): ((options: UseTimeUnitOptions) => TimeUnit) | undefined {
  return composableRegistry.get(unit);
}

// Create a TimeUnit instance
export function createTimeUnit(
  unit: TimeUnitType,
  options: UseTimeUnitOptions
): TimeUnit | null {
  const composable = getComposable(unit);
  if (!composable) {
    console.warn(`No composable registered for unit: ${unit}`);
    return null;
  }
  return composable(options);
}