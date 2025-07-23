import { computed, isRef, ref, type Ref } from "@vue/reactivity";
import type { TimeUnit, UseTimeUnitOptions } from "../types/reactive";
import { registerComposable } from "../core/timeUnitFactory";
import { same } from "../utils/same";

export default function useMinute(options: UseTimeUnitOptions): TimeUnit {
  const { adapter } = options;

  if (!adapter) {
    throw new Error("Adapter is required for useMinute composable");
  }

  const now: Ref<Date> = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  const raw = computed(() => browsing.value);

  const number = computed(() => raw.value.getMinutes());


  const start = computed(() => adapter.startOf(raw.value, "minute"));
  const end = computed(() => adapter.endOf(raw.value, "minute"));

  const isNow = computed(() => {
    return same(now.value, raw.value, "minute", adapter);
  });

  const timespan = computed(() => ({
    start: start.value,
    end: end.value,
  }));

  const future = () => {
    browsing.value = adapter.add(raw.value, { minutes: 1 });
  };

  const past = () => {
    browsing.value = adapter.subtract(raw.value, { minutes: 1 });
  };


  const isSame = (a: Date | null, b: Date | null): boolean => {
    return same(a, b, "minute", adapter);
  };

  return {
    raw,
    start,
    end,
    isNow,
    timespan,
    number,
    browsing,
    future,
    past,
    isSame,
  };
}

// Register with factory
registerComposable("minute", useMinute);