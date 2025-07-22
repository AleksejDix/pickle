import {
  computed,
  isRef,
  ref,
  type Ref,
  type ComputedRef,
} from "@vue/reactivity";
import {
  isSameHour,
  add,
  sub,
  startOfHour,
  endOfHour,
  format as dateFormat,
} from "date-fns";

import type { ExtendedTimeUnit, UseTimeUnitOptions } from "../types/reactive";

export default function useHour(options: UseTimeUnitOptions): ExtendedTimeUnit {
  const now = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  const isNow: ComputedRef<boolean> = computed(() =>
    isSameHour(now.value, browsing.value)
  );

  const start: ComputedRef<Date> = computed(() => startOfHour(browsing.value));
  const end: ComputedRef<Date> = computed(() => endOfHour(browsing.value));

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
    return dateFormat(date, "h:mm a");
  };

  const future = (): void => {
    browsing.value = add(browsing.value, {
      hours: 1,
    });
  };

  const past = (): void => {
    browsing.value = sub(browsing.value, {
      hours: 1,
    });
  };

  const isSame = (a: Date, b: Date): boolean => isSameHour(a, b);

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
