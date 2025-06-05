# useQuarter

The `useQuarter` composable provides reactive quarter-level time management (3 months). It implements the [TimeUnit interface](/types/time-unit) and integrates seamlessly with the hierarchical time system, supporting both calendar and fiscal quarters.

## Basic Usage

```typescript
import { usePickle, useQuarter } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const quarter = useQuarter(pickle);

console.log(quarter.name); // "Q1 2024"
console.log(quarter.number); // 1 (first quarter)
console.log(quarter.isNow); // true if current quarter
```

## Configuration Options

### Fiscal Year Support

```typescript
import { usePickle, useQuarter } from "usetemporal";

const pickle = usePickle({ date: new Date() });

// Calendar year quarters (default)
const calendarQuarter = useQuarter(pickle);

// Fiscal year starting in April
const fiscalQuarter = useQuarter(pickle, {
  fiscalYearStart: "April",
});

// Fiscal year starting in October
const fiscalQuarter2 = useQuarter(pickle, {
  fiscalYearStart: "October",
});
```

## Properties

### `name: ComputedRef<string>`

The quarter as a formatted string.

```typescript
const quarter = useQuarter(pickle);
console.log(quarter.name); // "Q1 2024" (Jan-Mar)

const fiscalQuarter = useQuarter(pickle, { fiscalYearStart: "April" });
console.log(fiscalQuarter.name); // "FY Q1 2024" (Apr-Jun)
```

### `number: ComputedRef<number>`

The quarter number (1-4).

```typescript
const quarter = useQuarter(pickle);
console.log(quarter.number); // 1-4 based on calendar or fiscal year
```

### `isNow: ComputedRef<boolean>`

Whether this quarter contains the current date.

```typescript
const quarter = useQuarter(pickle);
console.log(quarter.isNow); // true if current quarter
```

### `timespan: ComputedRef<Timespan>`

The complete time range of the quarter (3 months).

```typescript
const quarter = useQuarter(pickle);
console.log(quarter.timespan.start); // Start of quarter
console.log(quarter.timespan.end); // Start of next quarter
```

## Methods

### `past(): void`

Navigate to the previous quarter.

```typescript
const quarter = useQuarter(pickle);
quarter.past(); // Go to previous quarter
```

### `future(): void`

Navigate to the next quarter.

```typescript
const quarter = useQuarter(pickle);
quarter.future(); // Go to next quarter
```

## Time Division

Divide quarters into smaller time units:

```typescript
const pickle = usePickle({ date: new Date() });
const quarter = useQuarter(pickle);

// Get all months in the quarter
const months = pickle.divide(quarter, "month");
console.log(months.length); // 3

// Get all days in the quarter
const days = pickle.divide(quarter, "day");
console.log(days.length); // 89-92 depending on quarter
```

## Examples

### Business Quarter Dashboard

```vue
<script setup>
import { usePickle, useQuarter } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const fiscalStart = ref("April"); // Company fiscal year starts in April

const quarter = useQuarter(pickle, {
  fiscalYearStart: fiscalStart.value,
});

const months = computed(() => pickle.divide(quarter, "month"));

const quarterInfo = computed(() => {
  const isFiscal = fiscalStart.value !== "January";
  const prefix = isFiscal ? "FY " : "";
  const startMonth = quarter.timespan.start.toLocaleDateString("en-US", {
    month: "long",
  });
  const endMonth = quarter.timespan.end.toLocaleDateString("en-US", {
    month: "long",
  });

  return {
    name: `${prefix}Q${quarter.number} ${quarter.timespan.start.getFullYear()}`,
    range: `${startMonth} - ${endMonth}`,
    isFiscal,
    currentMonth: months.value.find((m) => m.isNow),
  };
});

const businessMetrics = ref([
  { name: "Revenue", value: "$2.4M", change: "+12%", positive: true },
  { name: "Growth", value: "15%", change: "+3%", positive: true },
  { name: "Expenses", value: "$1.8M", change: "+5%", positive: false },
  { name: "Profit", value: "$600K", change: "+25%", positive: true },
]);
</script>

<template>
  <div class="quarter-dashboard">
    <div class="quarter-header">
      <button @click="quarter.past()">‹ Previous Quarter</button>
      <h1>{{ quarterInfo.name }}</h1>
      <button @click="quarter.future()">Next Quarter ›</button>
    </div>

    <div class="quarter-info">
      <p><strong>Period:</strong> {{ quarterInfo.range }}</p>
      <p>
        <strong>Type:</strong>
        {{ quarterInfo.isFiscal ? "Fiscal Year" : "Calendar Year" }}
      </p>
      <p v-if="quarterInfo.currentMonth">
        <strong>Current Month:</strong> {{ quarterInfo.currentMonth.name }}
      </p>
    </div>

    <div class="fiscal-year-selector">
      <label>Fiscal Year Start:</label>
      <select v-model="fiscalStart">
        <option value="January">January (Calendar)</option>
        <option value="April">April</option>
        <option value="July">July</option>
        <option value="October">October</option>
      </select>
    </div>

    <div class="metrics-grid">
      <div
        v-for="metric in businessMetrics"
        :key="metric.name"
        class="metric-card"
      >
        <h3>{{ metric.name }}</h3>
        <div class="metric-value">{{ metric.value }}</div>
        <div
          class="metric-change"
          :class="{ positive: metric.positive, negative: !metric.positive }"
        >
          {{ metric.change }}
        </div>
      </div>
    </div>

    <div class="months-breakdown">
      <h3>Monthly Breakdown</h3>
      <div class="months-grid">
        <div
          v-for="month in months"
          :key="month.number"
          class="month-card"
          :class="{ current: month.isNow }"
        >
          <h4>{{ month.name }}</h4>
          <p>
            {{
              Math.ceil(month.timespan.duration / (1000 * 60 * 60 * 24))
            }}
            days
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quarter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.quarter-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.fiscal-year-selector {
  margin-bottom: 2rem;
}

.fiscal-year-selector label {
  margin-right: 0.5rem;
  font-weight: bold;
}

.fiscal-year-selector select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.metric-card h3 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.metric-change {
  font-weight: bold;
}

.metric-change.positive {
  color: #28a745;
}

.metric-change.negative {
  color: #dc3545;
}

.months-breakdown h3 {
  margin-bottom: 1rem;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.month-card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
}

.month-card.current {
  background: #007acc;
  color: white;
  border-color: #005a8c;
}

.month-card h4 {
  margin: 0 0 0.5rem 0;
}

.month-card p {
  margin: 0;
  opacity: 0.8;
}
</style>
```

### Quarter Comparison Tool

```vue
<script setup>
import { usePickle, useQuarter } from "usetemporal";

const leftPickle = usePickle({ date: new Date() });
const rightPickle = usePickle({ date: new Date() });

const leftQuarter = useQuarter(leftPickle);
const rightQuarter = useQuarter(rightPickle);

// Set to compare current vs previous quarter
rightQuarter.past();

const comparisonData = ref([
  {
    metric: "Revenue",
    left: "$2.1M",
    right: "$2.4M",
    change: "+14.3%",
    positive: true,
  },
  {
    metric: "Customers",
    left: "1,250",
    right: "1,420",
    change: "+13.6%",
    positive: true,
  },
  {
    metric: "Conversion Rate",
    left: "3.2%",
    right: "3.8%",
    change: "+0.6%",
    positive: true,
  },
  {
    metric: "Churn Rate",
    left: "5.1%",
    right: "4.3%",
    change: "-0.8%",
    positive: true,
  },
]);
</script>

<template>
  <div class="quarter-comparison">
    <h2>Quarter-over-Quarter Analysis</h2>

    <div class="quarters-header">
      <div class="quarter-selector">
        <h3>{{ leftQuarter.name }}</h3>
        <div class="controls">
          <button @click="leftQuarter.past()">‹</button>
          <button @click="leftQuarter.future()">›</button>
        </div>
      </div>

      <div class="vs">VS</div>

      <div class="quarter-selector">
        <h3>{{ rightQuarter.name }}</h3>
        <div class="controls">
          <button @click="rightQuarter.past()">‹</button>
          <button @click="rightQuarter.future()">›</button>
        </div>
      </div>
    </div>

    <div class="comparison-table">
      <div class="comparison-header">
        <div class="metric-col">Metric</div>
        <div class="quarter-col">{{ leftQuarter.name }}</div>
        <div class="quarter-col">{{ rightQuarter.name }}</div>
        <div class="change-col">Change</div>
      </div>

      <div
        v-for="item in comparisonData"
        :key="item.metric"
        class="comparison-row"
      >
        <div class="metric-col">{{ item.metric }}</div>
        <div class="quarter-col">{{ item.left }}</div>
        <div class="quarter-col">{{ item.right }}</div>
        <div
          class="change-col"
          :class="{ positive: item.positive, negative: !item.positive }"
        >
          {{ item.change }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quarters-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
}

.quarter-selector {
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

.comparison-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  background: #f8f9fa;
  font-weight: bold;
}

.comparison-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  border-top: 1px solid #eee;
}

.comparison-header > div,
.comparison-row > div {
  padding: 1rem;
  border-right: 1px solid #eee;
  text-align: center;
}

.comparison-header > div:last-child,
.comparison-row > div:last-child {
  border-right: none;
}

.positive {
  color: #28a745;
  font-weight: bold;
}

.negative {
  color: #dc3545;
  font-weight: bold;
}
</style>
```

### Quarterly Planning Calendar

```vue
<script setup>
import { usePickle, useQuarter, useYear } from "usetemporal";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);
const currentQuarter = useQuarter(pickle);

const quarters = computed(() => pickle.divide(year, "quarter"));

const quarterlyPlans = ref([
  {
    quarter: 1,
    goals: ["Product Launch", "Team Expansion", "Marketing Campaign"],
    status: "completed",
  },
  {
    quarter: 2,
    goals: ["Feature Updates", "Customer Research", "Sales Push"],
    status: "current",
  },
  {
    quarter: 3,
    goals: [
      "Platform Optimization",
      "Partnership Development",
      "User Onboarding",
    ],
    status: "planned",
  },
  {
    quarter: 4,
    goals: ["Year-end Review", "Next Year Planning", "Holiday Campaign"],
    status: "planned",
  },
]);

const getQuarterPlan = (quarterNum) => {
  return quarterlyPlans.value.find((p) => p.quarter === quarterNum);
};

const selectQuarter = (quarter) => {
  pickle.jumpTo(quarter.raw.value);
};
</script>

<template>
  <div class="quarterly-planning">
    <div class="year-header">
      <button @click="year.past()">‹ {{ year.number - 1 }}</button>
      <h1>{{ year.name }} Quarterly Planning</h1>
      <button @click="year.future()">{{ year.number + 1 }} ›</button>
    </div>

    <div class="quarters-overview">
      <div
        v-for="quarter in quarters"
        :key="quarter.number"
        class="quarter-card"
        :class="{
          current: quarter.isNow,
          selected: quarter.number === currentQuarter.number,
        }"
        @click="selectQuarter(quarter)"
      >
        <h3>{{ quarter.name }}</h3>

        <div class="quarter-months">
          <template
            v-for="month in pickle.divide(quarter, 'month')"
            :key="month.number"
          >
            <span class="month-name">{{ month.name.split(" ")[0] }}</span>
          </template>
        </div>

        <div v-if="getQuarterPlan(quarter.number)" class="quarter-plan">
          <div
            class="status-badge"
            :class="getQuarterPlan(quarter.number).status"
          >
            {{ getQuarterPlan(quarter.number).status }}
          </div>

          <div class="goals-list">
            <div
              v-for="goal in getQuarterPlan(quarter.number).goals"
              :key="goal"
              class="goal-item"
            >
              {{ goal }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="selected-quarter-details">
      <h2>{{ currentQuarter.name }} Details</h2>

      <div v-if="getQuarterPlan(currentQuarter.number)" class="quarter-details">
        <div class="status-section">
          <h3>Status</h3>
          <div
            class="status-badge large"
            :class="getQuarterPlan(currentQuarter.number).status"
          >
            {{ getQuarterPlan(currentQuarter.number).status }}
          </div>
        </div>

        <div class="goals-section">
          <h3>Goals & Objectives</h3>
          <ul class="goals-detailed">
            <li
              v-for="goal in getQuarterPlan(currentQuarter.number).goals"
              :key="goal"
            >
              {{ goal }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.year-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.quarters-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.quarter-card {
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.quarter-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.quarter-card.current {
  border-color: #007acc;
  background: #f0f8ff;
}

.quarter-card.selected {
  background: #007acc;
  color: white;
}

.quarter-months {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.month-name {
  font-size: 0.8rem;
  background: #eee;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.quarter-card.selected .month-name {
  background: rgba(255, 255, 255, 0.2);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.current {
  background: #cce5ff;
  color: #004085;
}

.status-badge.planned {
  background: #fff3cd;
  color: #856404;
}

.status-badge.large {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.goals-list {
  margin-top: 0.5rem;
}

.goal-item {
  font-size: 0.8rem;
  padding: 0.25rem 0;
  opacity: 0.8;
}

.selected-quarter-details {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
}

.quarter-details {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
}

.goals-detailed {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.goals-detailed li {
  margin-bottom: 0.5rem;
}
</style>
```

## Related Composables

- **[usePickle](/composables/use-pickle)** - Creates and manages quarters
- **[useYear](/composables/use-year)** - Parent time unit for calendar quarters
- **[useMonth](/composables/use-month)** - Divide quarters into months
