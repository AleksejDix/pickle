# Advanced Patterns & Recipes

This guide showcases advanced patterns and real-world recipes for building sophisticated applications with useTemporal.

## Advanced Patterns

### Temporal Context Pattern

Create a centralized temporal context for your application:

```javascript
// temporal-context.js
import { createTemporal } from "@usetemporal/core";
import { luxonAdapter } from "@usetemporal/adapter-luxon";
import { ref, computed } from "@vue/reactivity";

class TemporalContext {
  constructor(options = {}) {
    this.temporal = createTemporal({
      dateAdapter: options.adapter || luxonAdapter,
      weekStartsOn: options.weekStartsOn || 1,
    });

    // User preferences
    this.locale = ref(options.locale || "en-US");
    this.timezone = ref(options.timezone || "local");
    this.dateFormat = ref(options.dateFormat || "iso");

    // Computed formatters
    this.formatter = computed(() => {
      return new Intl.DateTimeFormat(this.locale.value, {
        timeZone:
          this.timezone.value === "local" ? undefined : this.timezone.value,
      });
    });
  }

  // Format any date according to user preferences
  format(date, style = "medium") {
    const options = {
      short: { dateStyle: "short" },
      medium: { dateStyle: "medium" },
      long: { dateStyle: "long" },
      full: { dateStyle: "full", timeStyle: "short" },
    };

    return new Intl.DateTimeFormat(this.locale.value, options[style]).format(
      date
    );
  }

  // Change user preferences
  setLocale(locale) {
    this.locale.value = locale;
  }

  setTimezone(timezone) {
    this.timezone.value = timezone;
  }
}

// Create singleton instance
export const temporalContext = new TemporalContext();
```

### Time Travel Debugger

Build a time travel debugger for development:

```javascript
// time-travel-debugger.js
import { ref, watch } from "@vue/reactivity";

export function createTimeTravelDebugger(temporal) {
  const history = ref([]);
  const currentIndex = ref(0);
  const maxHistory = 100;

  // Record all date changes
  watch(
    () => temporal.date,
    (newDate) => {
      history.value = [
        ...history.value.slice(0, currentIndex.value + 1),
        {
          date: new Date(newDate),
          timestamp: Date.now(),
          action: "navigation",
        },
      ].slice(-maxHistory);

      currentIndex.value = history.value.length - 1;
    },
    { immediate: true }
  );

  return {
    history,

    // Navigate through history
    goBack() {
      if (currentIndex.value > 0) {
        currentIndex.value--;
        temporal.date = history.value[currentIndex.value].date;
      }
    },

    goForward() {
      if (currentIndex.value < history.value.length - 1) {
        currentIndex.value++;
        temporal.date = history.value[currentIndex.value].date;
      }
    },

    // Jump to specific point
    goTo(index) {
      if (index >= 0 && index < history.value.length) {
        currentIndex.value = index;
        temporal.date = history.value[index].date;
      }
    },

    // Clear history
    clear() {
      history.value = [history.value[currentIndex.value]];
      currentIndex.value = 0;
    },
  };
}
```

### Recurring Events Pattern

Handle recurring events with custom logic:

```javascript
// recurring-events.js
export class RecurringEvent {
  constructor(temporal, config) {
    this.temporal = temporal;
    this.config = config;
  }

  // Get occurrences in a time period
  getOccurrences(start, end) {
    const occurrences = [];
    let current = new Date(start);

    while (current <= end) {
      if (this.matchesPattern(current)) {
        occurrences.push({
          date: new Date(current),
          event: this.config,
        });
      }

      current = this.getNextPossibleDate(current);
    }

    return occurrences;
  }

  matchesPattern(date) {
    const day = this.temporal.periods.day(this.temporal, { date });

    switch (this.config.pattern) {
      case "daily":
        return true;

      case "weekly":
        return this.config.daysOfWeek.includes(day.dayOfWeek);

      case "monthly":
        if (this.config.dayOfMonth) {
          return day.number === this.config.dayOfMonth;
        }
        if (this.config.weekOfMonth && this.config.dayOfWeek) {
          return this.isNthWeekday(day);
        }
        break;

      case "yearly":
        const month = this.temporal.periods.month(this.temporal, { date });
        return (
          month.number === this.config.month &&
          day.number === this.config.dayOfMonth
        );
    }

    return false;
  }

  isNthWeekday(day) {
    const month = this.temporal.periods.month(this.temporal, {
      date: day.start,
    });
    const weeks = this.temporal.divide(month, "week");

    for (let i = 0; i < weeks.length; i++) {
      const weekDays = this.temporal.divide(weeks[i], "day");
      const matchingDay = weekDays.find(
        (d) => d.dayOfWeek === this.config.dayOfWeek && d.month === month.number
      );

      if (matchingDay && matchingDay.number === day.number) {
        return i === this.config.weekOfMonth - 1;
      }
    }

    return false;
  }

  getNextPossibleDate(date) {
    const nextDate = new Date(date);

    switch (this.config.pattern) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "monthly":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "yearly":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
    }

    return nextDate;
  }
}

// Usage
const event = new RecurringEvent(temporal, {
  name: "Team Meeting",
  pattern: "weekly",
  daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
  time: "10:00",
});

const monthOccurrences = event.getOccurrences(month.start, month.end);
```

### Temporal Hooks Pattern

Create reusable hooks for common temporal operations:

```javascript
// temporal-hooks.js
import { ref, computed, watch } from "@vue/reactivity";

// Auto-updating current time
export function useCurrentTime(temporal, updateInterval = 1000) {
  const now = ref(temporal.now);

  const interval = setInterval(() => {
    now.value = new Date();
  }, updateInterval);

  // Cleanup
  const stop = () => clearInterval(interval);

  return { now, stop };
}

// Relative time display
export function useRelativeTime(date, temporal) {
  const { now } = useCurrentTime(temporal, 60000); // Update every minute

  const relative = computed(() => {
    const diff = now.value - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "just now";
  });

  return relative;
}

// Calendar view state
export function useCalendarView(temporal) {
  const viewMode = ref("month"); // month, week, day
  const viewDate = ref(temporal.date);

  const currentPeriod = computed(() => {
    return temporal.periods[viewMode.value](temporal, {
      date: viewDate.value,
    });
  });

  const visibleUnits = computed(() => {
    switch (viewMode.value) {
      case "month":
        const stableMonth = temporal.periods.stableMonth(temporal, {
          date: viewDate.value,
        });
        return temporal.divide(stableMonth, "day");

      case "week":
        return temporal.divide(currentPeriod.value, "day");

      case "day":
        return temporal.divide(currentPeriod.value, "hour");

      default:
        return [];
    }
  });

  const navigate = (direction) => {
    const period = currentPeriod.value;
    const next = direction === "forward" ? period.future() : period.past();
    viewDate.value = next.start;
  };

  return {
    viewMode,
    viewDate,
    currentPeriod,
    visibleUnits,
    navigate,

    // Convenience methods
    goToToday() {
      viewDate.value = new Date();
    },

    setViewMode(mode) {
      viewMode.value = mode;
    },
  };
}
```

## Real-World Recipes

### 1. Business Days Calculator

Calculate business days between dates:

```javascript
// business-days.js
export function createBusinessDaysCalculator(temporal, options = {}) {
  const {
    workDays = [1, 2, 3, 4, 5], // Monday to Friday
    holidays = [],
  } = options;

  const holidaySet = new Set(
    holidays.map((date) => date.toISOString().split("T")[0])
  );

  return {
    isBusinessDay(date) {
      const day = temporal.periods.day(temporal, { date });

      // Check if weekend
      if (!workDays.includes(day.dayOfWeek)) {
        return false;
      }

      // Check if holiday
      const dateStr = day.start.toISOString().split("T")[0];
      if (holidaySet.has(dateStr)) {
        return false;
      }

      return true;
    },

    addBusinessDays(startDate, days) {
      let current = new Date(startDate);
      let remaining = Math.abs(days);
      const direction = days >= 0 ? 1 : -1;

      while (remaining > 0) {
        current.setDate(current.getDate() + direction);

        if (this.isBusinessDay(current)) {
          remaining--;
        }
      }

      return current;
    },

    getBusinessDaysBetween(start, end) {
      let count = 0;
      const current = new Date(start);
      const endTime = end.getTime();

      while (current.getTime() <= endTime) {
        if (this.isBusinessDay(current)) {
          count++;
        }
        current.setDate(current.getDate() + 1);
      }

      return count;
    },
  };
}

// Usage
const calculator = createBusinessDaysCalculator(temporal, {
  holidays: [
    new Date(2024, 0, 1), // New Year's Day
    new Date(2024, 11, 25), // Christmas
  ],
});

const deadline = calculator.addBusinessDays(new Date(), 10);
console.log("Deadline:", deadline);
```

### 2. Meeting Scheduler

Find available meeting slots:

```javascript
// meeting-scheduler.js
export class MeetingScheduler {
  constructor(temporal, config = {}) {
    this.temporal = temporal;
    this.workHours = config.workHours || { start: 9, end: 17 };
    this.meetingDuration = config.meetingDuration || 60; // minutes
    this.bufferTime = config.bufferTime || 15; // minutes between meetings
  }

  findAvailableSlots(date, existingMeetings = []) {
    const day = this.temporal.periods.day(this.temporal, { date });
    const availableSlots = [];

    // Get work hours for the day
    const workStart = new Date(day.start);
    workStart.setHours(this.workHours.start, 0, 0, 0);

    const workEnd = new Date(day.start);
    workEnd.setHours(this.workHours.end, 0, 0, 0);

    // Sort existing meetings
    const meetings = [...existingMeetings].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );

    let currentTime = workStart;

    for (const meeting of meetings) {
      // Check if there's a gap before this meeting
      const gapMinutes = (meeting.start - currentTime) / 60000;

      if (gapMinutes >= this.meetingDuration) {
        availableSlots.push({
          start: new Date(currentTime),
          end: new Date(meeting.start.getTime() - this.bufferTime * 60000),
        });
      }

      // Move current time to after this meeting
      currentTime = new Date(meeting.end.getTime() + this.bufferTime * 60000);
    }

    // Check if there's time after the last meeting
    const remainingMinutes = (workEnd - currentTime) / 60000;
    if (remainingMinutes >= this.meetingDuration) {
      availableSlots.push({
        start: new Date(currentTime),
        end: workEnd,
      });
    }

    return availableSlots;
  }

  suggestMeetingTimes(participants, dateRange) {
    const suggestions = [];
    const startDate = dateRange.start;
    const endDate = dateRange.end;

    const current = new Date(startDate);

    while (current <= endDate) {
      const day = this.temporal.periods.day(this.temporal, {
        date: current,
      });

      // Skip weekends
      if (day.isWeekday) {
        const allAvailable = participants.every((participant) => {
          const slots = this.findAvailableSlots(current, participant.meetings);
          return slots.length > 0;
        });

        if (allAvailable) {
          suggestions.push({
            date: new Date(current),
            day: day,
          });
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return suggestions;
  }
}
```

### 3. Date Range Picker

Advanced date range selection:

```javascript
// date-range-picker.js
import { ref, computed } from "@vue/reactivity";

export function createDateRangePicker(temporal, options = {}) {
  const {
    minDate = null,
    maxDate = null,
    presets = getDefaultPresets(),
    maxRange = null, // Maximum days in range
  } = options;

  const startDate = ref(null);
  const endDate = ref(null);
  const hoveredDate = ref(null);

  const range = computed(() => {
    if (!startDate.value || !endDate.value) return null;

    return {
      start: startDate.value,
      end: endDate.value,
      days:
        Math.ceil((endDate.value - startDate.value) / (1000 * 60 * 60 * 24)) +
        1,
    };
  });

  const previewRange = computed(() => {
    if (!startDate.value || !hoveredDate.value) return null;

    const start =
      startDate.value < hoveredDate.value ? startDate.value : hoveredDate.value;
    const end =
      startDate.value < hoveredDate.value ? hoveredDate.value : startDate.value;

    return { start, end };
  });

  function selectDate(date) {
    if (!isDateSelectable(date)) return;

    if (!startDate.value) {
      startDate.value = date;
    } else if (!endDate.value) {
      if (date < startDate.value) {
        endDate.value = startDate.value;
        startDate.value = date;
      } else {
        endDate.value = date;
      }
    } else {
      // Reset selection
      startDate.value = date;
      endDate.value = null;
    }
  }

  function isDateSelectable(date) {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;

    if (maxRange && startDate.value && !endDate.value) {
      const daysDiff = Math.abs(
        Math.ceil((date - startDate.value) / (1000 * 60 * 60 * 24))
      );
      if (daysDiff > maxRange) return false;
    }

    return true;
  }

  function isDateInRange(date) {
    const checkRange = previewRange.value || range.value;
    if (!checkRange) return false;

    return date >= checkRange.start && date <= checkRange.end;
  }

  function applyPreset(preset) {
    const { start, end } = preset.getRange(temporal);
    startDate.value = start;
    endDate.value = end;
  }

  function clear() {
    startDate.value = null;
    endDate.value = null;
    hoveredDate.value = null;
  }

  return {
    startDate,
    endDate,
    hoveredDate,
    range,
    previewRange,
    presets,

    selectDate,
    isDateSelectable,
    isDateInRange,
    applyPreset,
    clear,
  };
}

function getDefaultPresets() {
  return [
    {
      label: "Today",
      getRange: (temporal) => {
        const today = temporal.periods.day(temporal);
        return { start: today.start, end: today.end };
      },
    },
    {
      label: "This Week",
      getRange: (temporal) => {
        const week = temporal.periods.week(temporal);
        return { start: week.start, end: week.end };
      },
    },
    {
      label: "This Month",
      getRange: (temporal) => {
        const month = temporal.periods.month(temporal);
        return { start: month.start, end: month.end };
      },
    },
    {
      label: "Last 7 Days",
      getRange: (temporal) => {
        const today = temporal.periods.day(temporal);
        const weekAgo = today.past(6);
        return { start: weekAgo.start, end: today.end };
      },
    },
    {
      label: "Last 30 Days",
      getRange: (temporal) => {
        const today = temporal.periods.day(temporal);
        const monthAgo = today.past(29);
        return { start: monthAgo.start, end: today.end };
      },
    },
  ];
}
```

### 4. Calendar Heatmap

Create GitHub-style contribution heatmaps:

```javascript
// calendar-heatmap.js
export function createCalendarHeatmap(temporal, data = {}) {
  const getIntensity = (value, max) => {
    if (!value) return 0;
    const ratio = value / max;
    if (ratio > 0.75) return 4;
    if (ratio > 0.5) return 3;
    if (ratio > 0.25) return 2;
    if (ratio > 0) return 1;
    return 0;
  };

  return {
    generateYearView(year) {
      const yearPeriod = temporal.periods.year(temporal, {
        date: new Date(year, 0, 1),
      });

      const days = temporal.divide(yearPeriod, "day");
      const maxValue = Math.max(...Object.values(data));

      // Group by week
      const weeks = [];
      let currentWeek = [];

      days.forEach((day) => {
        const dateKey = day.start.toISOString().split("T")[0];
        const value = data[dateKey] || 0;

        currentWeek.push({
          date: day.start,
          value,
          intensity: getIntensity(value, maxValue),
          day: day,
        });

        if (day.dayOfWeek === 6 || day === days[days.length - 1]) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });

      return { weeks, maxValue };
    },

    generateMonthView(year, month) {
      const monthPeriod = temporal.periods.month(temporal, {
        date: new Date(year, month - 1, 1),
      });

      const stableMonth = temporal.periods.stableMonth(temporal, {
        date: monthPeriod.start,
      });

      const days = temporal.divide(stableMonth, "day");
      const maxValue = Math.max(...Object.values(data));

      const weeks = [];
      for (let i = 0; i < days.length; i += 7) {
        const week = days.slice(i, i + 7).map((day) => {
          const dateKey = day.start.toISOString().split("T")[0];
          const value = data[dateKey] || 0;

          return {
            date: day.start,
            value,
            intensity: getIntensity(value, maxValue),
            day,
            isCurrentMonth: day.month === monthPeriod.number,
          };
        });

        weeks.push(week);
      }

      return { weeks, maxValue, month: monthPeriod };
    },
  };
}

// Usage
const contributions = {
  "2024-03-01": 5,
  "2024-03-02": 3,
  "2024-03-03": 8,
  // ... more data
};

const heatmap = createCalendarHeatmap(temporal, contributions);
const yearView = heatmap.generateYearView(2024);
```

### 5. Time Zone Converter

Build a multi-timezone display:

```javascript
// timezone-converter.js
export class TimeZoneConverter {
  constructor(temporal) {
    this.temporal = temporal;
    this.zones = new Map();
  }

  addZone(id, timezone, label) {
    this.zones.set(id, {
      timezone,
      label,
      formatter: new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    });
  }

  removeZone(id) {
    this.zones.delete(id);
  }

  getTimeInZones(date = new Date()) {
    const result = [];

    for (const [id, config] of this.zones) {
      const { timezone, label, formatter } = config;

      // Get offset
      const offset = this.getTimezoneOffset(date, timezone);

      result.push({
        id,
        label,
        timezone,
        formatted: formatter.format(date),
        offset,
        offsetDisplay: this.formatOffset(offset),
      });
    }

    return result.sort((a, b) => b.offset - a.offset);
  }

  getTimezoneOffset(date, timezone) {
    // Create formatters for the timezone and UTC
    const tzFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const utcFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const tzTime = new Date(tzFormatter.format(date));
    const utcTime = new Date(utcFormatter.format(date));

    return (tzTime - utcTime) / (1000 * 60); // Offset in minutes
  }

  formatOffset(minutes) {
    const hours = Math.floor(Math.abs(minutes) / 60);
    const mins = Math.abs(minutes) % 60;
    const sign = minutes >= 0 ? "+" : "-";

    return `UTC${sign}${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  }

  findOptimalMeetingTime(startHour = 9, endHour = 17) {
    const scores = new Map();

    // Score each hour of the day
    for (let hour = 0; hour < 24; hour++) {
      let score = 0;

      for (const [id, config] of this.zones) {
        const testDate = new Date();
        testDate.setUTCHours(hour, 0, 0, 0);

        const localHour = new Date(
          config.formatter.format(testDate)
        ).getHours();

        // Score based on work hours
        if (localHour >= startHour && localHour < endHour) {
          score += 2; // In work hours
        } else if (localHour >= startHour - 1 && localHour < endHour + 1) {
          score += 1; // Close to work hours
        }
      }

      scores.set(hour, score);
    }

    // Find best time
    let bestHour = 0;
    let bestScore = 0;

    for (const [hour, score] of scores) {
      if (score > bestScore) {
        bestScore = score;
        bestHour = hour;
      }
    }

    const optimalTime = new Date();
    optimalTime.setUTCHours(bestHour, 0, 0, 0);

    return {
      time: optimalTime,
      score: bestScore,
      breakdown: this.getTimeInZones(optimalTime),
    };
  }
}

// Usage
const converter = new TimeZoneConverter(temporal);

converter.addZone("ny", "America/New_York", "New York");
converter.addZone("london", "Europe/London", "London");
converter.addZone("tokyo", "Asia/Tokyo", "Tokyo");

const times = converter.getTimeInZones();
const optimal = converter.findOptimalMeetingTime();
```

## Integration Patterns

### Vue 3 Composable

```javascript
// useTemporal.js
import { inject, provide, computed } from "vue";
import { createTemporal } from "@usetemporal/core";

const TemporalSymbol = Symbol("temporal");

export function provideTemporal(options) {
  const temporal = createTemporal(options);
  provide(TemporalSymbol, temporal);
  return temporal;
}

export function useTemporal() {
  const temporal = inject(TemporalSymbol);
  if (!temporal) {
    throw new Error("Temporal not provided");
  }

  return {
    temporal,

    // Convenience methods
    currentMonth: computed(() => temporal.periods.month(temporal)),

    currentWeek: computed(() => temporal.periods.week(temporal)),

    today: computed(() => temporal.periods.day(temporal)),
  };
}
```

### React Context

```javascript
// TemporalContext.jsx
import React, { createContext, useContext, useMemo } from "react";
import { createTemporal } from "@usetemporal/core";

const TemporalContext = createContext(null);

export function TemporalProvider({ children, ...options }) {
  const temporal = useMemo(
    () => createTemporal(options),
    [JSON.stringify(options)]
  );

  return (
    <TemporalContext.Provider value={temporal}>
      {children}
    </TemporalContext.Provider>
  );
}

export function useTemporal() {
  const temporal = useContext(TemporalContext);
  if (!temporal) {
    throw new Error("useTemporal must be used within TemporalProvider");
  }

  return temporal;
}

// Custom hooks
export function useCurrentPeriod(unit = "month") {
  const temporal = useTemporal();
  const [period, setPeriod] = useState(() => temporal.periods[unit](temporal));

  useEffect(() => {
    const interval = setInterval(() => {
      setPeriod(temporal.periods[unit](temporal));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [temporal, unit]);

  return period;
}
```

## Conclusion

These advanced patterns and recipes demonstrate the flexibility and power of useTemporal. Key takeaways:

1. **Context Pattern**: Centralize temporal configuration and preferences
2. **Composable Hooks**: Create reusable temporal logic
3. **Business Logic**: Easily implement complex date calculations
4. **UI Components**: Build sophisticated calendar interfaces
5. **Framework Integration**: Seamless integration with modern frameworks

The divide pattern and reactive properties make complex temporal operations simple and maintainable. Experiment with these patterns and create your own!
