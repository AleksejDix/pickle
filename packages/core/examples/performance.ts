/**
 * Example: Performance Benefits of Functional API
 */
import {
  createTemporal,
  useYear,
  divide,
  contains,
  // Only import what you need - better tree-shaking!
} from "@usetemporal/core";
import { createNativeAdapter } from "@usetemporal/adapter-native";

/**
 * Old API (Object-Oriented)
 * Problem: Every TimeUnit has ALL methods, even if unused
 *
 * const year = periods.year(temporal, temporal);
 * year.next();        // Method exists even if never called
 * year.previous();    // Method exists even if never called
 * year.go();          // Method exists even if never called
 * year.contains();    // Method exists even if never called
 * year.zoomIn();      // Method exists even if never called
 * year.zoomOut();     // Method exists even if never called
 * // ... many more methods
 */

/**
 * New API (Functional)
 * Benefit: Import only what you use
 */
const temporal = createTemporal({
  dateAdapter: createNativeAdapter(),
});

// Only the code you actually use is included
const year = useYear(temporal);
const months = divide(temporal, year.value, "month");

// Tree-shaking removes unused operations like:
// - next, previous, go (not imported)
// - zoomIn, zoomOut (not imported)
// - split, merge (not imported)

/**
 * Performance comparison
 */
console.time("Create 1000 periods - Functional");
for (let i = 0; i < 1000; i++) {
  const y = useYear(temporal);
  // Period is just a plain object - no method overhead
}
console.timeEnd("Create 1000 periods - Functional");

console.time("Operations on 1000 periods");
const testYear = useYear(temporal);
for (let i = 0; i < 1000; i++) {
  // Pure functions - can be optimized by JS engine
  const hasDate = contains(testYear.value, new Date());
}
console.timeEnd("Operations on 1000 periods");

/**
 * Memory efficiency
 */
const year1 = useYear(temporal);
const year2 = useYear(temporal);

console.log("Periods share the same structure:");
console.log("year1 keys:", Object.keys(year1.value));
console.log("year2 keys:", Object.keys(year2.value));
// Both have exactly: start, end, type, value, number
// No methods = less memory per instance

/**
 * Composition benefits
 */
// You can easily create optimized functions
const isInCurrentYear = (date: Date) => {
  const y = useYear(temporal);
  return contains(y.value, date);
};

// Batch operations are more efficient
const dates = [
  new Date(2024, 0, 1),
  new Date(2024, 6, 1),
  new Date(2025, 0, 1),
];

console.time("Check 1000 dates");
const currentYear = useYear(temporal).value; // Get once
for (let i = 0; i < 1000; i++) {
  dates.forEach((date) => contains(currentYear, date));
}
console.timeEnd("Check 1000 dates");

/**
 * Bundle size comparison
 */
console.log(`
Bundle Size Benefits:
- Old API: Every TimeUnit includes ~15 methods
- New API: Period is just data (5 properties)
- Old API: Must include reactive refs for all computed properties
- New API: Only include reactivity where needed

Example savings:
- If you only use 'divide' and 'contains':
  - Old: Includes all TimeUnit methods (~3KB per type)
  - New: Only includes 2 functions (~500B total)
`);
