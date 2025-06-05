import { computed, isRef, ref, type Ref, type ComputedRef } from "vue";

import { isSameMinute, add, sub, startOfMinute, endOfMinute } from "date-fns";

import type { TimeUnit, UseTimeUnitOptions } from "../types";

export default function useMinute(options: UseTimeUnitOptions): TimeUnit {
  const now = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  const isNow: ComputedRef<boolean> = computed(() =>
    isSameMinute(now.value, browsing.value)
  );

  const start: ComputedRef<Date> = computed(() =>
    startOfMinute(browsing.value)
  );
  const end: ComputedRef<Date> = computed(() => endOfMinute(browsing.value));

  const number: ComputedRef<number> = computed(() =>
    browsing.value.getMinutes()
  );
  const raw: ComputedRef<Date> = computed(() => browsing.value);
  const timespan = computed(() => ({ start: start.value, end: end.value }));
  const name: ComputedRef<string> = computed(() => number.value.toString());

  const future = (): void => {
    browsing.value = add(browsing.value, {
      minutes: 1,
    });
  };

  const past = (): void => {
    browsing.value = sub(browsing.value, {
      minutes: 1,
    });
  };

  const isSame = (a: Date, b: Date): boolean => isSameMinute(a, b);

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
