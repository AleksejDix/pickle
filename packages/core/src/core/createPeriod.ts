import {
  computed,
  isRef,
  ref,
  type Ref,
  type ComputedRef,
} from "@vue/reactivity";
import type {
  TimeUnit,
  UseTimeUnitOptions,
  DivideUnit,
} from "../types/reactive";
import type { TimeUnitKind } from "../types/core";
import { same } from "../utils/same";

// Factory function to create time unit composables
export function createPeriod(
  unitKind: TimeUnitKind,
  getNumber: (date: Date, adapter?: any) => number
): (options: UseTimeUnitOptions) => TimeUnit {
  return function (options: UseTimeUnitOptions): TimeUnit {
    const now: Ref<Date> = isRef(options.now) ? options.now : ref(options.now);
    const browsing: Ref<Date> = isRef(options.browsing)
      ? options.browsing
      : ref(options.browsing);

    // Adapter is required
    const adapter = options.adapter;
    if (!adapter) {
      throw new Error(
        `Adapter is required for use${unitKind.charAt(0).toUpperCase() + unitKind.slice(1)} composable`
      );
    }

    const raw: ComputedRef<Date> = computed(() => browsing.value);

    const number: ComputedRef<number> = computed(() =>
      getNumber(raw.value, adapter)
    );

    const start: ComputedRef<Date> = computed(() =>
      (unitKind === "week" || unitKind === "stableMonth") &&
      options.weekStartsOn !== undefined
        ? adapter.startOf(raw.value, unitKind, {
            weekStartsOn: options.weekStartsOn,
          })
        : adapter.startOf(raw.value, unitKind)
    );

    const end: ComputedRef<Date> = computed(() =>
      (unitKind === "week" || unitKind === "stableMonth") &&
      options.weekStartsOn !== undefined
        ? adapter.endOf(raw.value, unitKind, {
            weekStartsOn: options.weekStartsOn,
          })
        : adapter.endOf(raw.value, unitKind)
    );

    const period: ComputedRef<{ start: Date; end: Date }> = computed(() => ({
      start: start.value,
      end: end.value,
    }));

    const isSame = (a: Date | null, b: Date | null): boolean => {
      if (!a || !b) return false;
      return same(a, b, unitKind, adapter);
    };

    const isNow: ComputedRef<boolean> = computed(() =>
      isSame(now.value, browsing.value)
    );

    // Navigation methods
    const next = (): void => {
      if (unitKind === "stableMonth") {
        browsing.value = adapter.add(browsing.value, { months: 1 });
      } else {
        browsing.value = adapter.add(browsing.value, {
          [`${unitKind}s`]: 1,
        } as any);
      }
    };

    const previous = (): void => {
      if (unitKind === "stableMonth") {
        browsing.value = adapter.subtract(browsing.value, { months: 1 });
      } else {
        browsing.value = adapter.subtract(browsing.value, {
          [`${unitKind}s`]: 1,
        } as any);
      }
    };

    const go = (steps: number): void => {
      if (steps === 0) return;

      if (unitKind === "stableMonth") {
        browsing.value =
          steps > 0
            ? adapter.add(browsing.value, { months: steps })
            : adapter.subtract(browsing.value, { months: Math.abs(steps) });
      } else {
        browsing.value =
          steps > 0
            ? adapter.add(browsing.value, {
                [`${unitKind}s`]: steps,
              } as any)
            : adapter.subtract(browsing.value, {
                [`${unitKind}s`]: Math.abs(steps),
              } as any);
      }
    };

    // Universal contains method for all time units
    const contains = (target: Date | TimeUnit): boolean => {
      const targetDate = target instanceof Date ? target : target.raw.value;

      if (unitKind === "stableMonth") {
        // StableMonth has special behavior - only contains actual month days
        return same(targetDate, raw.value, "month", adapter);
      }

      // For all other time units, check if target is within period boundaries
      const startTime = start.value.getTime();
      const endTime = end.value.getTime();
      const targetTime = targetDate.getTime();

      return targetTime >= startTime && targetTime <= endTime;
    };

    // Placeholder zoom methods - will be enhanced by temporal
    const zoomIn = (_unit: DivideUnit): TimeUnit[] => {
      throw new Error(
        "zoomIn requires temporal context. Use temporal.divide() for now."
      );
    };

    const zoomOut = (_unit: DivideUnit): TimeUnit => {
      throw new Error(
        "zoomOut requires temporal context. This will be implemented soon."
      );
    };

    const zoomTo = (_unit: DivideUnit): TimeUnit => {
      throw new Error(
        "zoomTo requires temporal context. This will be implemented soon."
      );
    };

    const result: TimeUnit = {
      raw,
      start,
      end,
      period,
      isNow,
      number,
      browsing,
      // Navigation methods
      next,
      previous,
      go,
      isSame,
      // Universal contains method
      contains,
      // Zoom navigation methods
      zoomIn,
      zoomOut,
      zoomTo,
    };

    // Add type identifier for stableMonth
    if (unitKind === "stableMonth") {
      result._type = "stableMonth";
    }

    return result;
  };
}
