// Adapter Registry and Auto-Detection System
// Smart adapter selection with graceful fallbacks

import type { DateAdapter, AdapterName } from "./types";
import { nativeAdapter } from "./native";

// Adapter registry
const adapters = new Map<AdapterName, () => DateAdapter>();

// Register native adapter (always available)
adapters.set("native", () => nativeAdapter);

// Register date-fns adapter (lazy-loaded)
adapters.set("date-fns", () => {
  try {
    const { createDateFnsAdapter } = require("./date-fns");
    return createDateFnsAdapter();
  } catch (error) {
    console.warn("date-fns adapter not available:", error);
    return nativeAdapter;
  }
});

// Register future adapters
adapters.set("luxon", () => {
  try {
    const { createLuxonAdapter } = require("./luxon");
    return createLuxonAdapter();
  } catch (error) {
    console.warn("luxon adapter not available:", error);
    return nativeAdapter;
  }
});

adapters.set("temporal", () => {
  try {
    const { createTemporalAdapter } = require("./temporal-api");
    return createTemporalAdapter();
  } catch (error) {
    console.warn("temporal-api adapter not available:", error);
    return nativeAdapter;
  }
});

// Auto-detection logic
function detectAvailableAdapter(): AdapterName {
  // Priority order: Temporal API > date-fns > Luxon > native
  const detectionOrder: AdapterName[] = [
    "temporal",
    "date-fns",
    "luxon",
    "native",
  ];

  for (const adapterName of detectionOrder) {
    if (isAdapterAvailable(adapterName)) {
      return adapterName;
    }
  }

  // Fallback to native (always available)
  return "native";
}

function isAdapterAvailable(adapterName: AdapterName): boolean {
  if (adapterName === "native") return true;

  try {
    switch (adapterName) {
      case "date-fns":
        require.resolve("date-fns");
        return true;
      case "luxon":
        require.resolve("luxon");
        return true;
      case "temporal":
        // Check for native Temporal API
        return typeof (globalThis as any).Temporal !== "undefined";
      default:
        return false;
    }
  } catch {
    return false;
  }
}

export function createAdapter(name: AdapterName = "auto"): DateAdapter {
  const adapterName = name === "auto" ? detectAvailableAdapter() : name;

  const factory = adapters.get(adapterName);
  if (!factory) {
    console.warn(`Unknown adapter: ${adapterName}, falling back to native`);
    return nativeAdapter;
  }

  try {
    return factory();
  } catch (error) {
    console.warn(`Failed to create adapter ${adapterName}:`, error);
    return nativeAdapter;
  }
}

// Register custom adapter
export function registerAdapter(
  name: string,
  factory: () => DateAdapter
): void {
  adapters.set(name as AdapterName, factory);
}

// Get available adapters
export function getAvailableAdapters(): AdapterName[] {
  return Array.from(adapters.keys()).filter(
    (name) => name === "native" || isAdapterAvailable(name)
  );
}

// Debug function to test adapter availability
export function testAdapterAvailability(): Record<AdapterName, boolean> {
  const result: Record<string, boolean> = {};

  for (const [name] of adapters) {
    result[name] = isAdapterAvailable(name);
  }

  return result as Record<AdapterName, boolean>;
}
