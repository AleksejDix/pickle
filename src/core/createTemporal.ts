import { ref, unref, isRef, type Ref } from "@vue/reactivity";
import type { TimeUnitType } from "../types/core";
import type {
  ReactiveCreateTemporalOptions,
  TemporalCore,
  TimeUnit,
} from "../types/reactive";
import { createAdapter } from "../adapters";
import type { DateAdapter } from "../adapters/types";

import useYear from "../composables/useYear";
import useMonth from "../composables/useMonth";
import useWeek from "../composables/useWeek";
import useDay from "../composables/useDay";

export const same = (
  a: Date | null | undefined,
  b: Date | null | undefined,
  unit: string,
  adapter: DateAdapter
): boolean => {
  if (!a || !b) return false;
  return adapter.isSame(a, b, unit as any);
};

export function createTemporal(
  options: ReactiveCreateTemporalOptions = {}
): TemporalCore {
  const date: Ref<Date> = isRef(options.date)
    ? options.date
    : ref(options.date || new Date());
  const now: Ref<Date> = isRef(options.now)
    ? options.now
    : ref(options.now || new Date());
  const locale: Ref<string> = isRef(options.locale)
    ? options.locale
    : ref(options.locale || "en");

  // Create adapter instance
  const adapter: DateAdapter =
    typeof options.dateAdapter === "string"
      ? createAdapter(options.dateAdapter)
      : options.dateAdapter || createAdapter("auto");

  const browsing = ref<Date>(unref(date));
  const picked = date;

  function divide(interval: TimeUnit, unit: TimeUnitType): TimeUnit[] {
    const timespan = interval.timespan.value;
    const dates = adapter.eachInterval(
      timespan.start,
      timespan.end,
      unit as any
    );

    // Create appropriate composable function
    const composableFn = getComposableForUnit(unit);
    if (!composableFn) {
      console.warn(`No composable function found for unit: ${unit}`);
      return [];
    }

    return dates.map((date) =>
      composableFn({
        now: now,
        browsing: ref(date),
        adapter: adapter,
      })
    );
  }

  function f(date: Date, timeoptions: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(locale.value, timeoptions).format(date);
  }

  return { browsing, picked, now, adapter, divide, f };
}

function getComposableForUnit(unit: TimeUnitType) {
  const composableMap: Record<string, any> = {
    year: useYear,
    month: useMonth,
    week: useWeek,
    day: useDay,
  };

  return composableMap[unit];
}
