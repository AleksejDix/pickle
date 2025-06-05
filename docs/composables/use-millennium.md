# useMillennium

The `useMillennium` composable provides reactive millennium-level time management (1000 years). It implements the [TimeUnit interface](/types/time-unit) and integrates seamlessly with the hierarchical time system.

## Basic Usage

```typescript
import { usePickle, useMillennium } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const millennium = useMillennium(pickle);

console.log(millennium.name); // "3rd Millennium"
console.log(millennium.number); // 3 (current millennium)
console.log(millennium.isNow); // true if current millennium
```

## Properties

### `name: ComputedRef<string>`

The millennium as a formatted string.

```typescript
const millennium = useMillennium(pickle);
console.log(millennium.name); // "3rd Millennium" (2001-3000)
```

### `number: ComputedRef<number>`

The millennium number (1-based).

```typescript
const millennium = useMillennium(pickle);
console.log(millennium.number); // 3 for years 2001-3000
```

### `isNow: ComputedRef<boolean>`

Whether this millennium contains the current date.

```typescript
const millennium = useMillennium(pickle);
console.log(millennium.isNow); // true if current millennium
```

### `timespan: ComputedRef<Timespan>`

The complete time range of the millennium (1000 years).

```typescript
const millennium = useMillennium(pickle);
console.log(millennium.timespan.start); // "2001-01-01T00:00:00.000Z"
console.log(millennium.timespan.end); // "3001-01-01T00:00:00.000Z"
```

## Methods

### `past(): void`

Navigate to the previous millennium.

```typescript
const millennium = useMillennium(pickle);
millennium.past(); // Go to 2nd millennium (1001-2000)
```

### `future(): void`

Navigate to the next millennium.

```typescript
const millennium = useMillennium(pickle);
millennium.future(); // Go to 4th millennium (3001-4000)
```

## Time Division

Divide millennia into smaller time units:

```typescript
const pickle = usePickle({ date: new Date() });
const millennium = useMillennium(pickle);

// Get all centuries in the millennium
const centuries = pickle.divide(millennium, "century");
console.log(centuries.length); // 10

// Get all decades in the millennium
const decades = pickle.divide(millennium, "decade");
console.log(decades.length); // 100

// Get all years in the millennium
const years = pickle.divide(millennium, "year");
console.log(years.length); // 1000
```

## Examples

### Millennium Timeline

```vue
<script setup>
import { usePickle, useMillennium } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const millennium = useMillennium(pickle);

const centuries = computed(() => pickle.divide(millennium, "century"));

const millenniumInfo = computed(() => {
  const start = millennium.timespan.start.getFullYear();
  const end = millennium.timespan.end.getFullYear() - 1;
  return {
    range: `${start} - ${end}`,
    totalYears: end - start + 1,
    currentCentury: centuries.value.find((c) => c.isNow),
  };
});
</script>

<template>
  <div class="millennium-timeline">
    <div class="millennium-header">
      <button @click="millennium.past()">‹ Previous Millennium</button>
      <h1>{{ millennium.name }}</h1>
      <button @click="millennium.future()">Next Millennium ›</button>
    </div>

    <div class="millennium-info">
      <p><strong>Years:</strong> {{ millenniumInfo.range }}</p>
      <p><strong>Total Years:</strong> {{ millenniumInfo.totalYears }}</p>
      <p v-if="millenniumInfo.currentCentury">
        <strong>Current Century:</strong>
        {{ millenniumInfo.currentCentury.name }}
      </p>
    </div>

    <div class="centuries-grid">
      <div
        v-for="century in centuries"
        :key="century.number"
        class="century"
        :class="{ current: century.isNow }"
      >
        <h3>{{ century.name }}</h3>
        <p>
          {{ century.timespan.start.getFullYear() }}-{{
            century.timespan.end.getFullYear() - 1
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.millennium-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.millennium-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.centuries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.century {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
}

.century.current {
  background: #007acc;
  color: white;
  border-color: #005a8c;
}
</style>
```

### Historical Events Timeline

```vue
<script setup>
import { usePickle, useMillennium } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const millennium = useMillennium(pickle);

const historicalEvents = ref([
  {
    millennium: 1,
    events: ["Birth of Christ", "Roman Empire peak", "Fall of Western Rome"],
  },
  {
    millennium: 2,
    events: [
      "Medieval period",
      "Renaissance",
      "Age of Exploration",
      "Industrial Revolution",
    ],
  },
  {
    millennium: 3,
    events: [
      "Digital Age",
      "Space Exploration",
      "Internet Revolution",
      "AI Development",
    ],
  },
]);

const currentEvents = computed(() => {
  return (
    historicalEvents.value.find((h) => h.millennium === millennium.number)
      ?.events || []
  );
});
</script>

<template>
  <div class="historical-timeline">
    <div class="millennium-selector">
      <h2>{{ millennium.name }} Historical Events</h2>
      <div class="navigation">
        <button @click="millennium.past()" :disabled="millennium.number <= 1">
          ‹ Previous
        </button>
        <span>Millennium {{ millennium.number }}</span>
        <button @click="millennium.future()">Next ›</button>
      </div>
    </div>

    <div class="events-list">
      <h3>Major Events</h3>
      <ul>
        <li v-for="event in currentEvents" :key="event">
          {{ event }}
        </li>
      </ul>

      <div v-if="currentEvents.length === 0" class="no-events">
        No recorded events for this millennium.
      </div>
    </div>
  </div>
</template>

<style scoped>
.millennium-selector {
  text-align: center;
  margin-bottom: 2rem;
}

.navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.events-list {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
}

.events-list ul {
  list-style-type: disc;
  padding-left: 2rem;
}

.events-list li {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.no-events {
  text-align: center;
  color: #666;
  font-style: italic;
}
</style>
```

## Related Composables

- **[usePickle](/composables/use-pickle)** - Creates and manages millennia
- **[useCentury](/composables/use-century)** - Divide millennia into centuries
- **[useDecade](/composables/use-decade)** - Divide millennia into decades
- **[useYear](/composables/use-year)** - Divide millennia into years
