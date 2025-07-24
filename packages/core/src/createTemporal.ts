import { ref, isRef, computed, type Ref } from "@vue/reactivity";
import type { Temporal, Period, Adapter } from "./types";

export interface CreateTemporalOptions {
  date: Date | Ref<Date>;
  now?: Date | Ref<Date>;
  adapter: Adapter;
  weekStartsOn?: number;
}

/**
 * Creates a temporal instance - a minimal state container
 * for time navigation with reactive browsing and now values
 */
export function createTemporal(options: CreateTemporalOptions): Temporal {
  if (!options.adapter) {
    throw new Error(
      "A date adapter is required. Please install and provide an adapter from @usetemporal/adapter-* packages."
    );
  }

  const browsingDate = isRef(options.date) ? options.date : ref(options.date);
  const nowDate = isRef(options.now)
    ? options.now
    : ref(options.now || new Date());

  // Create a reactive Period for browsing that represents a point in time
  const browsing = ref<Period>({
    start: browsingDate.value,
    end: browsingDate.value,
    type: "day", // Default browsing unit is day
    date: browsingDate.value,
  });

  // Create a reactive Period for now that represents a point in time
  const now = computed(() => {
    const nowValue = nowDate.value;
    return {
      start: nowValue,
      end: nowValue,
      type: "second" as const, // Most precise unit for a point in time
      date: nowValue,
    };
  });

  return {
    adapter: options.adapter,
    weekStartsOn: options.weekStartsOn ?? 1, // Default to Monday
    browsing,
    now,
  };
}
