import { computed, isRef, ref, type Ref, type ComputedRef } from "vue";

import { add, sub } from "date-fns";

import type { TimeUnit, UseTimeUnitOptions } from "../types";

const getMillenium = (date: Date): number => {
  const year = date.getFullYear();
  return Math.floor(year / 1000) * 1000;
};

const isSameMillenium = (dirtyDateLeft: Date, dirtyDateRight: Date): boolean =>
  getMillenium(dirtyDateLeft) === getMillenium(dirtyDateRight);

export default function useMillenium(options: UseTimeUnitOptions): TimeUnit {
  const now = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  const isNow: ComputedRef<boolean> = computed(() =>
    isSameMillenium(now.value, browsing.value)
  );

  const start: ComputedRef<Date> = computed(() => {
    const millennium = getMillenium(browsing.value);
    return new Date(millennium, 0, 1);
  });

  const end: ComputedRef<Date> = computed(() => {
    const millennium = getMillenium(browsing.value);
    return new Date(millennium + 999, 11, 31, 23, 59, 59, 999);
  });

  const number: ComputedRef<number> = computed(() =>
    getMillenium(browsing.value)
  );
  const raw: ComputedRef<Date> = computed(() => browsing.value);
  const timespan = computed(() => ({ start: start.value, end: end.value }));
  const name: ComputedRef<string> = computed(() => `${number.value}s`);

  const future = (): void => {
    browsing.value = add(browsing.value, {
      years: 1000,
    });
  };

  const past = (): void => {
    browsing.value = sub(browsing.value, {
      years: 1000,
    });
  };

  const isSame = (a: Date, b: Date): boolean => isSameMillenium(a, b);

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
