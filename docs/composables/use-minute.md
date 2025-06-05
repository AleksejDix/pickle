# useMinute

The `useMinute` composable provides reactive minute-level time management. It implements the [TimeUnit interface](/types/time-unit) and integrates seamlessly with the hierarchical time system.

## Basic Usage

```typescript
import { usePickle, useMinute } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const minute = useMinute(pickle);

console.log(minute.name); // "3:45 PM"
console.log(minute.number); // 45
console.log(minute.isNow); // true if current minute
```

## Properties

### `name: ComputedRef<string>`

The minute as a formatted time string.

```typescript
const minute = useMinute(pickle);
console.log(minute.name); // "3:45 PM"
```

### `number: ComputedRef<number>`

The minute within the hour (0-59).

```typescript
const minute = useMinute(pickle);
console.log(minute.number); // 45
```

## Examples

### Real-time Clock

```vue
<script setup>
import { usePickle, useMinute } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const minute = useMinute(pickle);

// Update every minute
setInterval(() => {
  pickle.jumpTo(new Date());
}, 60000);
</script>

<template>
  <div class="real-time-clock">
    <div class="clock-face">
      <h1>{{ minute.name }}</h1>
      <p :class="{ current: minute.isNow }">
        {{ minute.isNow ? "Current Time" : "Selected Time" }}
      </p>
    </div>

    <div class="controls">
      <button @click="minute.past()">‹ Previous Minute</button>
      <button @click="pickle.reset()">Now</button>
      <button @click="minute.future()">Next Minute ›</button>
    </div>
  </div>
</template>

<style scoped>
.clock-face {
  text-align: center;
  margin-bottom: 2rem;
}

.clock-face h1 {
  font-size: 3rem;
  margin: 0;
  color: #007acc;
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.current {
  color: #28a745;
  font-weight: bold;
}
</style>
```

### Time Tracker

```vue
<script setup>
import { usePickle, useMinute } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const minute = useMinute(pickle);

const sessions = ref([]);
const currentSession = ref(null);

const startSession = (task) => {
  currentSession.value = {
    task,
    start: new Date(),
    duration: 0,
  };
};

const stopSession = () => {
  if (currentSession.value) {
    currentSession.value.duration = Date.now() - currentSession.value.start;
    sessions.value.push(currentSession.value);
    currentSession.value = null;
  }
};

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  return `${minutes} minutes`;
};
</script>

<template>
  <div class="time-tracker">
    <div class="current-time">
      <h2>{{ minute.name }}</h2>
    </div>

    <div v-if="!currentSession" class="start-session">
      <input v-model="newTask" placeholder="What are you working on?" />
      <button @click="startSession(newTask)">Start Timer</button>
    </div>

    <div v-else class="active-session">
      <h3>{{ currentSession.task }}</h3>
      <p>Started: {{ currentSession.start.toLocaleTimeString() }}</p>
      <button @click="stopSession()">Stop Timer</button>
    </div>

    <div class="sessions-history">
      <h3>Today's Sessions</h3>
      <div v-for="session in sessions" :key="session.start.getTime()">
        <strong>{{ session.task }}</strong>
        <span>{{ formatDuration(session.duration) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.current-time {
  text-align: center;
  margin-bottom: 2rem;
}

.start-session {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.active-session {
  text-align: center;
  padding: 2rem;
  background: #f0f8ff;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.sessions-history div {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
</style>
```

## Related Composables

- **[usePickle](/composables/use-pickle)** - Creates and manages minutes
- **[useHour](/composables/use-hour)** - Parent time unit
- **[useDay](/composables/use-day)** - Grandparent time unit
