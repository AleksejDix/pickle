import {
  computed,
  isRef,
  ref,
  type Ref,
  type ComputedRef,
} from "@vue/reactivity";

import { same } from "../utils/same";
import type { UseTimeUnitOptions, TimeUnit } from "../types/reactive";

export default function useDay(options: UseTimeUnitOptions): TimeUnit {
  const now: Ref<Date> = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  // Adapter is required - no fallback!
  const adapter = options.adapter;
  if (!adapter) {
    throw new Error("Adapter is required for useDay composable");
  }

  const isSame = (a: Date | null, b: Date | null): boolean => {
    if (!a || !b) return false;
    return same(a, b, "day", adapter);
  };

  const isNow: ComputedRef<boolean> = computed(() =>
    isSame(now.value, browsing.value)
  );
  const start: ComputedRef<Date> = computed(() => 
    adapter.startOf(browsing.value, "day")
  );
  const end: ComputedRef<Date> = computed(() => 
    adapter.endOf(browsing.value, "day")
  );
  const number: ComputedRef<number> = computed(() =>
    browsing.value.getDate()
  );
  const raw: ComputedRef<Date> = computed(() => browsing.value);
  const timespan: ComputedRef<{ start: Date; end: Date }> = computed(() => ({
    start: start.value,
    end: end.value,
  }));


  const future = (): void => {
    browsing.value = adapter.add(browsing.value, { days: 1 });
  };

  const past = (): void => {
    browsing.value = adapter.subtract(browsing.value, { days: 1 });
  };

  return {
    future,
    past,
    timespan,
    isNow,
    number,
    raw,
    isSame,
    browsing,
    start,
    end,
  };
}