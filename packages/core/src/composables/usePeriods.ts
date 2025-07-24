import { computed, type ComputedRef } from "@vue/reactivity";
import type { Period, Temporal } from "../types/period";
import { createPeriod } from "../operations";

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
