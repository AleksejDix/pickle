# Timespan Type

The `Timespan` type represents a time range with start and end boundaries. It's used throughout useTemporal to define the temporal boundaries of time units and calculate durations.

## Type Definition

```typescript
interface Timespan {
  start: Date;
  end: Date;
  duration: number; // milliseconds

  // Utility methods
  contains(date: Date): boolean;
  overlaps(other: Timespan): boolean;
  intersect(other: Timespan): Timespan | null;
  union(other: Timespan): Timespan;
}
```

## Properties

### `start: Date`

The beginning of the time range (inclusive).

```typescript
const month = useMonth(pickle);
console.log(month.timespan.start); // First millisecond of the month
// Example: "2024-01-01T00:00:00.000Z"
```

### `end: Date`

The end of the time range (exclusive).

```typescript
const month = useMonth(pickle);
console.log(month.timespan.end); // First millisecond of next month
// Example: "2024-02-01T00:00:00.000Z"
```

### `duration: number`

The length of the timespan in milliseconds.

```typescript
const day = useDay(pickle);
console.log(day.timespan.duration); // 86400000 (24 hours in ms)

const month = useMonth(pickle);
console.log(month.timespan.duration); // Varies by month (28-31 days)
```

## Methods

### `contains(date: Date): boolean`

Check if a date falls within this timespan.

```typescript
const month = useMonth(pickle); // January 2024
const someDate = new Date("2024-01-15");
const otherDate = new Date("2024-02-15");

console.log(month.timespan.contains(someDate)); // true
console.log(month.timespan.contains(otherDate)); // false
```

### `overlaps(other: Timespan): boolean`

Check if this timespan overlaps with another timespan.

```typescript
const january = useMonth(pickle); // January 2024
pickle.jumpTo(new Date("2024-02-01"));
const february = useMonth(pickle); // February 2024

console.log(january.timespan.overlaps(february.timespan)); // false

// Overlapping ranges
const week1 = useWeek(pickle); // Week containing Feb 1
pickle.jumpTo(new Date("2024-02-07"));
const week2 = useWeek(pickle); // Week containing Feb 7

console.log(week1.timespan.overlaps(week2.timespan)); // true if they overlap
```

### `intersect(other: Timespan): Timespan | null`

Get the overlapping portion of two timespans.

```typescript
const month = useMonth(pickle); // January 2024
pickle.jumpTo(new Date("2024-01-15"));
const week = useWeek(pickle); // Week containing Jan 15

const intersection = month.timespan.intersect(week.timespan);
console.log(intersection); // The portion of the week that's in January
```

### `union(other: Timespan): Timespan`

Combine two timespans into one larger timespan.

```typescript
const january = useMonth(pickle);
pickle.jumpTo(new Date("2024-02-01"));
const february = useMonth(pickle);

const combined = january.timespan.union(february.timespan);
console.log(combined.start); // Start of January
console.log(combined.end); // End of February
```

## Usage Examples

### Event Scheduling

```vue
<script setup>
import { usePickle, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date() });

// Define events with timespans
const events = ref([
  {
    title: "Team Meeting",
    timespan: {
      start: new Date("2024-01-15T09:00:00"),
      end: new Date("2024-01-15T10:00:00"),
      duration: 60 * 60 * 1000, // 1 hour
    },
  },
  {
    title: "Lunch Break",
    timespan: {
      start: new Date("2024-01-15T12:00:00"),
      end: new Date("2024-01-15T13:00:00"),
      duration: 60 * 60 * 1000, // 1 hour
    },
  },
]);

// Check if events fit in a day
const day = useDay(pickle);
const eventsInDay = computed(() =>
  events.value.filter(
    (event) =>
      day.timespan.contains(event.timespan.start) ||
      day.timespan.overlaps(event.timespan)
  )
);

// Check for conflicts
const hasConflicts = computed(() => {
  for (let i = 0; i < events.value.length; i++) {
    for (let j = i + 1; j < events.value.length; j++) {
      if (events.value[i].timespan.overlaps(events.value[j].timespan)) {
        return true;
      }
    }
  }
  return false;
});
</script>

<template>
  <div>
    <h2>{{ day.name }}</h2>

    <div v-if="hasConflicts" class="warning">
      ⚠️ Schedule conflicts detected!
    </div>

    <div class="events">
      <div v-for="event in eventsInDay" :key="event.title">
        <h3>{{ event.title }}</h3>
        <p>{{ formatTimespan(event.timespan) }}</p>
      </div>
    </div>
  </div>
</template>
```

### Working Hours Calculator

```vue
<script setup>
import { usePickle, useWeek } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const week = useWeek(pickle);

// Define working hours
const workingHours = {
  start: 9, // 9 AM
  end: 17, // 5 PM
};

// Calculate total working hours in a week
const totalWorkingHours = computed(() => {
  const weekDays = pickle.divide(week, "day");
  const workingDays = weekDays.filter((day) => {
    const dayOfWeek = day.raw.value.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
  });

  return workingDays.length * (workingHours.end - workingHours.start);
});

// Get working timespan for each day
const workingTimespans = computed(() => {
  const weekDays = pickle.divide(week, "day");
  return weekDays
    .filter((day) => {
      const dayOfWeek = day.raw.value.getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    })
    .map((day) => {
      const startTime = new Date(day.raw.value);
      startTime.setHours(workingHours.start, 0, 0, 0);

      const endTime = new Date(day.raw.value);
      endTime.setHours(workingHours.end, 0, 0, 0);

      return {
        day: day.name,
        timespan: {
          start: startTime,
          end: endTime,
          duration: (workingHours.end - workingHours.start) * 60 * 60 * 1000,
        },
      };
    });
});
</script>

<template>
  <div>
    <h2>{{ week.name }}</h2>
    <p>Total working hours: {{ totalWorkingHours }}</p>

    <div class="working-schedule">
      <div v-for="item in workingTimespans" :key="item.day">
        <h3>{{ item.day }}</h3>
        <p>
          {{ item.timespan.start.toLocaleTimeString() }} -
          {{ item.timespan.end.toLocaleTimeString() }}
        </p>
        <p>Duration: {{ item.timespan.duration / (1000 * 60 * 60) }} hours</p>
      </div>
    </div>
  </div>
</template>
```

### Availability Checker

```vue
<script setup>
import { usePickle, useDay } from "usetemporal";

const pickle = usePickle({ date: new Date() });

// Existing bookings
const bookings = ref([
  {
    start: new Date("2024-01-15T09:00:00"),
    end: new Date("2024-01-15T10:30:00"),
    duration: 90 * 60 * 1000,
  },
  {
    start: new Date("2024-01-15T14:00:00"),
    end: new Date("2024-01-15T15:30:00"),
    duration: 90 * 60 * 1000,
  },
]);

// Check availability for new booking
const checkAvailability = (start: Date, duration: number) => {
  const proposedEnd = new Date(start.getTime() + duration);
  const proposedTimespan = {
    start,
    end: proposedEnd,
    duration,
  };

  return !bookings.value.some(
    (booking) => booking.overlaps && booking.overlaps(proposedTimespan)
  );
};

// Find available slots
const findAvailableSlots = (date: Date, duration: number) => {
  const day = pickle.createUnit("day", date);
  const businessStart = new Date(date);
  businessStart.setHours(9, 0, 0, 0);

  const businessEnd = new Date(date);
  businessEnd.setHours(17, 0, 0, 0);

  const slots = [];
  let currentTime = businessStart;

  while (currentTime.getTime() + duration <= businessEnd.getTime()) {
    if (checkAvailability(currentTime, duration)) {
      slots.push({
        start: new Date(currentTime),
        end: new Date(currentTime.getTime() + duration),
        duration,
      });
    }
    currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000); // 30-min intervals
  }

  return slots;
};

const selectedDate = ref(new Date());
const requestedDuration = ref(60 * 60 * 1000); // 1 hour

const availableSlots = computed(() =>
  findAvailableSlots(selectedDate.value, requestedDuration.value)
);
</script>

<template>
  <div>
    <h2>Availability Checker</h2>

    <div>
      <label>Date:</label>
      <input v-model="selectedDate" type="date" />
    </div>

    <div>
      <label>Duration (hours):</label>
      <input
        v-model="requestedDuration"
        type="number"
        :value="requestedDuration / (60 * 60 * 1000)"
        @input="requestedDuration = $event.target.value * 60 * 60 * 1000"
      />
    </div>

    <h3>Available Slots</h3>
    <div class="slots">
      <div v-for="slot in availableSlots" :key="slot.start.getTime()">
        {{ slot.start.toLocaleTimeString() }} -
        {{ slot.end.toLocaleTimeString() }}
      </div>
    </div>

    <div v-if="availableSlots.length === 0" class="no-slots">
      No available slots for the requested duration.
    </div>
  </div>
</template>
```

## Utility Functions

### Duration Formatting

```typescript
const formatDuration = (duration: number): string => {
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Usage
const month = useMonth(pickle);
console.log(formatDuration(month.timespan.duration)); // "744h 0m" (31 days)
```

### Timespan Comparison

```typescript
const isTimespanEqual = (a: Timespan, b: Timespan): boolean => {
  return (
    a.start.getTime() === b.start.getTime() &&
    a.end.getTime() === b.end.getTime()
  );
};

const isTimespanLonger = (a: Timespan, b: Timespan): boolean => {
  return a.duration > b.duration;
};
```

## Related Types

- **[TimeUnit](/types/time-unit)** - Uses Timespan for its `timespan` property
- **[PickleCore](/types/pickle-core)** - Creates TimeUnits that contain Timespans

## Related Composables

- **All time composables** - Each provides a `timespan` property
- **[usePickle](/composables/use-pickle)** - Creates time units with timespans
