import {
  computed,
  isRef,
  ref,
  type Ref,
  type ComputedRef,
} from "@vue/reactivity";
import type { TimeUnit, UseTimeUnitOptions } from "../types/reactive";
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

    // Add contains method for stableMonth
    const contains =
      unitKind === "stableMonth"
        ? (date: Date): boolean => {
            return same(date, raw.value, "month", adapter);
          }
        : undefined;

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
    };

    // Add type identifier and contains method if it's a stableMonth
    if (unitKind === "stableMonth") {
      result._type = "stableMonth";
      (result as any).contains = contains;
    }

    return result;
  };
}
