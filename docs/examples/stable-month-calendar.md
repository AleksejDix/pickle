# StableMonth Calendar Example

The `stableMonth` period provides a consistent 6-week (42 days) calendar grid, perfect for creating calendar UIs that don't jump or shift between months.

## Key Features

- Always displays exactly 6 weeks (42 days)
- Starts at the beginning of the week containing the 1st of the month
- Respects the `weekStartsOn` configuration
- Includes a `contains()` method to identify which days belong to the actual calendar month

## Basic Usage

```javascript
import { createTemporal, periods } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";

// Create temporal with Monday as start of week
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1, // Monday
});

// Create a stableMonth for the current browsing date
const stableMonth = periods.stableMonth({
  now: temporal.now,
  browsing: temporal.browsing,
  adapter: temporal.adapter,
  weekStartsOn: temporal.weekStartsOn,
});

// Divide into weeks (always returns 6 weeks)
const weeks = temporal.divide(stableMonth, "week");

// Divide into days (always returns 42 days)
const days = temporal.divide(stableMonth, "day");

// Check if a day belongs to the actual calendar month
const isCurrentMonth = stableMonth.contains(someDay.raw.value);
```

## Vue Calendar Component Example

```vue
<template>
  <div class="calendar">
    <h2>{{ monthName }} {{ year }}</h2>

    <!-- Weekday headers -->
    <div class="weekdays">
      <div v-for="day in weekdays" :key="day" class="weekday">
        {{ day }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="weeks">
      <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="week">
        <div
          v-for="(dayInfo, dayIndex) in week"
          :key="dayIndex"
          class="day"
          :class="{
            'other-month': !dayInfo.isCurrentMonth,
            today: dayInfo.day.isNow.value,
            weekend: dayInfo.isWeekend,
          }"
        >
          {{ dayInfo.day.number.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { createTemporal, periods } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";

const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1, // Monday
});

const stableMonth = periods.stableMonth({
  now: temporal.now,
  browsing: temporal.browsing,
  adapter: temporal.adapter,
  weekStartsOn: temporal.weekStartsOn,
});

const monthName = computed(() => {
  return stableMonth.raw.value.toLocaleDateString("en-US", { month: "long" });
});

const year = computed(() => {
  return stableMonth.raw.value.getFullYear();
});

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const weeks = computed(() => {
  const weeksArray = temporal.divide(stableMonth, "week");

  return weeksArray.map((week) => {
    const days = temporal.divide(week, "day");

    return days.map((day) => ({
      day,
      isCurrentMonth: stableMonth.contains(day.raw.value),
      isWeekend: [0, 6].includes(day.raw.value.getDay()),
    }));
  });
});
</script>

<style scoped>
.calendar {
  max-width: 400px;
  margin: 0 auto;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 10px;
}

.weekday {
  text-align: center;
  font-weight: bold;
  font-size: 14px;
}

.weeks {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  cursor: pointer;
}

.day.other-month {
  color: #ccc;
  background: #fafafa;
}

.day.today {
  background: #007bff;
  color: white;
  font-weight: bold;
}

.day.weekend {
  background: #f5f5f5;
}
</style>
```

## React Calendar Component Example

```jsx
import React from "react";
import { createTemporal, periods } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";

function Calendar() {
  const temporal = createTemporal({
    dateAdapter: nativeAdapter,
    weekStartsOn: 1, // Monday
  });

  const stableMonth = periods.stableMonth({
    now: temporal.now,
    browsing: temporal.browsing,
    adapter: temporal.adapter,
    weekStartsOn: temporal.weekStartsOn,
  });

  const monthName = stableMonth.raw.value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const weeks = temporal.divide(stableMonth, "week").map((week) => {
    const days = temporal.divide(week, "day");

    return days.map((day) => ({
      day,
      isCurrentMonth: stableMonth.contains(day.raw.value),
      isWeekend: [0, 6].includes(day.raw.value.getDay()),
      isToday: day.isNow.value,
    }));
  });

  return (
    <div className="calendar">
      <h2>{monthName}</h2>

      <div className="weekdays">
        {weekdays.map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="weeks">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="week">
            {week.map((dayInfo, dayIndex) => (
              <div
                key={dayIndex}
                className={`day ${
                  dayInfo.isCurrentMonth ? "" : "other-month"
                } ${dayInfo.isToday ? "today" : ""} ${
                  dayInfo.isWeekend ? "weekend" : ""
                }`}
              >
                {dayInfo.day.number.value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;
```

## Benefits of StableMonth

1. **Consistent Layout**: Always 6 rows, preventing layout shifts
2. **Complete Context**: Shows days from previous/next months for better context
3. **Easy Implementation**: No manual padding calculations needed
4. **Responsive Design**: Fixed grid makes responsive layouts simpler
5. **International Support**: Respects `weekStartsOn` configuration

## Example Output

For February 2024 with Monday as start of week:

```
Mon Tue Wed Thu Fri Sat Sun
29  30  31   1   2   3   4    <- January 29-31, February 1-4
 5   6   7   8   9  10  11
12  13  14  15  16  17  18
19  20  21  22  23  24  25
26  27  28  29   1   2   3    <- February 26-29, March 1-3
 4   5   6   7   8   9  10    <- March 4-10
```

The grid always has exactly 42 days (6 weeks × 7 days), making it perfect for calendar UIs.
