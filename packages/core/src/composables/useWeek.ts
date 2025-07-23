import {
  computed,
  isRef,
  ref,
  type Ref,
  type ComputedRef,
} from "@vue/reactivity";

import { same } from "../utils/same";
import type { UseTimeUnitOptions, TimeUnit } from "../types/reactive";

export default function useWeek(options: UseTimeUnitOptions): TimeUnit {
  const now: Ref<Date> = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  // Adapter is required - no fallback!
  const adapter = options.adapter;
  if (!adapter) {
    throw new Error("Adapter is required for useWeek composable");
  }

  const isSame = (a: Date | null, b: Date | null): boolean => {
    if (!a || !b) return false;
    return same(a, b, "week", adapter);
  };

  const isNow: ComputedRef<boolean> = computed(() =>
    isSame(now.value, browsing.value)
  );
  const start: ComputedRef<Date> = computed(() =>
    adapter.startOf(browsing.value, "week")
  );
  const end: ComputedRef<Date> = computed(() =>
    adapter.endOf(browsing.value, "week")
  );
  const number: ComputedRef<number> = computed(() => format(browsing.value));
  const raw: ComputedRef<Date> = computed(() => browsing.value);
  const timespan: ComputedRef<{ start: Date; end: Date }> = computed(() => ({
    start: start.value,
    end: end.value,
  }));
  const name: ComputedRef<string> = computed(() => {
    const year = browsing.value.getFullYear();
    const weekNum = format(browsing.value);
    return `${year}-W${weekNum}`;
  });

  const format = (date: Date): number => {
    // TODO: Add getWeekOfYear to adapter interface
    // For now, calculate week number manually
    const startOfYear = adapter.startOf(date, "year");
    const startOfWeekForDate = adapter.startOf(date, "week");
    const daysDiff = Math.floor((startOfWeekForDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(daysDiff / 7) + 1;
  };

  const future = (): void => {
    browsing.value = adapter.add(browsing.value, { weeks: 1 });
  };

  const past = (): void => {
    browsing.value = adapter.subtract(browsing.value, { weeks: 1 });
  };

  const weekDay: ComputedRef<number> = computed(() => {
    const day = adapter.getWeekday(start.value);
    return day === 0 ? 7 : day;
  });

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
    weekDay,
    start,
    end,
  };
}
