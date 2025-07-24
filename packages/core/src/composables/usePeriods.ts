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

/**
 * Creates a reactive year period
 */
export function useYear(temporal: Temporal): ComputedRef<Period> {
  return computed(() =>
    createPeriod(temporal, "year", temporal.browsing.value)
  );
}

/**
 * Creates a reactive month period
 */
export function useMonth(temporal: Temporal): ComputedRef<Period> {
  return computed(() =>
    createPeriod(temporal, "month", temporal.browsing.value)
  );
}

/**
 * Creates a reactive week period
 */
export function useWeek(temporal: Temporal): ComputedRef<Period> {
  return computed(() =>
    createPeriod(temporal, "week", temporal.browsing.value)
  );
}

/**
 * Creates a reactive day period
 */
export function useDay(temporal: Temporal): ComputedRef<Period> {
  return computed(() => createPeriod(temporal, "day", temporal.browsing.value));
}

/**
 * Creates a reactive hour period
 */
export function useHour(temporal: Temporal): ComputedRef<Period> {
  return computed(() =>
    createPeriod(temporal, "hour", temporal.browsing.value)
  );
}

/**
 * Creates a reactive minute period
 */
export function useMinute(temporal: Temporal): ComputedRef<Period> {
  return computed(() =>
    createPeriod(temporal, "minute", temporal.browsing.value)
  );
}

/**
 * Creates a reactive second period
 */
export function useSecond(temporal: Temporal): ComputedRef<Period> {
  return computed(() =>
    createPeriod(temporal, "second", temporal.browsing.value)
  );
}

/**
 * Creates a reactive quarter period
 */
export function useQuarter(temporal: Temporal): ComputedRef<Period> {
  return computed(() =>
    createPeriod(temporal, "quarter", temporal.browsing.value)
  );
}

/**
 * Creates a reactive stable month period
 */
export function useStableMonth(temporal: Temporal): ComputedRef<Period> {
  return computed(() =>
    createPeriod(temporal, "stableMonth", temporal.browsing.value)
  );
}
