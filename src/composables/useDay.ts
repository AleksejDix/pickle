import {
  computed,
  isRef,
  ref,
  type Ref,
  type ComputedRef,
} from "@vue/reactivity";

import { same } from "../utils/same";
import type { UseTimeUnitOptions, ExtendedTimeUnit } from "../types/reactive";

export default function useDay(options: UseTimeUnitOptions): ExtendedTimeUnit {
  const now: Ref<Date> = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  // Adapter is required - no fallback!
  const adapter = options.adapter;
  if (!adapter) {
    throw new Error("Adapter is required for useDay composable");
  }

  const isSame = (a: Date, b: Date): boolean => {
    return same(a, b, "day", adapter);
  };

  const isNow: ComputedRef<boolean> = computed(() =>
    isSame(now.value, browsing.value)
  );
  const start: ComputedRef<Date> = computed(() => 
    adapter.startOf(browsing.value, "day")
  );
  const end: ComputedRef<Date> = computed(() => 
    adapter.endOf(browsing.value, "day")
  );
  const number: ComputedRef<number> = computed(() =>
    formatNumber(browsing.value)
  );
  const raw: ComputedRef<Date> = computed(() => browsing.value);
  const timespan: ComputedRef<{ start: Date; end: Date }> = computed(() => ({
    start: start.value,
    end: end.value,
  }));
  const name: ComputedRef<string> = computed(() => formatName(browsing.value));
  const we: ComputedRef<boolean> = computed(() => adapter.isWeekend(browsing.value));

  const formatNumber = (date: Date): number => {
    return date.getDate();
  };

  const formatName = (date: Date): string => {
    // Return a descriptive name like "Monday, Jan 15"
    return adapter.format(date, "EEEE, MMM d");
  };

  const future = (): void => {
    browsing.value = adapter.add(browsing.value, { days: 1 });
  };

  const past = (): void => {
    browsing.value = adapter.subtract(browsing.value, { days: 1 });
  };

  return {
    future,
    past,
    timespan,
    isNow,
    number,
    name,
    format: formatNumber,
    raw,
    isSame,
    browsing,
    we,
  };
}