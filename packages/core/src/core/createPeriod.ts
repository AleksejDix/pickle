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
      adapter.startOf(raw.value, unitKind)
    );

    const end: ComputedRef<Date> = computed(() =>
      adapter.endOf(raw.value, unitKind)
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

    const future = (): void => {
      browsing.value = adapter.add(browsing.value, {
        [`${unitKind}s`]: 1,
      } as any);
    };

    const past = (): void => {
      browsing.value = adapter.subtract(browsing.value, {
        [`${unitKind}s`]: 1,
      } as any);
    };

    return {
      raw,
      start,
      end,
      period,
      isNow,
      number,
      browsing,
      future,
      past,
      isSame,
    };
  };
}
