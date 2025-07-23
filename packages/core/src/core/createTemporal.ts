import { ref, unref, isRef, type Ref } from "@vue/reactivity";
import type { TimeUnitKind } from "../types/core";
import type {
  CreateTemporalOptions,
  TemporalCore,
  TimeUnit,
  DivideUnit,
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
  const weekStartsOn = options.weekStartsOn ?? 1; // Default to Monday (international standard)

  const browsing = ref<Date>(unref(date));
  const picked = date;

  function divide(interval: TimeUnit, unit: DivideUnit): TimeUnit[] {
    const period = interval.period.value;

    // Special handling for stableMonth
    if (unit === "stableMonth") {
      // Can only divide stableMonth by day or week
      throw new Error(
        "Cannot divide by stableMonth. Use periods.stableMonth() instead."
      );
    }

    // Special handling when dividing a stableMonth
    if (interval._type === "stableMonth") {
      // This is a stableMonth being divided
      if (unit === "week") {
        // StableMonth always has exactly 6 weeks
        const results: TimeUnit[] = [];
        let currentDate = new Date(period.start);

        for (let i = 0; i < 6; i++) {
          const timeUnit = createTimeUnit("week", {
            now: now,
            browsing: ref(currentDate),
            adapter: adapter,
            weekStartsOn: weekStartsOn,
          });

          if (timeUnit) {
            results.push(timeUnit);
          }

          currentDate = adapter.add(currentDate, { weeks: 1 });
        }

        return results;
      } else if (unit === "day") {
        // StableMonth always has exactly 42 days
        const results: TimeUnit[] = [];
        let currentDate = new Date(period.start);

        for (let i = 0; i < 42; i++) {
          const timeUnit = createTimeUnit("day", {
            now: now,
            browsing: ref(currentDate),
            adapter: adapter,
            weekStartsOn: weekStartsOn,
          });

          if (timeUnit) {
            results.push(timeUnit);
          }

          currentDate = adapter.add(currentDate, { days: 1 });
        }

        return results;
      } else {
        // For stableMonth, only day and week divisions are allowed
        throw new Error(`Cannot divide stableMonth by ${unit}`);
      }
    }

    // Standard division for regular time units
    const dates = adapter.eachInterval(
      period.start,
      period.end,
      unit as TimeUnitKind
    );

    const results: TimeUnit[] = [];

    for (const date of dates) {
      const timeUnit = createTimeUnit(unit as TimeUnitKind, {
        now: now,
        browsing: ref(date),
        adapter: adapter,
        weekStartsOn: weekStartsOn,
      });

      if (timeUnit) {
        results.push(timeUnit);
      }
    }

    return results;
  }

  return { browsing, picked, now, adapter, weekStartsOn, divide };
}
