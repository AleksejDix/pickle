# Testing Guide

Learn how to effectively test applications that use useTemporal. This guide covers unit testing, integration testing, and strategies for handling time-dependent code.

## Setting Up Your Test Environment

### Installation

First, ensure you have a test runner installed:

```bash
# Using Vitest (recommended)
npm install -D vitest @vitest/ui

# Using Jest
npm install -D jest @types/jest

# Testing utilities
npm install -D @testing-library/vue @testing-library/react
```

### Basic Test Setup

```javascript
// test-setup.js
import { createTemporal } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";

// Create a test temporal instance
export function createTestTemporal(options = {}) {
  return createTemporal({
    dateAdapter: nativeAdapter,
    ...options,
  });
}

// Mock current date
export function mockDate(date) {
  const RealDate = Date;
  global.Date = class extends RealDate {
    constructor(...args) {
      if (args.length === 0) {
        return new RealDate(date);
      }
      return new RealDate(...args);
    }

    static now() {
      return new RealDate(date).getTime();
    }
  };
}

// Restore real date
export function restoreDate() {
  global.Date = Date;
}
```

## Unit Testing Time Units

### Testing Basic Properties

```javascript
import { describe, it, expect } from "vitest";
import { createTestTemporal } from "./test-setup";

describe("Month Unit", () => {
  it("should have correct properties", () => {
    const temporal = createTestTemporal({
      date: new Date(2024, 2, 14), // March 14, 2024
    });

    const month = temporal.periods.month(temporal);

    expect(month.number).toBe(3);
    expect(month.name).toBe("March");
    expect(month.year).toBe(2024);
    expect(month.days).toBe(31);
  });

  it("should handle February in leap year", () => {
    const temporal = createTestTemporal({
      date: new Date(2024, 1, 15), // February 15, 2024
    });

    const february = temporal.periods.month(temporal);

    expect(february.days).toBe(29); // Leap year
    expect(february.isNow).toBe(true);
  });
});
```

### Testing Navigation

```javascript
describe("Time Unit Navigation", () => {
  it("should navigate to future months", () => {
    const temporal = createTestTemporal({
      date: new Date(2024, 0, 15), // January 15, 2024
    });

    const january = temporal.periods.month(temporal);
    const march = january.future(2);

    expect(march.number).toBe(3);
    expect(march.name).toBe("March");
  });

  it("should handle year boundaries", () => {
    const temporal = createTestTemporal({
      date: new Date(2023, 11, 15), // December 15, 2023
    });

    const december = temporal.periods.month(temporal);
    const january = december.future();

    expect(january.number).toBe(1);
    expect(january.year).toBe(2024);
  });

  it("should navigate to past weeks", () => {
    const temporal = createTestTemporal({
      date: new Date(2024, 2, 14),
    });

    const currentWeek = temporal.periods.week(temporal);
    const twoWeeksAgo = currentWeek.past(2);

    expect(twoWeeksAgo.start).toEqual(expect.any(Date));
    expect(twoWeeksAgo.end.getTime()).toBeLessThan(currentWeek.start.getTime());
  });
});
```

## Testing the Divide Pattern

### Testing Divide Operations

```javascript
describe("Divide Pattern", () => {
  it("should divide month into correct number of days", () => {
    const temporal = createTestTemporal({
      date: new Date(2024, 2, 1), // March 1, 2024
    });

    const march = temporal.periods.month(temporal);
    const days = temporal.divide(march, "day");

    expect(days).toHaveLength(31);
    expect(days[0].number).toBe(1);
    expect(days[30].number).toBe(31);
  });

  it("should divide year into months", () => {
    const temporal = createTestTemporal({
      date: new Date(2024, 0, 1),
    });

    const year = temporal.periods.year(temporal);
    const months = temporal.divide(year, "month");

    expect(months).toHaveLength(12);
    expect(months[0].name).toBe("January");
    expect(months[11].name).toBe("December");
  });

  it("should handle stable month correctly", () => {
    const temporal = createTestTemporal();

    const stableMonth = temporal.periods.stableMonth(temporal);
    const days = temporal.divide(stableMonth, "day");

    expect(days).toHaveLength(42); // Always 6 weeks

    const weeks = temporal.divide(stableMonth, "week");
    expect(weeks).toHaveLength(6);
  });
});
```

### Testing Edge Cases

```javascript
describe("Divide Pattern Edge Cases", () => {
  it("should handle DST transitions", () => {
    // March 10, 2024 - Spring forward in US
    const temporal = createTestTemporal({
      date: new Date(2024, 2, 10),
    });

    const day = temporal.periods.day(temporal);
    const hours = temporal.divide(day, "hour");

    // Should have 23 hours on spring forward
    // Note: This depends on system timezone
    expect(hours.length).toBeGreaterThanOrEqual(23);
    expect(hours.length).toBeLessThanOrEqual(24);
  });

  it("should handle month boundaries in weeks", () => {
    const temporal = createTestTemporal({
      date: new Date(2024, 2, 1), // March 1
    });

    const march = temporal.periods.month(temporal);
    const weeks = temporal.divide(march, "week");

    // First week might include days from February
    const firstWeek = weeks[0];
    const firstWeekDays = temporal.divide(firstWeek, "day");

    // Check that we get complete weeks
    expect(firstWeekDays).toHaveLength(7);
  });
});
```

## Testing Reactive Properties

### Testing Reactivity

```javascript
import { watch, nextTick } from "@vue/reactivity";

describe("Reactive Properties", () => {
  it("should update isNow property", async () => {
    const temporal = createTestTemporal({
      date: new Date(2024, 2, 14, 12, 0, 0),
    });

    const hour = temporal.periods.hour(temporal);
    expect(hour.isNow).toBe(true);

    // Change the current time
    temporal.now = new Date(2024, 2, 14, 13, 0, 0);

    await nextTick();
    expect(hour.isNow).toBe(false);
    expect(hour.isPast).toBe(true);
  });

  it("should trigger watchers on change", async () => {
    const temporal = createTestTemporal();
    const month = temporal.periods.month(temporal);

    let watchCount = 0;
    watch(
      () => month.number,
      () => {
        watchCount++;
      }
    );

    // Navigate to next month
    temporal.date = month.future().start;

    await nextTick();
    expect(watchCount).toBe(1);
  });
});
```

## Testing with Frameworks

### Vue Component Testing

```javascript
import { mount } from "@vue/test-utils";
import { describe, it, expect, beforeEach } from "vitest";
import CalendarComponent from "./Calendar.vue";
import { createTestTemporal } from "./test-setup";

describe("Calendar Component", () => {
  let temporal;

  beforeEach(() => {
    temporal = createTestTemporal({
      date: new Date(2024, 2, 14),
      weekStartsOn: 1, // Monday
    });
  });

  it("renders current month", () => {
    const wrapper = mount(CalendarComponent, {
      global: {
        provide: {
          temporal,
        },
      },
    });

    expect(wrapper.find(".month-name").text()).toBe("March 2024");
  });

  it("highlights current day", () => {
    const wrapper = mount(CalendarComponent, {
      global: {
        provide: {
          temporal,
        },
      },
    });

    const today = wrapper.find('[data-date="2024-03-14"]');
    expect(today.classes()).toContain("is-today");
  });

  it("navigates to next month", async () => {
    const wrapper = mount(CalendarComponent, {
      global: {
        provide: {
          temporal,
        },
      },
    });

    await wrapper.find(".next-month").trigger("click");
    expect(wrapper.find(".month-name").text()).toBe("April 2024");
  });
});
```

### React Component Testing

```javascript
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Calendar } from "./Calendar";
import { TemporalProvider } from "./TemporalProvider";
import { createTestTemporal } from "./test-setup";

describe("Calendar Component", () => {
  const renderWithTemporal = (component, temporal) => {
    return render(
      <TemporalProvider temporal={temporal}>{component}</TemporalProvider>
    );
  };

  it("displays current month", () => {
    const temporal = createTestTemporal({
      date: new Date(2024, 2, 14),
    });

    renderWithTemporal(<Calendar />, temporal);

    expect(screen.getByText("March 2024")).toBeInTheDocument();
  });

  it("handles month navigation", () => {
    const temporal = createTestTemporal({
      date: new Date(2024, 2, 14),
    });

    renderWithTemporal(<Calendar />, temporal);

    fireEvent.click(screen.getByLabelText("Next month"));
    expect(screen.getByText("April 2024")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Previous month"));
    fireEvent.click(screen.getByLabelText("Previous month"));
    expect(screen.getByText("February 2024")).toBeInTheDocument();
  });
});
```

## Testing Strategies

### 1. Time Travel Testing

Create utilities to test different dates easily:

```javascript
// time-travel.test.js
export function* timeTravel(start, end, unit = "day") {
  const temporal = createTestTemporal({ date: start });
  const current = temporal.periods[unit](temporal);

  while (current.start <= end) {
    yield current;
    current = current.future();
  }
}

// Usage in tests
it("should handle all days in a year", () => {
  const start = new Date(2024, 0, 1);
  const end = new Date(2024, 11, 31);

  for (const day of timeTravel(start, end, "day")) {
    expect(day.number).toBeGreaterThanOrEqual(1);
    expect(day.number).toBeLessThanOrEqual(31);
  }
});
```

### 2. Snapshot Testing

Use snapshots for complex date structures:

```javascript
import { expect, it } from "vitest";

it("should generate consistent calendar structure", () => {
  const temporal = createTestTemporal({
    date: new Date(2024, 2, 1),
    weekStartsOn: 1,
  });

  const month = temporal.periods.stableMonth(temporal);
  const weeks = temporal.divide(month, "week");

  const calendarStructure = weeks.map((week) => {
    const days = temporal.divide(week, "day");
    return days.map((day) => ({
      date: day.number,
      month: day.month,
      isWeekend: day.isWeekend,
    }));
  });

  expect(calendarStructure).toMatchSnapshot();
});
```

### 3. Property-Based Testing

Test properties that should always be true:

```javascript
import fc from "fast-check";

describe("Property-based tests", () => {
  it("should always have valid day numbers", () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 11, 31) }),
        (date) => {
          const temporal = createTestTemporal({ date });
          const day = temporal.periods.day(temporal);

          return day.number >= 1 && day.number <= 31;
        }
      )
    );
  });

  it("should have consistent week lengths", () => {
    fc.assert(
      fc.property(fc.date(), (date) => {
        const temporal = createTestTemporal({ date });
        const week = temporal.periods.week(temporal);
        const days = temporal.divide(week, "day");

        return days.length === 7;
      })
    );
  });
});
```

### 4. Mock Time Progression

Test time-dependent features:

```javascript
import { vi } from "vitest";

describe("Time progression", () => {
  it("should update isNow as time passes", async () => {
    vi.useFakeTimers();
    const startTime = new Date(2024, 2, 14, 12, 0, 0);
    vi.setSystemTime(startTime);

    const temporal = createTestTemporal();
    const hour = temporal.periods.hour(temporal);

    expect(hour.isNow).toBe(true);

    // Advance time by 1 hour
    vi.advanceTimersByTime(60 * 60 * 1000);

    // Update temporal's now
    temporal.now = new Date();

    expect(hour.isNow).toBe(false);
    expect(hour.isPast).toBe(true);

    vi.useRealTimers();
  });
});
```

## Testing Best Practices

### 1. Isolate Time Dependencies

```javascript
// Good: Inject date/temporal
function getMonthSummary(temporal) {
  const month = temporal.periods.month(temporal);
  return {
    name: month.name,
    days: month.days,
    isCurrentMonth: month.isNow,
  };
}

// Bad: Hidden dependency on current date
function getMonthSummary() {
  const now = new Date(); // Hard to test!
  // ...
}
```

### 2. Test Boundary Conditions

```javascript
describe("Boundary conditions", () => {
  const testCases = [
    { name: "leap year February", date: new Date(2024, 1, 29) },
    { name: "non-leap February", date: new Date(2023, 1, 28) },
    { name: "year boundary", date: new Date(2023, 11, 31) },
    { name: "DST spring forward", date: new Date(2024, 2, 10) },
    { name: "DST fall back", date: new Date(2024, 10, 3) },
  ];

  testCases.forEach(({ name, date }) => {
    it(`should handle ${name}`, () => {
      const temporal = createTestTemporal({ date });
      const day = temporal.periods.day(temporal);

      expect(day.start).toBeInstanceOf(Date);
      expect(day.end).toBeInstanceOf(Date);
      expect(day.end.getTime()).toBeGreaterThan(day.start.getTime());
    });
  });
});
```

### 3. Test Configuration Options

```javascript
describe("Configuration", () => {
  it("should respect weekStartsOn setting", () => {
    const sundayStart = createTestTemporal({
      date: new Date(2024, 2, 14),
      weekStartsOn: 0,
    });

    const mondayStart = createTestTemporal({
      date: new Date(2024, 2, 14),
      weekStartsOn: 1,
    });

    const sundayWeek = sundayStart.periods.week(sundayStart);
    const mondayWeek = mondayStart.periods.week(mondayStart);

    expect(sundayWeek.start.getDay()).toBe(0); // Sunday
    expect(mondayWeek.start.getDay()).toBe(1); // Monday
  });
});
```

## Performance Testing

```javascript
import { describe, it, expect } from "vitest";

describe("Performance", () => {
  it("should handle large divide operations efficiently", () => {
    const temporal = createTestTemporal();
    const year = temporal.periods.year(temporal);

    const start = performance.now();
    const days = temporal.divide(year, "day");
    const duration = performance.now() - start;

    expect(days).toHaveLength(365); // or 366
    expect(duration).toBeLessThan(50); // Should be fast
  });

  it("should cache repeated operations", () => {
    const temporal = createTestTemporal();
    const month = temporal.periods.month(temporal);

    const start1 = performance.now();
    const days1 = temporal.divide(month, "day");
    const duration1 = performance.now() - start1;

    const start2 = performance.now();
    const days2 = temporal.divide(month, "day");
    const duration2 = performance.now() - start2;

    // Second call might be cached (implementation dependent)
    expect(duration2).toBeLessThanOrEqual(duration1);
  });
});
```

## Conclusion

Testing useTemporal applications requires attention to:

1. **Time dependencies** - Always inject temporal instances
2. **Boundary conditions** - Test edge cases like leap years, DST
3. **Reactivity** - Verify reactive updates work correctly
4. **Configuration** - Test different settings (weekStartsOn, locale)
5. **Performance** - Ensure operations remain fast

By following these patterns and practices, you can build robust, well-tested applications with useTemporal.
