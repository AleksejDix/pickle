import type { Adapter } from "./types";

/**
 * Unit Definition - defines how to create and validate periods for a unit type
 */
export interface UnitDefinition {
  /**
   * Create a normalized period of this unit type from any date
   */
  createPeriod(date: Date, adapter: Adapter): {
    start: Date;
    end: Date;
  };
  
  /**
   * Validate that a period conforms to this unit's rules (optional)
   */
  validate?(period: { start: Date; end: Date; type: string }): boolean;
  
  /**
   * What units this can divide into (for divide operation)
   */
  divisions?: string[];
  
  /**
   * What unit multiple of these merge into (for merge operation)
   */
  mergesTo?: string;
}

/**
 * Global unit registry
 */
const unitRegistry = new Map<string, UnitDefinition>();

/**
 * Define a custom unit type
 */
export function defineUnit(type: string, definition: UnitDefinition): void {
  if (unitRegistry.has(type)) {
    console.warn(`Unit type "${type}" is already defined. Overwriting previous definition.`);
  }
  unitRegistry.set(type, definition);
}

/**
 * Get a unit definition
 */
export function getUnitDefinition(type: string): UnitDefinition | undefined {
  return unitRegistry.get(type);
}

/**
 * Check if a unit is defined
 */
export function hasUnit(type: string): boolean {
  return unitRegistry.has(type);
}

/**
 * Get all registered unit types
 */
export function getRegisteredUnits(): string[] {
  return Array.from(unitRegistry.keys());
}

/**
 * Clear all unit definitions (useful for testing)
 */
export function clearUnitRegistry(): void {
  unitRegistry.clear();
}