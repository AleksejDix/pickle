import { ref, unref, isRef, type Ref } from "@vue/reactivity";
import type { TimeUnitType } from "../types/core";
import type {
  ReactiveCreateTemporalOptions,
  TemporalCore,
  TimeUnit,
} from "../types/reactive";
import type { DateAdapter } from "../types/core";
import { createTimeUnit } from "./timeUnitFactory";

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

  // Use provided adapter or throw error
  if (!options.dateAdapter) {
    throw new Error(
      "A date adapter is required. Please install and provide an adapter from @usetemporal/adapter-* packages."
    );
  }
  
  const adapter: DateAdapter = options.dateAdapter;

  const browsing = ref<Date>(unref(date));
  const picked = date;

  function divide(interval: TimeUnit, unit: TimeUnitType): TimeUnit[] {
    const timespan = interval.timespan.value;
    const dates = adapter.eachInterval(
      timespan.start,
      timespan.end,
      unit as any
    );

    const results: TimeUnit[] = [];
    
    for (const date of dates) {
      const timeUnit = createTimeUnit(unit, {
        now: now,
        browsing: ref(date),
        adapter: adapter,
      });
      
      if (timeUnit) {
        results.push(timeUnit);
      }
    }
    
    return results;
  }

  function f(date: Date, timeoptions: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(locale.value, timeoptions).format(date);
  }

  return { browsing, picked, now, adapter, divide, f };
}

// Temporarily disabled due to circular dependency
// TODO: Fix circular dependency between createTemporal and composables
/*
function getComposableForUnit(unit: TimeUnitType) {
  // Implementation removed to avoid circular dependency
  return null;
}
*/
