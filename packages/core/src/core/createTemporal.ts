import { ref, unref, isRef, type Ref } from "@vue/reactivity";
import type { TimeUnitKind } from "../types/core";
import type {
  CreateTemporalOptions,
  TemporalCore,
  TimeUnit,
} from "../types/reactive";
import type { DateAdapter } from "../types/core";
import { createTimeUnit } from "./timeUnitFactory";

export function createTemporal(
  options: CreateTemporalOptions = {}
): TemporalCore {
  const date: Ref<Date> = isRef(options.date)
    ? options.date
    : ref(options.date || new Date());

  const now: Ref<Date> = isRef(options.now)
    ? options.now
    : ref(options.now || new Date());


  // Use provided adapter or throw error
  if (!options.dateAdapter) {
    throw new Error(
      "A date adapter is required. Please install and provide an adapter from @usetemporal/adapter-* packages."
    );
  }
  
  const adapter: DateAdapter = options.dateAdapter;

  const browsing = ref<Date>(unref(date));
  const picked = date;

  function divide(interval: TimeUnit, unit: TimeUnitKind): TimeUnit[] {
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


  return { browsing, picked, now, adapter, divide };
}

// Temporarily disabled due to circular dependency
// TODO: Fix circular dependency between createTemporal and composables
/*
function getComposableForUnit(unit: TimeUnitKind) {
  // Implementation removed to avoid circular dependency
  return null;
}
*/
