import { describe } from "vitest";
import { testAdapterCompliance } from "./adapter-compliance";
import { createMockAdapter } from "./functionalMockAdapter";
import { createNativeAdapter } from "@usetemporal/adapter-native";
import { createDateFnsAdapter } from "@usetemporal/adapter-date-fns";
import { createLuxonAdapter } from "@usetemporal/adapter-luxon";
// import { createTemporalAdapter } from "@usetemporal/adapter-temporal";

// Run compliance tests for all adapters
describe("Adapter Compliance Tests", () => {
  // Mock adapter
  testAdapterCompliance("Mock", createMockAdapter({ weekStartsOn: 1 }));

  // Native adapter
  testAdapterCompliance("Native", createNativeAdapter({ weekStartsOn: 1 }));

  // date-fns adapter
  testAdapterCompliance("date-fns", createDateFnsAdapter({ weekStartsOn: 1 }));

  // Luxon adapter
  testAdapterCompliance("Luxon", createLuxonAdapter({ weekStartsOn: 1 }));

  // Temporal adapter - skip if not available
  // Note: Temporal API requires a polyfill or modern environment
  // Uncomment when running with proper polyfill:
  // testAdapterCompliance("Temporal", createTemporalAdapter({ weekStartsOn: 1 }));
});