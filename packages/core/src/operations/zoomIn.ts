import type { Period, Temporal } from "../types/period";
import type { DivideUnit } from "../types/reactive";
import { divide } from "./divide";

/**
 * Zoom in to smaller units
 */
export function zoomIn(
  temporal: Temporal,
  period: Period,
  targetUnit: DivideUnit
): Period[] {
  return divide(temporal, period, targetUnit);
}
