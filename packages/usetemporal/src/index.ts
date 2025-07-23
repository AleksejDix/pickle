// useTemporal - Convenience meta package
// Provides a simple entry point with native adapter as default

export * from "@usetemporal/core";
export { NativeDateAdapter as DateAdapter } from "@usetemporal/adapter-native";
import { NativeDateAdapter } from "@usetemporal/adapter-native";
import { createTemporal as createTemporalCore } from "@usetemporal/core";
import type {
  CreateTemporalOptions,
  TemporalCore,
} from "@usetemporal/core";

// Convenience function that uses native adapter by default
export function createTemporal(
  options: Omit<CreateTemporalOptions, "dateAdapter"> & {
    dateAdapter?: CreateTemporalOptions["dateAdapter"];
  } = {}
): TemporalCore {
  return createTemporalCore({
    ...options,
    dateAdapter: options.dateAdapter || new NativeDateAdapter(),
  });
}

// Re-export as default
export default createTemporal;
