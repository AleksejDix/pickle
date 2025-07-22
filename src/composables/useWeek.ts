import {
  computed,
  isRef,
  ref,
  type Ref,
  type ComputedRef,
} from "@vue/reactivity";

import { add, sub, startOfWeek, endOfWeek, getWeek } from "date-fns";

import { same } from "../utils/same";
import type { UseTimeUnitOptions, ExtendedTimeUnit } from "../types/reactive";

export default function useWeek(options: UseTimeUnitOptions): ExtendedTimeUnit {
  const now: Ref<Date> = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  const isSame = (a: Date, b: Date): boolean => {
    if (options.adapter) {
      return same(a, b, "week", options.adapter);
    }
    // Fallback for when no adapter is provided
    return (
      getWeek(a, { weekStartsOn: 1 }) === getWeek(b, { weekStartsOn: 1 }) &&
      a.getFullYear() === b.getFullYear()
    );
  };

  const isNow: ComputedRef<boolean> = computed(() =>
    isSame(now.value, browsing.value)
  );
  const start: ComputedRef<Date> = computed(() =>
    startOfWeek(browsing.value, { weekStartsOn: 1 })
  );
  const end: ComputedRef<Date> = computed(() =>
    endOfWeek(browsing.value, { weekStartsOn: 1 })
  );
  const number: ComputedRef<number> = computed(() => format(browsing.value));
  const raw: ComputedRef<Date> = computed(() => browsing.value);
  const timespan: ComputedRef<{ start: Date; end: Date }> = computed(() => ({
    start: start.value,
    end: end.value,
  }));
  const name: ComputedRef<string> = computed(() => number.value.toString());

  const format = (date: Date): number => {
    return getWeek(date, { weekStartsOn: 1 });
  };

  const future = (): void => {
    browsing.value = add(browsing.value, {
      weeks: 1,
    });
  };

  const past = (): void => {
    browsing.value = sub(browsing.value, {
      weeks: 1,
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
