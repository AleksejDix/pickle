import { ref, unref, isRef, computed, type Ref } from "@vue/reactivity";
import type { TimeUnitKind } from "../types/core";
import type {
  CreateTemporalOptions,
  TemporalCore,
  TimeUnit,
  DivideUnit,
  SplitOptions,
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

  // Split function - more flexible than divide
  function split(period: TimeUnit, options: SplitOptions): TimeUnit[] {
    // If splitting by unit, use existing divide logic
    if (options.by) {
      return divide(period, options.by);
    }

    // If splitting by count, divide period into N equal parts
    if (options.count) {
      const results: TimeUnit[] = [];
      const startTime = period.start.value.getTime();
      const endTime = period.end.value.getTime();
      const duration = endTime - startTime;
      const partDuration = duration / options.count;

      for (let i = 0; i < options.count; i++) {
        const partStart = new Date(startTime + partDuration * i);
        const partEnd = new Date(startTime + partDuration * (i + 1));

        // Create a custom period for each part
        const customPeriod = createCustomPeriod(partStart, partEnd);
        results.push(customPeriod);
      }

      return results;
    }

    // If splitting by duration, create periods of specified length
    if (options.duration) {
      const results: TimeUnit[] = [];
      let current = new Date(period.start.value);
      const endTime = period.end.value.getTime();

      while (current.getTime() < endTime) {
        const partStart = new Date(current);

        // Add duration to get end
        let partEnd = new Date(current);
        if (options.duration.days) {
          partEnd = adapter.add(partEnd, { days: options.duration.days });
        }
        if (options.duration.hours) {
          partEnd = adapter.add(partEnd, { hours: options.duration.hours });
        }
        if (options.duration.weeks) {
          partEnd = adapter.add(partEnd, { weeks: options.duration.weeks });
        }

        // Don't exceed the period end
        if (partEnd.getTime() > endTime) {
          partEnd = new Date(period.end.value);
        }

        const customPeriod = createCustomPeriod(partStart, partEnd);
        results.push(customPeriod);

        current = partEnd;
      }

      return results;
    }

    throw new Error("Split options must specify 'by', 'count', or 'duration'");
  }

  // Merge function - combine periods into larger units
  function merge(periods: TimeUnit[]): TimeUnit | null {
    if (periods.length === 0) return null;

    // Sort periods by start time
    const sorted = [...periods].sort(
      (a, b) => a.start.value.getTime() - b.start.value.getTime()
    );

    // Find the overall start and end
    const overallStart = sorted[0].start.value;
    const overallEnd = sorted[sorted.length - 1].end.value;

    // Check if periods form a natural unit
    const naturalUnit = detectNaturalUnit(sorted);
    if (naturalUnit) {
      // Create the appropriate time unit
      return createTimeUnit(naturalUnit, {
        now: now,
        browsing: ref(overallStart),
        adapter: adapter,
        weekStartsOn: weekStartsOn,
      });
    }

    // Otherwise create a custom period
    return createCustomPeriod(overallStart, overallEnd);
  }

  // Helper to detect if periods form a natural unit
  function detectNaturalUnit(periods: TimeUnit[]): TimeUnitKind | null {
    // Check for 7 consecutive days = week
    if (periods.length === 7) {
      const allDays = periods.every((p, i) => {
        if (i === 0) return true;
        const prevEnd = periods[i - 1].end.value.getTime();
        const currentStart = p.start.value.getTime();
        // Check if consecutive (allowing for millisecond differences)
        return Math.abs(currentStart - prevEnd) < 1000;
      });

      if (allDays) {
        // Additional check: are they all day units?
        const firstDuration =
          periods[0].end.value.getTime() - periods[0].start.value.getTime();
        const dayDuration = 24 * 60 * 60 * 1000;
        if (Math.abs(firstDuration - dayDuration) < 60000) {
          // Within a minute
          return "week";
        }
      }
    }

    // Check for 12 consecutive months = year
    if (periods.length === 12) {
      // Check if all are months and consecutive
      const firstStart = periods[0].start.value;
      const lastEnd = periods[11].end.value;

      // Simple check: if 12 periods span exactly one year
      if (adapter.isSame(firstStart, lastEnd, "year")) {
        return "year";
      }
    }

    // TODO: Add more natural unit detection (quarters, etc.)

    return null;
  }

  // Create a custom period that implements TimeUnit interface
  function createCustomPeriod(start: Date, end: Date): TimeUnit {
    const customBrowsing = ref(start);

    return {
      raw: computed(() => customBrowsing.value),
      start: computed(() => start),
      end: computed(() => end),
      period: computed(() => ({ start, end })),
      isNow: computed(() => {
        const nowTime = now.value.getTime();
        return nowTime >= start.getTime() && nowTime <= end.getTime();
      }),
      number: computed(() => 0), // Custom periods don't have a natural number
      browsing: customBrowsing,

      // Navigation
      next: () => {
        const duration = end.getTime() - start.getTime();
        customBrowsing.value = new Date(
          customBrowsing.value.getTime() + duration
        );
      },
      previous: () => {
        const duration = end.getTime() - start.getTime();
        customBrowsing.value = new Date(
          customBrowsing.value.getTime() - duration
        );
      },
      go: (steps: number) => {
        const duration = end.getTime() - start.getTime();
        customBrowsing.value = new Date(
          customBrowsing.value.getTime() + duration * steps
        );
      },

      // Comparison
      isSame: (a: Date | null, b: Date | null) => {
        if (!a || !b) return false;
        return a.getTime() === b.getTime();
      },

      // Contains
      contains: (target: Date | TimeUnit) => {
        const targetDate = target instanceof Date ? target : target.raw.value;
        const targetTime = targetDate.getTime();
        return targetTime >= start.getTime() && targetTime <= end.getTime();
      },

      // Zoom methods (will be implemented after temporal is created)
      zoomIn: () => {
        throw new Error("zoomIn not yet implemented for custom periods");
      },
      zoomOut: () => {
        throw new Error("zoomOut not yet implemented for custom periods");
      },
      zoomTo: () => {
        throw new Error("zoomTo not yet implemented for custom periods");
      },

      _type: "customPeriod",
    };
  }

  // Alias for createCustomPeriod exposed in the API
  const createPeriod = createCustomPeriod;

  const temporal = {
    browsing,
    picked,
    now,
    adapter,
    weekStartsOn,
    divide,
    split,
    merge,
    createPeriod,
  };

  // Now we need to enhance all TimeUnits with zoom methods that have access to temporal
  // We'll do this by wrapping the createTimeUnit function

  return temporal;
}
