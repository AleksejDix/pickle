/**
 * Example: Building a Calendar View with the Functional API
 */
import {
  createTemporal,
  useYear,
  useMonth,
  divide,
  contains,
  next,
  previous,
  split,
  type Period,
} from "@usetemporal/core";
import { createNativeAdapter } from "@usetemporal/adapter-native";

// Initialize temporal
const temporal = createTemporal({
  dateAdapter: createNativeAdapter(),
  date: new Date(2024, 0, 1),
  weekStartsOn: 1, // Monday
});

// Get reactive periods
const currentYear = useYear(temporal);
const currentMonth = useMonth(temporal);

// Build a year view
function buildYearView() {
  const months = divide(temporal, currentYear.value, "month");

  return months.map((month) => ({
    name: month.value.toLocaleDateString("en", { month: "long" }),
    number: month.number,
    days: divide(temporal, month, "day").length,
  }));
}

// Build a month calendar grid
function buildMonthGrid() {
  const month = currentMonth.value;
  const weeks = divide(temporal, month, "week");

  const grid = weeks.map((week) => {
    const days = divide(temporal, week, "day");

    return days.map((day) => ({
      date: day.value.getDate(),
      isCurrentMonth: contains(month, day),
      isToday: isToday(day),
      period: day,
    }));
  });

  return grid;
}

// Helper function
function isToday(period: Period): boolean {
  const today = new Date();
  return period.value.toDateString() === today.toDateString();
}

// Navigation
function navigateMonth(direction: "next" | "previous") {
  const newMonth =
    direction === "next"
      ? next(temporal, currentMonth.value)
      : previous(temporal, currentMonth.value);

  // Update browsing to navigate
  temporal.browsing.value = newMonth.value;
}

// Advanced: Split month into custom periods
function getMonthPhases() {
  // Split month into 4 weekly phases
  return split(temporal, currentMonth.value, { count: 4 });
}

// Advanced: Business quarters
function getBusinessQuarters() {
  const year = currentYear.value;
  const months = divide(temporal, year, "month");

  const quarters: Period[] = [];
  for (let i = 0; i < 12; i += 3) {
    const quarterMonths = months.slice(i, i + 3);
    quarters.push({
      start: quarterMonths[0].start,
      end: quarterMonths[2].end,
      type: "quarter",
      value: quarterMonths[1].value,
      number: Math.floor(i / 3) + 1,
    });
  }

  return quarters;
}

// Example usage
console.log("Year:", currentYear.value.number);
console.log("Month:", currentMonth.value.number);

console.log("\nYear Overview:");
console.table(buildYearView());

console.log("\nMonth Grid:");
const grid = buildMonthGrid();
grid.forEach((week, i) => {
  const weekDates = week
    .map((day) => (day.isCurrentMonth ? day.date.toString().padStart(2) : "  "))
    .join(" ");
  console.log(`Week ${i + 1}: ${weekDates}`);
});

console.log("\nMonth Phases:");
const phases = getMonthPhases();
phases.forEach((phase) => {
  console.log(
    `Phase ${phase.number}: ${phase.start.toLocaleDateString()} - ${phase.end.toLocaleDateString()}`
  );
});

// Navigate to next month
navigateMonth("next");
console.log("\nAfter navigation - Month:", currentMonth.value.number);
