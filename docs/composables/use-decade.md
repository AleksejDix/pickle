# useDecade

The `useDecade` composable provides reactive decade-level time management (10 years). It implements the [TimeUnit interface](/types/time-unit) and integrates seamlessly with the hierarchical time system.

## Basic Usage

```typescript
import { usePickle, useDecade } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const decade = useDecade(pickle);

console.log(decade.name); // "2020s"
console.log(decade.number); // 2020 (start year of decade)
console.log(decade.isNow); // true if current decade
```

## Properties

### `name: ComputedRef<string>`

The decade as a formatted string.

```typescript
const decade = useDecade(pickle);
console.log(decade.name); // "2020s" (2020-2029)
```

### `number: ComputedRef<number>`

The starting year of the decade.

```typescript
const decade = useDecade(pickle);
console.log(decade.number); // 2020 for years 2020-2029
```

### `isNow: ComputedRef<boolean>`

Whether this decade contains the current date.

```typescript
const decade = useDecade(pickle);
console.log(decade.isNow); // true if current decade
```

### `timespan: ComputedRef<Timespan>`

The complete time range of the decade (10 years).

```typescript
const decade = useDecade(pickle);
console.log(decade.timespan.start); // "2020-01-01T00:00:00.000Z"
console.log(decade.timespan.end); // "2030-01-01T00:00:00.000Z"
```

## Methods

### `past(): void`

Navigate to the previous decade.

```typescript
const decade = useDecade(pickle);
decade.past(); // Go to 2010s (2010-2019)
```

### `future(): void`

Navigate to the next decade.

```typescript
const decade = useDecade(pickle);
decade.future(); // Go to 2030s (2030-2039)
```

## Time Division

Divide decades into smaller time units:

```typescript
const pickle = usePickle({ date: new Date() });
const decade = useDecade(pickle);

// Get all years in the decade
const years = pickle.divide(decade, "year");
console.log(years.length); // 10
```

## Examples

### Decade Explorer

```vue
<script setup>
import { usePickle, useDecade } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const decade = useDecade(pickle);

const years = computed(() => pickle.divide(decade, "year"));

const decadeInfo = computed(() => {
  const start = decade.timespan.start.getFullYear();
  const end = decade.timespan.end.getFullYear() - 1;
  return {
    range: `${start} - ${end}`,
    totalYears: 10,
    currentYear: years.value.find((y) => y.isNow),
  };
});

const decadeName = computed(() => {
  const startYear = decade.number;
  return `${startYear}s`;
});
</script>

<template>
  <div class="decade-explorer">
    <div class="decade-header">
      <button @click="decade.past()">‹ {{ decade.number - 10 }}s</button>
      <h1>{{ decadeName }}</h1>
      <button @click="decade.future()">{{ decade.number + 10 }}s ›</button>
    </div>

    <div class="decade-info">
      <p><strong>Years:</strong> {{ decadeInfo.range }}</p>
      <p><strong>Total Years:</strong> {{ decadeInfo.totalYears }}</p>
      <p v-if="decadeInfo.currentYear">
        <strong>Current Year:</strong> {{ decadeInfo.currentYear.name }}
      </p>
    </div>

    <div class="years-grid">
      <div
        v-for="year in years"
        :key="year.number"
        class="year"
        :class="{ current: year.isNow }"
      >
        <h3>{{ year.number }}</h3>
      </div>
    </div>
  </div>
</template>

<style scoped>
.decade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.decade-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.years-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}

.year {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
}

.year.current {
  background: #007acc;
  color: white;
  border-color: #005a8c;
}
</style>
```

### Cultural Trends by Decade

```vue
<script setup>
import { usePickle, useDecade } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const decade = useDecade(pickle);

const culturalTrends = ref([
  {
    decade: 1950,
    trends: [
      "Rock and Roll",
      "Television",
      "Suburbanization",
      "Cold War Culture",
    ],
  },
  {
    decade: 1960,
    trends: [
      "Civil Rights Movement",
      "Counterculture",
      "Space Race",
      "Beatles",
    ],
  },
  {
    decade: 1970,
    trends: [
      "Disco",
      "Environmental Movement",
      "Personal Computers",
      "Punk Rock",
    ],
  },
  {
    decade: 1980,
    trends: ["MTV", "Personal Computers", "Yuppie Culture", "Hip Hop"],
  },
  {
    decade: 1990,
    trends: ["Internet", "Grunge Music", "Mobile Phones", "Reality TV"],
  },
  {
    decade: 2000,
    trends: [
      "Social Media",
      "iPod/iTunes",
      "Reality TV Boom",
      "Emo/Indie Music",
    ],
  },
  {
    decade: 2010,
    trends: [
      "Smartphones",
      "Streaming Services",
      "Social Media Influencers",
      "Craft Beer",
    ],
  },
  {
    decade: 2020,
    trends: ["Remote Work", "TikTok", "Electric Vehicles", "AI Revolution"],
  },
]);

const currentTrends = computed(() => {
  return culturalTrends.value.find((t) => t.decade === decade.number);
});

const decadeName = computed(() => `${decade.number}s`);
</script>

<template>
  <div class="cultural-trends">
    <div class="decade-selector">
      <h2>{{ decadeName }} Cultural Trends</h2>
      <div class="navigation">
        <button @click="decade.past()">‹ {{ decade.number - 10 }}s</button>
        <span>{{ decadeName }}</span>
        <button @click="decade.future()">{{ decade.number + 10 }}s ›</button>
      </div>
    </div>

    <div v-if="currentTrends" class="trends-list">
      <h3>Defining Trends of the {{ decadeName }}</h3>
      <div class="trends-grid">
        <div
          v-for="trend in currentTrends.trends"
          :key="trend"
          class="trend-card"
        >
          {{ trend }}
        </div>
      </div>
    </div>

    <div v-else class="no-trends">
      <p>No cultural trend data available for the {{ decadeName }}.</p>
    </div>
  </div>
</template>

<style scoped>
.decade-selector {
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

.trends-list {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
}

.trends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.trend-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #007acc;
}

.no-trends {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 2rem;
}
</style>
```

### Decade Statistics

```vue
<script setup>
import { usePickle, useDecade } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const decade = useDecade(pickle);

const years = computed(() => pickle.divide(decade, "year"));

const decadeStats = computed(() => {
  const currentYear = new Date().getFullYear();
  const decadeStart = decade.number;
  const decadeEnd = decade.number + 9;

  const completedYears = years.value.filter(
    (year) => year.number < currentYear
  );

  const remainingYears = years.value.filter(
    (year) => year.number >= currentYear
  );

  const progressPercent = decade.isNow
    ? ((currentYear - decadeStart) / 10) * 100
    : decade.number < currentYear
    ? 100
    : 0;

  return {
    totalYears: 10,
    completedYears: completedYears.length,
    remainingYears: remainingYears.length,
    progressPercent: Math.round(progressPercent),
    isComplete: decade.number + 9 < currentYear,
    isFuture: decade.number > currentYear,
  };
});
</script>

<template>
  <div class="decade-statistics">
    <div class="decade-header">
      <h2>{{ decade.number }}s Statistics</h2>
      <div class="navigation">
        <button @click="decade.past()">‹ Previous</button>
        <button @click="decade.future()">Next ›</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>{{ decadeStats.totalYears }}</h3>
        <p>Total Years</p>
      </div>

      <div class="stat-card">
        <h3>{{ decadeStats.completedYears }}</h3>
        <p>Completed Years</p>
      </div>

      <div class="stat-card">
        <h3>{{ decadeStats.remainingYears }}</h3>
        <p>Remaining Years</p>
      </div>

      <div class="stat-card">
        <h3>{{ decadeStats.progressPercent }}%</h3>
        <p>Progress</p>
      </div>
    </div>

    <div class="progress-bar">
      <div class="progress-label">Decade Progress</div>
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{ width: decadeStats.progressPercent + '%' }"
        ></div>
      </div>
    </div>

    <div class="decade-status">
      <div v-if="decadeStats.isComplete" class="status complete">
        ✓ Decade Complete
      </div>
      <div v-else-if="decadeStats.isFuture" class="status future">
        ⏰ Future Decade
      </div>
      <div v-else class="status current">⚡ Current Decade</div>
    </div>
  </div>
</template>

<style scoped>
.decade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.navigation {
  display: flex;
  gap: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat-card h3 {
  font-size: 2rem;
  margin: 0;
  color: #007acc;
}

.stat-card p {
  margin: 0.5rem 0 0 0;
  color: #666;
}

.progress-bar {
  margin-bottom: 2rem;
}

.progress-label {
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.progress-track {
  height: 20px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007acc, #4caf50);
  transition: width 0.3s ease;
}

.decade-status {
  text-align: center;
}

.status {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
}

.status.complete {
  background: #d4edda;
  color: #155724;
}

.status.future {
  background: #fff3cd;
  color: #856404;
}

.status.current {
  background: #cce5ff;
  color: #004085;
}
</style>
```

## Related Composables

- **[usePickle](/composables/use-pickle)** - Creates and manages decades
- **[useCentury](/composables/use-century)** - Parent time unit
- **[useYear](/composables/use-year)** - Divide decades into years
