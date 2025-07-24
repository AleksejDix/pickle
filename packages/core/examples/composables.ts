/**
 * Example: Creating Custom Composables
 */
import { computed, watchEffect } from "@vue/reactivity";
import {
  createTemporal,
  useMonth,
  useWeek,
  divide,
  contains,
  next,
  previous,
  type Temporal,
  type Period,
} from "@usetemporal/core";
import { createNativeAdapter } from "@usetemporal/adapter-native";

/**
 * Custom composable for calendar grid with navigation
 */
export function useCalendarGrid(temporal: Temporal) {
  const month = useMonth(temporal);

  // Computed grid that updates when month changes
  const grid = computed(() => {
    const weeks = divide(temporal, month.value, "week");

    return weeks.map((week) =>
      divide(temporal, week, "day").map((day) => ({
        date: day.value,
        day: day.number,
        isCurrentMonth: contains(month.value, day),
        isToday: isToday(day.value),
        isWeekend: isWeekend(day.value),
        period: day,
      }))
    );
  });

  // Navigation functions
  const goToNext = () => {
    temporal.browsing.value = next(temporal, month.value).value;
  };

  const goToPrevious = () => {
    temporal.browsing.value = previous(temporal, month.value).value;
  };

  const goToToday = () => {
    temporal.browsing.value = new Date();
  };

  const goToDate = (date: Date) => {
    temporal.browsing.value = date;
  };

  return {
    month,
    grid,
    goToNext,
    goToPrevious,
    goToToday,
    goToDate,
  };
}

/**
 * Custom composable for week view
 */
export function useWeekView(temporal: Temporal) {
  const week = useWeek(temporal);

  const days = computed(() =>
    divide(temporal, week.value, "day").map((day) => ({
      date: day.value,
      dayName: day.value.toLocaleDateString("en", { weekday: "short" }),
      dayNumber: day.number,
      isToday: isToday(day.value),
      period: day,
    }))
  );

  const weekNumber = computed(() => week.value.number);

  const nextWeek = () => {
    temporal.browsing.value = next(temporal, week.value).value;
  };

  const previousWeek = () => {
    temporal.browsing.value = previous(temporal, week.value).value;
  };

  return {
    week,
    days,
    weekNumber,
    nextWeek,
    previousWeek,
  };
}

/**
 * Custom composable for date range selection
 */
export function useDateRange(temporal: Temporal) {
  const start = computed({
    get: () => temporal.browsing.value,
    set: (date: Date) => {
      temporal.browsing.value = date;
    },
  });

  const end = computed({
    get: () => {
      // Default to 7 days from start
      return temporal.adapter.add(start.value, { days: 7 });
    },
    set: () => {
      // Could implement custom end date logic
    },
  });

  const duration = computed(() => {
    const ms = end.value.getTime() - start.value.getTime();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return { days };
  });

  const contains = (date: Date): boolean => {
    const time = date.getTime();
    return time >= start.value.getTime() && time <= end.value.getTime();
  };

  return {
    start,
    end,
    duration,
    contains,
  };
}

// Helper functions
function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// Example usage
const temporal = createTemporal({
  dateAdapter: createNativeAdapter(),
  date: new Date(2024, 0, 15),
});

// Use calendar grid composable
const calendar = useCalendarGrid(temporal);

console.log("Current month:", calendar.month.value.number);
console.log("Grid:", calendar.grid.value);

// Navigate
calendar.goToNext();
console.log("After next:", calendar.month.value.number);

// Use week view composable
const weekView = useWeekView(temporal);
console.log("Week number:", weekView.weekNumber.value);
console.log(
  "Days:",
  weekView.days.value.map((d) => d.dayName)
);

// Watch for changes
watchEffect(() => {
  console.log("Month changed to:", calendar.month.value.number);
});
