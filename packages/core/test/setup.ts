// Test setup for useTemporal
// Framework-agnostic reactive time library

import { beforeEach, vi } from "vitest";

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};

// Setup global test utilities
beforeEach(() => {
  // Reset any global state between tests
  vi.clearAllMocks();
});

// Helper to create deterministic dates for testing
export const createTestDate = (
  year = 2024,
  month = 0,
  day = 15,
  hour = 12,
  minute = 30,
  second = 0
) => {
  return new Date(year, month, day, hour, minute, second, 0);
};

// Helper to test framework-agnostic reactivity
export const createReactivityTest = () => {
  const watchers: Array<() => void> = [];
  const cleanup = () => watchers.forEach((fn) => fn());

  return { watchers, cleanup };
};
