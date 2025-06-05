import { computed, isRef, ref, type Ref, type ComputedRef } from "vue";

import { add, sub } from "date-fns";

import { same } from "../core/createTemporal";
import type { TimeUnit, UseTimeUnitOptions } from "../types";

const isSame = (a: Date, b: Date): boolean => same(a, b, "year");

export default function useCentury(options: UseTimeUnitOptions): TimeUnit {
  const now = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  const isNow: ComputedRef<boolean> = computed(() =>
    isSame(now.value, browsing.value)
  );

  const start: ComputedRef<Date> = computed(() => {
    const year = browsing.value.getFullYear();
    const centuryStart = Math.floor(year / 100) * 100;
    return new Date(centuryStart, 0, 1);
  });

  const end: ComputedRef<Date> = computed(() => {
    const year = browsing.value.getFullYear();
    const centuryEnd = Math.floor(year / 100) * 100 + 99;
    return new Date(centuryEnd, 11, 31, 23, 59, 59, 999);
  });

  const number: ComputedRef<number> = computed(
    () => Math.floor(browsing.value.getFullYear() / 100) + 1
  );
  const raw: ComputedRef<Date> = computed(() => browsing.value);
  const timespan = computed(() => ({ start: start.value, end: end.value }));
  const name: ComputedRef<string> = computed(() => `${number.value}th Century`);

  const future = (): void => {
    browsing.value = add(browsing.value, {
      years: 100,
    });
  };

  const past = (): void => {
    browsing.value = sub(browsing.value, {
      years: 100,
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
  };
}
