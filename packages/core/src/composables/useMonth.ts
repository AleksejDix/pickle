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

  // Adapter is required - no fallback!
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
  const name: ComputedRef<string> = computed(() => {
    const month = browsing.value.toLocaleDateString('en-US', { month: 'long' });
    const year = browsing.value.getFullYear();
    return `${month} ${year}`;
  });

  const format = (date: Date): number => {
    return date.getMonth() + 1;
  };

  const future = (): void => {
    browsing.value = adapter.add(browsing.value, { months: 1 });
  };
  const past = (): void => {
    browsing.value = adapter.subtract(browsing.value, { months: 1 });
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
    format,
    raw,
    isSame,
    browsing,
    weekDay,
    start,
    end,
  };
}
