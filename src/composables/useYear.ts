import {
  computed,
  isRef,
  ref,
  type Ref,
  type ComputedRef,
} from "@vue/reactivity";

import { add, sub, startOfYear, endOfYear, getDay } from "date-fns";

import { same } from "../utils/same";
import type { UseTimeUnitOptions, ExtendedTimeUnit } from "../types/reactive";

export default function useYear(options: UseTimeUnitOptions): ExtendedTimeUnit {
  const now: Ref<Date> = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  const isSame = (a: Date, b: Date): boolean => {
    if (options.adapter) {
      return same(a, b, "year", options.adapter);
    }
    // Fallback for when no adapter is provided
    return a.getFullYear() === b.getFullYear();
  };

  const isNow: ComputedRef<boolean> = computed(() =>
    isSame(now.value, browsing.value)
  );

  const start: ComputedRef<Date> = computed(() => startOfYear(browsing.value));
  const end: ComputedRef<Date> = computed(() => endOfYear(browsing.value));

  const number: ComputedRef<number> = computed(() => format(browsing.value));
  const raw: ComputedRef<Date> = computed(() => browsing.value);

  const timespan: ComputedRef<{ start: Date; end: Date }> = computed(() => ({
    start: start.value,
    end: end.value,
  }));
  const name: ComputedRef<string> = computed(() => number.value.toString());

  const format = (date: Date): number => {
    return date.getFullYear();
  };

  const future = (): void => {
    browsing.value = add(browsing.value, {
      years: 1,
    });
  };
  const past = (): void => {
    browsing.value = sub(browsing.value, {
      years: 1,
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
    format,
    raw,
    isSame,
    browsing,
    weekDay,
  };
}
