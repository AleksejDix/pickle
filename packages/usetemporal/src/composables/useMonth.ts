import { computed, isRef, ref, type Ref, type ComputedRef } from "vue";

import {
  add,
  sub,
  startOfMonth,
  endOfMonth,
  getDay,
  format as formatDate,
} from "date-fns";

import { same } from "../core/usePickle";
import type { ExtendedTimeUnit, UseTimeUnitOptions } from "../types";

const isSame = (a: Date, b: Date): boolean => same(a, b, "month");

export default function useMonth(
  options: UseTimeUnitOptions
): ExtendedTimeUnit {
  const now = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  const isNow: ComputedRef<boolean> = computed(() =>
    isSame(now.value, browsing.value)
  );
  const start: ComputedRef<Date> = computed(() => startOfMonth(browsing.value));
  const end: ComputedRef<Date> = computed(() => endOfMonth(browsing.value));
  const number: ComputedRef<number> = computed(() => format(browsing.value));
  const raw: ComputedRef<Date> = computed(() => browsing.value);
  const timespan = computed(() => ({ start: start.value, end: end.value }));
  const name: ComputedRef<string> = computed(() =>
    formatDate(browsing.value, "MMMM yyyy")
  );

  const format = (date: Date): number => {
    return date.getMonth() + 1;
  };

  const future = (): void => {
    browsing.value = add(browsing.value, {
      months: 1,
    });
  };

  const past = (): void => {
    browsing.value = sub(browsing.value, {
      months: 1,
    });
  };

  const weekDay: ComputedRef<number> = computed(() => {
    const day = getDay(start.value);
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
    weekDay,
    format,
  };
}
