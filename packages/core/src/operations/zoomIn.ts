import type { Period, Temporal, Unit } from "../types";
import { divide } from "./divide";

/**
 * Zoom in to smaller units
 */
export function zoomIn(
  temporal: Temporal,
  period: Period,
  targetUnit: Unit
): Period[] {
  return divide(temporal, period, targetUnit);
}
