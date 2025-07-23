import { computed, isRef, ref, type Ref } from "@vue/reactivity";
import type { TimeUnit, UseTimeUnitOptions } from "../types/reactive";
import { registerComposable } from "../core/timeUnitFactory";
import { same } from "../utils/same";

export default function useQuarter(options: UseTimeUnitOptions): TimeUnit {
  const { adapter } = options;

  if (!adapter) {
    throw new Error("Adapter is required for useQuarter composable");
  }

  const now: Ref<Date> = isRef(options.now) ? options.now : ref(options.now);
  const browsing: Ref<Date> = isRef(options.browsing)
    ? options.browsing
    : ref(options.browsing);

  const raw = computed(() => browsing.value);

  // Calculate quarter (Q1 = Jan-Mar, Q2 = Apr-Jun, etc)
  const number = computed(() => {
    const month = raw.value.getMonth();
    return Math.floor(month / 3) + 1;
  });

  const name = computed(() => {
    const year = raw.value.getFullYear();
    const q = number.value;
    return `Q${q} ${year}`;
  });

  const start = computed(() => {
    const year = raw.value.getFullYear();
    const quarterStartMonth = (number.value - 1) * 3;
    const startDate = new Date(year, quarterStartMonth, 1);
    return adapter.startOf(startDate, "month");
  });

  const end = computed(() => {
    const year = raw.value.getFullYear();
    const quarterEndMonth = number.value * 3 - 1;
    const endDate = new Date(year, quarterEndMonth, 1);
    return adapter.endOf(endDate, "month");
  });

  const isNow = computed(() => {
    return same(now.value, raw.value, "quarter", adapter);
  });

  const timespan = computed(() => ({
    start: start.value,
    end: end.value,
  }));

  const future = () => {
    const nextQuarter = adapter.add(start.value, { months: 3 });
    browsing.value = nextQuarter;
  };

  const past = () => {
    const prevQuarter = adapter.subtract(start.value, { months: 3 });
    browsing.value = prevQuarter;
  };

  const format = (date: Date) => {
    const month = date.getMonth();
    return Math.floor(month / 3) + 1;
  };

  const isSame = (a: Date | null, b: Date | null): boolean => {
    return same(a, b, "quarter", adapter);
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
registerComposable("quarter", useQuarter);