import {
  computed,
  isRef,
  ref,
  type Ref,
  type ComputedRef,
} from "@vue/reactivity";

import { same } from "../utils/same";
import type { ExtendedTimeUnit, UseTimeUnitOptions } from "../types/reactive";

export default function useHour(options: UseTimeUnitOptions): ExtendedTimeUnit {
  const now = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  // Adapter is required - no fallback!
  const adapter = options.adapter;
  if (!adapter) {
    throw new Error("Adapter is required for useHour composable");
  }

  const isSame = (a: Date, b: Date): boolean => {
    return same(a, b, "hour", adapter);
  };

  const isNow: ComputedRef<boolean> = computed(() =>
    isSame(now.value, browsing.value)
  );

  const start: ComputedRef<Date> = computed(() => 
    adapter.startOf(browsing.value, "hour")
  );
  const end: ComputedRef<Date> = computed(() => 
    adapter.endOf(browsing.value, "hour")
  );

  const number: ComputedRef<number> = computed(() =>
    formatNumber(browsing.value)
  );
  const raw: ComputedRef<Date> = computed(() => browsing.value);
  const timespan = computed(() => ({ start: start.value, end: end.value }));
  const name: ComputedRef<string> = computed(() => formatName(browsing.value));

  const formatNumber = (date: Date): number => {
    return date.getHours();
  };

  const formatName = (date: Date): string => {
    // Return a user-friendly time like "2:00 PM"
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const future = (): void => {
    browsing.value = adapter.add(browsing.value, { hours: 1 });
  };

  const past = (): void => {
    browsing.value = adapter.subtract(browsing.value, { hours: 1 });
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
    format: formatNumber,
  };
}