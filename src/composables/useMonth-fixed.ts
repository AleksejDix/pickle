import {
  computed,
  isRef,
  ref,
  type Ref,
  type ComputedRef,
} from "@vue/reactivity";

import { same } from "../utils/same";
import type { UseTimeUnitOptions, ExtendedTimeUnit } from "../types/reactive";

export default function useMonth(
  options: UseTimeUnitOptions
): ExtendedTimeUnit {
  const now: Ref<Date> = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  // CRITICAL: Must use adapter, not date-fns directly!
  const adapter = options.adapter;
  if (!adapter) {
    throw new Error("Adapter is required for useMonth composable");
  }

  const isSame = (a: Date, b: Date): boolean => {
    return same(a, b, "month", adapter);
  };

  const isNow: ComputedRef<boolean> = computed(() =>
    isSame(now.value, browsing.value)
  );

  // Use adapter instead of date-fns
  const start: ComputedRef<Date> = computed(() => 
    adapter.startOf(browsing.value, "month")
  );
  
  const end: ComputedRef<Date> = computed(() => 
    adapter.endOf(browsing.value, "month")
  );

  const number: ComputedRef<number> = computed(() => format(browsing.value));
  const raw: ComputedRef<Date> = computed(() => browsing.value);

  const timespan: ComputedRef<{ start: Date; end: Date }> = computed(() => ({
    start: start.value,
    end: end.value,
  }));
  
  // Use adapter for formatting
  const name: ComputedRef<string> = computed(() =>
    adapter.format(browsing.value, "MMMM yyyy")
  );

  const format = (date: Date): number => {
    return date.getMonth() + 1;
  };

  // Use adapter for navigation
  const future = (): void => {
    browsing.value = adapter.add(browsing.value, 1, "month");
  };
  
  const past = (): void => {
    browsing.value = adapter.subtract(browsing.value, 1, "month");
  };

  const weekDay: ComputedRef<number> = computed(() => {
    // Use adapter.startOf to get first day of month, then get its weekday
    const firstDay = adapter.startOf(browsing.value, "month");
    const day = firstDay.getDay();
    return day === 0 ? 7 : day;
  });

  return {
    future,
    past,
    timespan,
    isNow,
    number,
    name,
    format,
    raw,
    isSame,
    browsing,
    weekDay,
  };
}