import { computed, isRef, ref, type Ref, type ComputedRef } from "vue";

import {
  isSameQuarter,
  add,
  sub,
  startOfQuarter,
  endOfQuarter,
} from "date-fns";

import { same } from "../core/usePickle";
import type { ExtendedTimeUnit, UseTimeUnitOptions } from "../types";

const isSame = (a: Date, b: Date): boolean => same(a, b, "yearQuarter");

export default function useYearQuarter(
  options: UseTimeUnitOptions
): ExtendedTimeUnit {
  const now = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  const isNow: ComputedRef<boolean> = computed(() =>
    isSameQuarter(now.value, browsing.value)
  );
  const start: ComputedRef<Date> = computed(() =>
    startOfQuarter(browsing.value)
  );
  const end: ComputedRef<Date> = computed(() => endOfQuarter(browsing.value));
  const number: ComputedRef<number> = computed(() => format(browsing.value));
  const raw: ComputedRef<Date> = computed(() => browsing.value);
  const timespan = computed(() => ({ start: start.value, end: end.value }));
  const name: ComputedRef<string> = computed(() => `Quarter ${number.value}`);

  const format = (date: Date): number => {
    return Math.ceil(date.getMonth() / 3) + 1;
  };

  const future = (): void => {
    browsing.value = add(browsing.value, {
      months: 3,
    });
  };

  const past = (): void => {
    browsing.value = sub(browsing.value, {
      months: 3,
    });
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
