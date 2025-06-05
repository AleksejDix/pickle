import { config } from "@vue/test-utils";

// Global test setup
config.global.stubs = {
  // Stub teleport for testing
  teleport: true,
};

// Mock global Date for consistent testing
const mockDate = new Date("2024-01-15T12:00:00.000Z");
(global as any).mockDate = mockDate;

// Add custom matchers if needed
expect.extend({
  toBeDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    return {
      message: () =>
        pass
          ? `expected ${received} not to be a valid Date`
          : `expected ${received} to be a valid Date`,
      pass,
    };
  },

  toHaveTimespan(received) {
    const pass =
      received &&
      typeof received === "object" &&
      "start" in received &&
      "end" in received &&
      received.start instanceof Date &&
      received.end instanceof Date;

    return {
      message: () =>
        pass
          ? `expected ${received} not to have timespan structure`
          : `expected ${received} to have timespan with start and end dates`,
      pass,
    };
  },
});

// Declare custom matcher types for TypeScript
declare global {
  namespace Vi {
    interface Assertion<T = any> {
      toBeDate(): T;
      toHaveTimespan(): T;
    }
  }
}
