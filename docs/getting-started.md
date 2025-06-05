# Getting Started

Get up and running with useTemporal in under 5 minutes! This guide will walk you through the essential concepts and your first implementation.

## What You'll Learn

- How to install and setup useTemporal
- Core concepts: `pickle`, time units, and `divide()`
- Build your first reactive date picker
- Understand the hierarchical time model

## Installation

::: code-group

```bash [npm]
npm install usetemporal
```

```bash [yarn]
yarn add usetemporal
```

```bash [pnpm]
pnpm add usetemporal
```

:::

## Your First Component

Let's build a simple month navigator to understand the core concepts:

```vue
<script setup>
import { usePickle, useMonth } from "usetemporal";

// 1. Create a pickle (time context)
const pickle = usePickle({ date: new Date() });

// 2. Create a month time unit
const month = useMonth(pickle);
</script>

<template>
  <div class="month-navigator">
    <!-- 3. Navigate time units -->
    <button @click="month.past()">← Previous</button>

    <!-- 4. Display reactive time -->
    <h2>{{ month.name }}</h2>

    <button @click="month.future()">Next →</button>
  </div>
</template>

<style scoped>
.month-navigator {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #f0f0f0;
}
</style>
```

**🎉 That's it!** You've created a reactive month navigator with just a few lines of code.

## Understanding the Magic

### 1. The Pickle 🥒

Think of `pickle` as your "time context" - it holds the current date you're browsing:

```javascript
const pickle = usePickle({ date: new Date() });
// Creates a reactive time context starting at today
```

### 2. Time Units

Time units (`useMonth`, `useYear`, `useDay`, etc.) are reactive wrappers around your pickle:

```javascript
const month = useMonth(pickle);
console.log(month.name); // "January 2024"
console.log(month.isNow); // true (if current month)
```

### 3. Automatic Synchronization

All time units sharing the same pickle stay in sync automatically:

```vue
<script setup>
const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);

// Navigate the month...
month.future();

// Everything updates automatically!
console.log(year.name); // Still correct year
console.log(month.name); // New month
console.log(day.name); // Day adjusted to new month
</script>
```

## The Revolutionary divide() Pattern

Here's where useTemporal gets exciting. Instead of manually calculating date ranges, you "divide" time units:

```vue
<script setup>
const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

// Get all days in the current month
const days = computed(() => pickle.divide(month, "day"));

// Get all hours in the current day
const today = useDay(pickle);
const hours = computed(() => pickle.divide(today, "hour"));
</script>

<template>
  <div>
    <h3>{{ month.name }} has {{ days.length }} days</h3>

    <div class="days-grid">
      <div
        v-for="day in days"
        :key="day.raw.value.getTime()"
        :class="{ today: day.isNow }"
      >
        {{ day.number }}
      </div>
    </div>
  </div>
</template>
```

**The pattern is fractal**: Any time unit can be divided into smaller units, and it works at every scale!

## Build a Full Date Picker

Now let's combine everything into a complete date picker:

```vue
<script setup>
import { usePickle, useMonth } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);

// Get all days in current month
const days = computed(() => pickle.divide(month, "day"));

// Track selected date
const selectedDate = ref(new Date());

const selectDay = (day) => {
  selectedDate.value = day.raw.value;
};

const isSelected = (day) => {
  return day.raw.value.toDateString() === selectedDate.value.toDateString();
};
</script>

<template>
  <div class="date-picker">
    <!-- Month navigation -->
    <div class="month-header">
      <button @click="month.past()">‹</button>
      <h2>{{ month.name }}</h2>
      <button @click="month.future()">›</button>
    </div>

    <!-- Days grid -->
    <div class="days-grid">
      <div
        v-for="day in days"
        :key="day.raw.value.getTime()"
        class="day"
        :class="{
          today: day.isNow,
          selected: isSelected(day),
        }"
        @click="selectDay(day)"
      >
        {{ day.number }}
      </div>
    </div>

    <p>Selected: {{ selectedDate.toLocaleDateString() }}</p>
  </div>
</template>

<style scoped>
.date-picker {
  max-width: 300px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
  cursor: pointer;
  border-radius: 4px;
}

.day:hover {
  background: #f0f0f0;
}

.day.today {
  background: #007acc;
  color: white;
}

.day.selected {
  background: #ff6b6b;
  color: white;
}
</style>
```

## Key Benefits You Just Experienced

1. **Minimal Code**: Build complex time interfaces with just a few lines
2. **Automatic Reactivity**: Everything stays in sync without manual management
3. **Consistent Interface**: Same patterns work at every time scale
4. **Intuitive API**: `divide()`, `past()`, `future()` - it reads like English!

## Next Steps

- **Browse [Examples](/examples/)** - See real-world implementations
- **Learn [Core Concepts](/concepts/hierarchical-units)** - Understand the architecture
- **Explore [API Reference](/composables/use-pickle)** - Deep dive into all composables

### Popular Next Examples

- [**Multi-Scale Calendar**](/examples/multi-scale-calendar) - Build calendars that zoom from years to minutes
- [**Time Navigation Patterns**](/examples/time-navigation) - Master navigation UX
- [**Custom Time Units**](/examples/custom-units) - Create business quarters, fiscal years, shifts

## Need Help?

- 💬 [Join our Discord](https://discord.gg/usetemporal)
- 🐛 [Report Issues](https://github.com/your-username/usetemporal/issues)
- 📖 [Read the Full Guide](/)

---

Ready to build something amazing? Let's dive into some [examples](/examples/)! 🚀
