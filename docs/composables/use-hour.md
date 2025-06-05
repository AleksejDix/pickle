# useHour

The `useHour` composable provides reactive hour-level time management. It implements the [TimeUnit interface](/types/time-unit) and integrates seamlessly with the hierarchical time system.

## Basic Usage

```typescript
import { usePickle, useHour } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const hour = useHour(pickle);

console.log(hour.name); // "3:00 PM"
console.log(hour.number); // 15 (24-hour format)
console.log(hour.isNow); // true if current hour
```

## Properties

### `name: ComputedRef<string>`

The hour as a formatted time string.

```typescript
const hour = useHour(pickle);
console.log(hour.name); // "3:00 PM"
```

### `number: ComputedRef<number>`

The hour in 24-hour format (0-23).

```typescript
const hour = useHour(pickle);
console.log(hour.number); // 15 (3 PM)
```

## Time Division

Divide hours into minutes:

```typescript
const pickle = usePickle({ date: new Date() });
const hour = useHour(pickle);

// Get all minutes in the hour
const minutes = pickle.divide(hour, "minute");
console.log(minutes.length); // 60
```

## Examples

### Hourly Schedule

```vue
<script setup>
import { usePickle, useHour } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const hour = useHour(pickle);

const minutes = computed(() => pickle.divide(hour, "minute"));

const appointments = ref([
  { minute: 0, client: "Client A - Consultation" },
  { minute: 30, client: "Client B - Follow-up" },
]);
</script>

<template>
  <div class="hourly-schedule">
    <div class="hour-header">
      <button @click="hour.past()">‹ Previous Hour</button>
      <h2>{{ hour.name }}</h2>
      <button @click="hour.future()">Next Hour ›</button>
    </div>

    <div class="minutes-grid">
      <div
        v-for="minute in minutes.filter((_, i) => i % 15 === 0)"
        :key="minute.number"
        class="quarter-hour"
        :class="{ current: minute.isNow }"
      >
        <div class="time">{{ minute.name }}</div>
        <div class="content">
          <template
            v-for="apt in appointments.filter(
              (a) => a.minute === minute.number
            )"
          >
            <div class="appointment">{{ apt.client }}</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hour-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.quarter-hour {
  display: flex;
  border-bottom: 1px solid #eee;
  padding: 0.5rem;
}

.quarter-hour.current {
  background: #f0f8ff;
}

.time {
  width: 100px;
  font-weight: bold;
}

.appointment {
  background: #007acc;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
</style>
```

## Related Composables

- **[usePickle](/composables/use-pickle)** - Creates and manages hours
- **[useDay](/composables/use-day)** - Parent time unit
- **[useMinute](/composables/use-minute)** - Divide hours into minutes
