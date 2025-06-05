# useCentury

The `useCentury` composable provides reactive century-level time management (100 years). It implements the [TimeUnit interface](/types/time-unit) and integrates seamlessly with the hierarchical time system.

## Basic Usage

```typescript
import { usePickle, useCentury } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const century = useCentury(pickle);

console.log(century.name); // "21st Century"
console.log(century.number); // 21 (current century)
console.log(century.isNow); // true if current century
```

## Properties

### `name: ComputedRef<string>`

The century as a formatted string.

```typescript
const century = useCentury(pickle);
console.log(century.name); // "21st Century" (2001-2100)
```

### `number: ComputedRef<number>`

The century number (1-based).

```typescript
const century = useCentury(pickle);
console.log(century.number); // 21 for years 2001-2100
```

### `isNow: ComputedRef<boolean>`

Whether this century contains the current date.

```typescript
const century = useCentury(pickle);
console.log(century.isNow); // true if current century
```

### `timespan: ComputedRef<Timespan>`

The complete time range of the century (100 years).

```typescript
const century = useCentury(pickle);
console.log(century.timespan.start); // "2001-01-01T00:00:00.000Z"
console.log(century.timespan.end); // "2101-01-01T00:00:00.000Z"
```

## Methods

### `past(): void`

Navigate to the previous century.

```typescript
const century = useCentury(pickle);
century.past(); // Go to 20th century (1901-2000)
```

### `future(): void`

Navigate to the next century.

```typescript
const century = useCentury(pickle);
century.future(); // Go to 22nd century (2101-2200)
```

## Time Division

Divide centuries into smaller time units:

```typescript
const pickle = usePickle({ date: new Date() });
const century = useCentury(pickle);

// Get all decades in the century
const decades = pickle.divide(century, "decade");
console.log(decades.length); // 10

// Get all years in the century
const years = pickle.divide(century, "year");
console.log(years.length); // 100
```

## Examples

### Century Overview

```vue
<script setup>
import { usePickle, useCentury } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const century = useCentury(pickle);

const decades = computed(() => pickle.divide(century, "decade"));

const centuryInfo = computed(() => {
  const start = century.timespan.start.getFullYear();
  const end = century.timespan.end.getFullYear() - 1;
  return {
    range: `${start} - ${end}`,
    totalYears: 100,
    currentDecade: decades.value.find((d) => d.isNow),
  };
});

const centuryOrdinal = computed(() => {
  const ordinals = [
    "",
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
    "10th",
    "11th",
    "12th",
    "13th",
    "14th",
    "15th",
    "16th",
    "17th",
    "18th",
    "19th",
    "20th",
    "21st",
    "22nd",
    "23rd",
    "24th",
    "25th",
  ];
  return ordinals[century.number] || `${century.number}th`;
});
</script>

<template>
  <div class="century-overview">
    <div class="century-header">
      <button @click="century.past()">‹ Previous Century</button>
      <h1>{{ centuryOrdinal }} Century</h1>
      <button @click="century.future()">Next Century ›</button>
    </div>

    <div class="century-info">
      <p><strong>Years:</strong> {{ centuryInfo.range }}</p>
      <p><strong>Total Years:</strong> {{ centuryInfo.totalYears }}</p>
      <p v-if="centuryInfo.currentDecade">
        <strong>Current Decade:</strong> {{ centuryInfo.currentDecade.name }}
      </p>
    </div>

    <div class="decades-grid">
      <div
        v-for="decade in decades"
        :key="decade.number"
        class="decade"
        :class="{ current: decade.isNow }"
      >
        <h3>{{ decade.name }}</h3>
        <p>{{ decade.timespan.start.getFullYear() }}s</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.century-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.century-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.decades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.decade {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
}

.decade.current {
  background: #007acc;
  color: white;
  border-color: #005a8c;
}
</style>
```

### Historical Periods

```vue
<script setup>
import { usePickle, useCentury } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const century = useCentury(pickle);

const historicalPeriods = ref([
  {
    century: 15,
    period: "Early Renaissance",
    events: [
      "Printing Press",
      "Age of Exploration begins",
      "Fall of Constantinople",
    ],
  },
  {
    century: 16,
    period: "High Renaissance",
    events: [
      "Leonardo da Vinci",
      "Protestant Reformation",
      "Discovery of Americas",
    ],
  },
  {
    century: 17,
    period: "Baroque Period",
    events: ["Scientific Revolution", "Thirty Years War", "English Civil War"],
  },
  {
    century: 18,
    period: "Age of Enlightenment",
    events: [
      "Industrial Revolution",
      "American Independence",
      "French Revolution",
    ],
  },
  {
    century: 19,
    period: "Industrial Age",
    events: ["Steam Power", "Telegraph", "Photography", "Evolution Theory"],
  },
  {
    century: 20,
    period: "Modern Era",
    events: ["World Wars", "Computer Age", "Space Exploration", "Internet"],
  },
  {
    century: 21,
    period: "Digital Age",
    events: ["Social Media", "Smartphones", "AI Revolution", "Climate Action"],
  },
]);

const currentPeriod = computed(() => {
  return historicalPeriods.value.find((p) => p.century === century.number);
});
</script>

<template>
  <div class="historical-periods">
    <div class="century-selector">
      <h2>
        {{ century.name }} - {{ currentPeriod?.period || "Unknown Period" }}
      </h2>
      <div class="navigation">
        <button @click="century.past()" :disabled="century.number <= 1">
          ‹ Previous Century
        </button>
        <span
          >{{ century.number
          }}{{
            century.number === 21
              ? "st"
              : century.number === 22
              ? "nd"
              : century.number === 23
              ? "rd"
              : "th"
          }}
          Century</span
        >
        <button @click="century.future()">Next Century ›</button>
      </div>
    </div>

    <div v-if="currentPeriod" class="period-details">
      <h3>{{ currentPeriod.period }}</h3>
      <div class="events-list">
        <h4>Major Events & Developments</h4>
        <ul>
          <li v-for="event in currentPeriod.events" :key="event">
            {{ event }}
          </li>
        </ul>
      </div>
    </div>

    <div v-else class="no-data">
      <p>No historical data available for this century.</p>
    </div>
  </div>
</template>

<style scoped>
.century-selector {
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

.period-details {
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

.no-data {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 2rem;
}
</style>
```

### Century Comparison

```vue
<script setup>
import { usePickle, useCentury } from "usetemporal";

const leftPickle = usePickle({ date: new Date("1901-01-01") });
const rightPickle = usePickle({ date: new Date("2001-01-01") });

const leftCentury = useCentury(leftPickle);
const rightCentury = useCentury(rightPickle);

const comparisons = ref([
  {
    category: "Transportation",
    left: "Horse-drawn carriages, early automobiles",
    right: "Cars, airplanes, space travel",
  },
  {
    category: "Communication",
    left: "Telegraph, telephone",
    right: "Internet, smartphones, social media",
  },
  {
    category: "Medicine",
    left: "Basic surgery, X-rays discovered",
    right: "Organ transplants, gene therapy, vaccines",
  },
  {
    category: "Energy",
    left: "Coal, early electricity",
    right: "Nuclear, renewable energy, batteries",
  },
]);
</script>

<template>
  <div class="century-comparison">
    <h2>Century Comparison</h2>

    <div class="centuries-header">
      <div class="century-selector">
        <h3>{{ leftCentury.name }}</h3>
        <div class="controls">
          <button @click="leftCentury.past()">‹</button>
          <button @click="leftCentury.future()">›</button>
        </div>
      </div>

      <div class="vs">VS</div>

      <div class="century-selector">
        <h3>{{ rightCentury.name }}</h3>
        <div class="controls">
          <button @click="rightCentury.past()">‹</button>
          <button @click="rightCentury.future()">›</button>
        </div>
      </div>
    </div>

    <div class="comparison-table">
      <div class="comparison-row header">
        <div class="category">Category</div>
        <div class="left-value">{{ leftCentury.name }}</div>
        <div class="right-value">{{ rightCentury.name }}</div>
      </div>

      <div
        v-for="comp in comparisons"
        :key="comp.category"
        class="comparison-row"
      >
        <div class="category">{{ comp.category }}</div>
        <div class="left-value">{{ comp.left }}</div>
        <div class="right-value">{{ comp.right }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.centuries-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
}

.century-selector {
  text-align: center;
}

.controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.vs {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007acc;
}

.comparison-table {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.comparison-row {
  display: grid;
  grid-template-columns: 150px 1fr 1fr;
  border-bottom: 1px solid #eee;
}

.comparison-row.header {
  background: #f8f9fa;
  font-weight: bold;
}

.comparison-row > div {
  padding: 1rem;
  border-right: 1px solid #eee;
}

.comparison-row > div:last-child {
  border-right: none;
}

.category {
  background: #f8f9fa;
  font-weight: bold;
}
</style>
```

## Related Composables

- **[usePickle](/composables/use-pickle)** - Creates and manages centuries
- **[useMillennium](/composables/use-millennium)** - Parent time unit
- **[useDecade](/composables/use-decade)** - Divide centuries into decades
- **[useYear](/composables/use-year)** - Divide centuries into years
