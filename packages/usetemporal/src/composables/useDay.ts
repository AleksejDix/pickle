import { computed, isRef, ref, type Ref, type ComputedRef } from "vue";
import {
  add,
  sub,
  startOfDay,
  endOfDay,
  isWeekend,
  format as dateFormat,
} from "date-fns";

import { same } from "./usePickle";
import type { ExtendedTimeUnit, UseTimeUnitOptions } from "../types";

const isSame = (a: Date, b: Date): boolean => same(a, b, "day");

export default function useDay(options: UseTimeUnitOptions): ExtendedTimeUnit {
  const now = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  const isNow: ComputedRef<boolean> = computed(() =>
    isSame(now.value, browsing.value)
  );
  const start: ComputedRef<Date> = computed(() => startOfDay(browsing.value));
  const end: ComputedRef<Date> = computed(() => endOfDay(browsing.value));
  const number: ComputedRef<number> = computed(() =>
    formatNumber(browsing.value)
  );
  const raw: ComputedRef<Date> = computed(() => browsing.value);
  const timespan = computed(() => ({ start: start.value, end: end.value }));
  const name: ComputedRef<string> = computed(() => formatName(browsing.value));
  const we: ComputedRef<boolean> = computed(() => isWeekend(browsing.value));

  const formatNumber = (date: Date): number => {
    return date.getDate();
  };

  const formatName = (date: Date): string => {
    // Return a descriptive name like "Monday, Jan 15"
    return dateFormat(date, "EEEE, MMM d");
  };

  const future = (): void => {
    browsing.value = add(browsing.value, {
      days: 1,
    });
  };

  const past = (): void => {
    browsing.value = sub(browsing.value, {
      days: 1,
    });
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
