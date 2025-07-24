import { computed, type ComputedRef, type Ref } from "@vue/reactivity";
import type { Period, Temporal, Unit } from "../types";
import { createPeriod } from "../operations";

/**
 * Creates a reactive period of any unit type
 * This is the unified composable that can replace all individual unit composables
 *
 * @example
 * const year = usePeriod(temporal, "year")
 * const month = usePeriod(temporal, "month")
 * const customUnit = usePeriod(temporal, unitRef) // reactive unit
 */
export function usePeriod(
  temporal: Temporal,
  unit: Unit | Ref<Unit> | ComputedRef<Unit>
): ComputedRef<Period> {
  return computed(() => {
    const unitValue = typeof unit === "string" ? unit : unit.value;
    return createPeriod(temporal, unitValue, temporal.browsing.value);
  });
}
