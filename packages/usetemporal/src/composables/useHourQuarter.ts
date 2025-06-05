import { computed, isRef, ref, type Ref, type ComputedRef } from "vue";

import { add, sub } from "date-fns";

import type { TimeUnit, UseTimeUnitOptions } from "../types";

const isSameHourQuarter = (start: Date, end: Date): boolean => {
  const getHourQuarter = (date: Date): number =>
    Math.round(date.getMinutes() / 15);
  return getHourQuarter(start) === getHourQuarter(end);
};

export default function useHourQuarter(options: UseTimeUnitOptions): TimeUnit {
  const now = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  const isNow: ComputedRef<boolean> = computed(() =>
    isSameHourQuarter(now.value, browsing.value)
  );

  const start: ComputedRef<Date> = computed(() => {
    const quarterMinutes = Math.floor(browsing.value.getMinutes() / 15) * 15;
    const quarterStart = new Date(browsing.value);
    quarterStart.setMinutes(quarterMinutes, 0, 0);
    return quarterStart;
  });

  const end: ComputedRef<Date> = computed(() => {
    const quarterStart = start.value;
    const quarterEnd = new Date(quarterStart);
    quarterEnd.setMinutes(quarterStart.getMinutes() + 14, 59, 999);
    return quarterEnd;
  });

  const number: ComputedRef<number> = computed(() =>
    Math.round(browsing.value.getMinutes() / 15)
  );
  const raw: ComputedRef<Date> = computed(() => browsing.value);
  const timespan = computed(() => ({ start: start.value, end: end.value }));
  const name: ComputedRef<string> = computed(() => `Quarter ${number.value}`);

  const future = (): void => {
    browsing.value = add(browsing.value, {
      minutes: 15,
    });
  };

  const past = (): void => {
    browsing.value = sub(browsing.value, {
      minutes: 15,
    });
  };

  const isSame = (a: Date, b: Date): boolean => isSameHourQuarter(a, b);

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
  };
}
