import { ref, isRef, type Ref } from "@vue/reactivity";
import type { Temporal } from "./types/period";
import type { DateAdapter } from "./types/core";

export interface CreateTemporalOptions {
  date: Date | Ref<Date>;
  now?: Date | Ref<Date>;
  dateAdapter: DateAdapter;
  weekStartsOn?: number;
}

/**
 * Creates a temporal instance - a minimal state container
 * for time navigation with reactive browsing and now values
 */
export function createTemporal(options: CreateTemporalOptions): Temporal {
  if (!options.dateAdapter) {
    throw new Error(
      "A date adapter is required. Please install and provide an adapter from @usetemporal/adapter-* packages."
    );
  }

  const date = isRef(options.date) ? options.date : ref(options.date);

  const now = isRef(options.now) ? options.now : ref(options.now || new Date());

  return {
    adapter: options.dateAdapter,
    weekStartsOn: options.weekStartsOn ?? 1, // Default to Monday
    browsing: date,
    now,
  };
}
