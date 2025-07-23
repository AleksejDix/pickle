import {
  computed,
  isRef,
  ref,
  type Ref,
  type ComputedRef,
} from "@vue/reactivity";

import { same } from "../utils/same";
import type { UseTimeUnitOptions, ExtendedTimeUnit } from "../types/reactive";

export default function useWeek(options: UseTimeUnitOptions): ExtendedTimeUnit {
  const now: Ref<Date> = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  // Adapter is required - no fallback!
  const adapter = options.adapter;
  if (!adapter) {
    throw new Error("Adapter is required for useWeek composable");
  }

  const isSame = (a: Date, b: Date): boolean => {
    return same(a, b, "week", adapter);
  };

  const isNow: ComputedRef<boolean> = computed(() =>
    isSame(now.value, browsing.value)
  );
  const start: ComputedRef<Date> = computed(() =>
    adapter.startOf(browsing.value, "week", { weekStartsOn: 1 })
  );
  const end: ComputedRef<Date> = computed(() =>
    adapter.endOf(browsing.value, "week", { weekStartsOn: 1 })
  );
  const number: ComputedRef<number> = computed(() => format(browsing.value));
  const raw: ComputedRef<Date> = computed(() => browsing.value);
  const timespan: ComputedRef<{ start: Date; end: Date }> = computed(() => ({
    start: start.value,
    end: end.value,
  }));
  const name: ComputedRef<string> = computed(() => number.value.toString());

  const format = (date: Date): number => {
    // TODO: Add getWeekOfYear to adapter interface
    // For now, calculate week number manually
    const startOfYear = adapter.startOf(date, "year");
    const startOfWeekForDate = adapter.startOf(date, "week", { weekStartsOn: 1 });
    const daysDiff = Math.floor((startOfWeekForDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(daysDiff / 7) + 1;
  };

  const future = (): void => {
    browsing.value = adapter.add(browsing.value, { weeks: 1 });
  };

  const past = (): void => {
    browsing.value = adapter.subtract(browsing.value, { weeks: 1 });
  };

  return {
    future,
    past,
    timespan,
    isNow,
    number,
    name,
    raw,
    isSame,
    browsing,
    format,
  };
}
