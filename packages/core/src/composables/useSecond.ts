import { computed, isRef, ref, type Ref } from "@vue/reactivity";
import type { TimeUnit, UseTimeUnitOptions } from "../types/reactive";
import { registerComposable } from "../core/timeUnitFactory";
import { same } from "../utils/same";

export default function useSecond(options: UseTimeUnitOptions): TimeUnit {
  const { adapter } = options;

  if (!adapter) {
    throw new Error("Adapter is required for useSecond composable");
  }

  const now: Ref<Date> = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  const raw = computed(() => browsing.value);

  const number = computed(() => raw.value.getSeconds());

  const name = computed(() => {
    const hours = raw.value.getHours();
    const minutes = raw.value.getMinutes();
    const seconds = raw.value.getSeconds();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${period}`;
  });

  const start = computed(() => adapter.startOf(raw.value, "second"));

  const end = computed(() => adapter.endOf(raw.value, "second"));

  const isNow = computed(() => {
    return same(now.value, raw.value, "second", adapter);
  });

  const timespan = computed(() => ({
    start: start.value,
    end: end.value,
  }));

  const future = () => {
    const nextSecond = adapter.add(raw.value, { seconds: 1 });
    browsing.value = nextSecond;
  };

  const past = () => {
    const prevSecond = adapter.subtract(raw.value, { seconds: 1 });
    browsing.value = prevSecond;
  };

  const format = (date: Date) => date.getSeconds();

  const isSame = (a: Date | null, b: Date | null): boolean => {
    return same(a, b, "second", adapter);
  };

  return {
    raw,
    start,
    end,
    isNow,
    timespan,
    number,
    name,
    browsing,
    future,
    past,
    format,
    isSame,
  };
}

// Register with factory
registerComposable("second", useSecond);