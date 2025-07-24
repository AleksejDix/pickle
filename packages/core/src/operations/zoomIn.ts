import type { Period, Temporal, DivideUnit } from "../types";
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
