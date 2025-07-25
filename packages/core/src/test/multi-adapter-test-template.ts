/**
 * Template for converting existing tests to multi-adapter tests
 * 
 * BEFORE (single adapter):
 * ```typescript
 * import { createMockAdapter } from "../test/functionalMockAdapter";
 * 
 * describe("myOperation", () => {
 *   const temporal = createTemporal({
 *     adapter: createMockAdapter({ weekStartsOn: 1 }),
 *   });
 *   
 *   it("should do something", () => {
 *     // test
 *   });
 * });
 * ```
 * 
 * AFTER (multi-adapter):
 * ```typescript
 * import { withAllAdapters } from "../test/shared-adapter-tests";
 * 
 * withAllAdapters("myOperation", (adapter) => {
 *   const temporal = createTemporal({ adapter });
 *   
 *   it("should do something", () => {
 *     // test
 *   });
 * });
 * ```
 */

import { describe, it } from "vitest";
import { withAllAdapters, getAdapterTestCases } from "./shared-adapter-tests";
// import { createTemporal } from "../createTemporal";

// Example 1: Using withAllAdapters for simple conversion
export function example1() {
  withAllAdapters("operation name", () => {
    // Setup that uses the adapter
    // const temporal = createTemporal({
    //   adapter,
    //   weekStartsOn: 1,
    //   date: new Date(2024, 0, 1),
    // });

    it("test case 1", () => {
      // Your test here
    });

    it("test case 2", () => {
      // Your test here
    });
  });
}

// Example 2: Using describe.each when you need more control
export function example2() {
  const adapters = getAdapterTestCases();

  describe.each(adapters)("operation with %s adapter", () => {
    // const temporal = createTemporal({
    //   adapter,
    //   weekStartsOn: 1,
    //   date: new Date(2024, 0, 1),
    // });

    it("test case 1", () => {
      // Your test here
    });

    // Can use it.each for parameterized tests within each adapter
    it.each([
      ["input1", "expected1"],
      ["input2", "expected2"],
    ])("should handle %s", () => {
      // Your test here
    });
  });
}

// Example 3: Adapter-specific behavior
export function example3() {
  withAllAdapters("operation with adapter-specific behavior", (_, adapterName) => {
    it("common test", () => {
      // Test that should pass for all adapters
    });

    // Skip tests for specific adapters if needed
    it.skipIf(adapterName === "Mock")("test not applicable to mock adapter", () => {
      // Test that doesn't make sense for mock adapter
    });

    // Run tests only for specific adapters
    it.runIf(adapterName === "Native")("native-specific test", () => {
      // Test specific to native adapter
    });
  });
}