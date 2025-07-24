// useTemporal - Convenience meta package
// Provides a simple entry point with native adapter as default

export * from "@usetemporal/core";
export { NativeDateAdapter as Adapter } from "@usetemporal/adapter-native";
import { NativeDateAdapter } from "@usetemporal/adapter-native";
import { createTemporal as createTemporalCore } from "@usetemporal/core";
import type { CreateTemporalOptions, Temporal } from "@usetemporal/core";
import type { Ref } from "@vue/reactivity";

// Convenience function that uses native adapter by default
export function createTemporal(
  options: Omit<CreateTemporalOptions, "adapter"> & {
    date: Date | Ref<Date>;
    adapter?: CreateTemporalOptions["adapter"];
  }
): Temporal {
  return createTemporalCore({
    ...options,
    adapter: options.adapter || new NativeDateAdapter(),
  });
}

// Re-export as default
export default createTemporal;
