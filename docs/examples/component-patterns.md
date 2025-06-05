# Component Patterns

**Single Responsibility:** Reusable component architectures using useTemporal's consistent TimeUnit interface.

## Overview

Because all time units in useTemporal share the same interface, you can build powerful, generic components that work seamlessly across any time scale. This page demonstrates reusable patterns and component architectures.

## Generic Time Navigator

The most fundamental pattern - a navigator that works with ANY time unit:

```vue
<!-- TimeNavigator.vue -->
<script setup lang="ts">
import type { TimeUnit } from "usetemporal";

interface Props {
  timeUnit: TimeUnit;
  label?: string;
  showCurrent?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  showCurrent: true,
});
</script>

<template>
  <div class="time-navigator">
    <button
      @click="timeUnit.past()"
      :disabled="!timeUnit.hasPast"
      class="nav-button prev"
    >
      ‹ Previous
    </button>

    <div class="time-display">
      <span v-if="label" class="label">{{ label }}</span>
      <span
        class="time-name"
        :class="{ current: showCurrent && timeUnit.isNow }"
      >
        {{ timeUnit.name }}
      </span>
    </div>

    <button
      @click="timeUnit.future()"
      :disabled="!timeUnit.hasFuture"
      class="nav-button next"
    >
      Next ›
    </button>
  </div>
</template>

<!-- Usage - Works with ANY time unit! -->
<script setup>
import { usePickle, useYear, useMonth, useDay } from "usetemporal";
import TimeNavigator from "./TimeNavigator.vue";

const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);
</script>

<template>
  <div>
    <!-- Same component, different scales -->
    <TimeNavigator :time-unit="year" label="Year" />
    <TimeNavigator :time-unit="month" label="Month" />
    <TimeNavigator :time-unit="day" label="Day" />
  </div>
</template>
```

## Universal Time Display

A flexible component for displaying any time unit with consistent formatting:

```vue
<!-- TimeDisplay.vue -->
<script setup lang="ts">
import type { TimeUnit } from "usetemporal";

interface Props {
  timeUnit: TimeUnit;
  format?: "short" | "long" | "numeric";
  showNumber?: boolean;
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  format: "long",
  showNumber: false,
  clickable: false,
});

const emit = defineEmits<{
  click: [timeUnit: TimeUnit];
}>();

const handleClick = () => {
  if (props.clickable) {
    emit("click", props.timeUnit);
  }
};

const displayText = computed(() => {
  switch (props.format) {
    case "short":
      return props.timeUnit.name.substring(0, 3);
    case "numeric":
      return props.timeUnit.number.toString();
    case "long":
    default:
      return props.timeUnit.name;
  }
});
</script>

<template>
  <div
    class="time-display"
    :class="{
      current: timeUnit.isNow,
      clickable: clickable,
      'with-number': showNumber,
    }"
    @click="handleClick"
  >
    <span v-if="showNumber" class="time-number">{{ timeUnit.number }}</span>
    <span class="time-text">{{ displayText }}</span>
  </div>
</template>

<!-- Usage Examples -->
<template>
  <div class="display-examples">
    <!-- Different formats -->
    <TimeDisplay :time-unit="month" format="long" />
    <TimeDisplay :time-unit="month" format="short" />
    <TimeDisplay :time-unit="month" format="numeric" :show-number="true" />

    <!-- Clickable version -->
    <TimeDisplay :time-unit="day" :clickable="true" @click="handleDayClick" />
  </div>
</template>
```

## Time Hierarchy Grid

A component that displays multiple time scales in a hierarchical grid:

```vue
<!-- TimeHierarchy.vue -->
<script setup lang="ts">
import type { TimeUnit } from "usetemporal";

interface HierarchyLevel {
  timeUnit: TimeUnit;
  label: string;
  children?: TimeUnit[];
}

interface Props {
  levels: HierarchyLevel[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [timeUnit: TimeUnit, level: number];
}>();

const selectTimeUnit = (timeUnit: TimeUnit, level: number) => {
  emit("select", timeUnit, level);
};
</script>

<template>
  <div class="time-hierarchy">
    <div
      v-for="(level, index) in levels"
      :key="level.label"
      class="hierarchy-level"
    >
      <h3 class="level-title">{{ level.label }}</h3>

      <!-- Current time unit -->
      <TimeDisplay
        :time-unit="level.timeUnit"
        :clickable="true"
        class="current-unit"
        @click="selectTimeUnit(level.timeUnit, index)"
      />

      <!-- Child units if available -->
      <div v-if="level.children" class="child-units">
        <TimeDisplay
          v-for="child in level.children"
          :key="child.raw.value.getTime()"
          :time-unit="child"
          :clickable="true"
          format="short"
          @click="selectTimeUnit(child, index + 1)"
        />
      </div>
    </div>
  </div>
</template>

<!-- Usage -->
<script setup>
const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);
const month = useMonth(pickle);

const months = computed(() => pickle.divide(year, "month"));
const days = computed(() => pickle.divide(month, "day"));

const hierarchyLevels = computed(() => [
  {
    timeUnit: year,
    label: "Year",
    children: months.value,
  },
  {
    timeUnit: month,
    label: "Month",
    children: days.value,
  },
]);

const handleSelection = (timeUnit, level) => {
  pickle.browsing.value = timeUnit.raw.value;
  console.log(`Selected ${timeUnit.name} at level ${level}`);
};
</script>

<template>
  <TimeHierarchy :levels="hierarchyLevels" @select="handleSelection" />
</template>
```

## Scale-Aware Calendar Grid

A flexible calendar component that adapts its display based on the time scale:

```vue
<!-- AdaptiveCalendar.vue -->
<script setup lang="ts">
import type { TimeUnit } from "usetemporal";

interface Props {
  parentUnit: TimeUnit;
  childScale: string;
  columns?: number;
  selectable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  columns: 7,
  selectable: false,
});

const emit = defineEmits<{
  select: [timeUnit: TimeUnit];
}>();

const childUnits = computed(() => {
  return pickle.divide(props.parentUnit, props.childScale);
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
}));

const selectUnit = (unit: TimeUnit) => {
  if (props.selectable) {
    emit("select", unit);
  }
};
</script>

<template>
  <div class="adaptive-calendar">
    <div class="calendar-header">
      <TimeNavigator :time-unit="parentUnit" />
    </div>

    <div class="calendar-grid" :style="gridStyle">
      <div
        v-for="unit in childUnits"
        :key="unit.raw.value.getTime()"
        class="calendar-cell"
        :class="{
          current: unit.isNow,
          selectable: selectable,
        }"
        @click="selectUnit(unit)"
      >
        <TimeDisplay :time-unit="unit" format="numeric" :show-number="true" />
      </div>
    </div>
  </div>
</template>

<!-- Usage Examples -->
<template>
  <div class="calendar-examples">
    <!-- Month view showing days -->
    <AdaptiveCalendar
      :parent-unit="month"
      child-scale="day"
      :columns="7"
      :selectable="true"
      @select="handleDaySelect"
    />

    <!-- Year view showing months -->
    <AdaptiveCalendar
      :parent-unit="year"
      child-scale="month"
      :columns="4"
      :selectable="true"
      @select="handleMonthSelect"
    />

    <!-- Week view showing hours -->
    <AdaptiveCalendar
      :parent-unit="week"
      child-scale="hour"
      :columns="24"
      @select="handleHourSelect"
    />
  </div>
</template>
```

## Time Range Selector

A component for selecting time ranges using consistent time unit interfaces:

```vue
<!-- TimeRangeSelector.vue -->
<script setup lang="ts">
import type { TimeUnit } from "usetemporal";

interface Props {
  startUnit: TimeUnit;
  endUnit: TimeUnit;
  scale: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  rangeChange: [start: TimeUnit, end: TimeUnit];
}>();

const rangeUnits = computed(() => {
  const units = [];
  let current = props.startUnit;

  while (current.raw.value <= props.endUnit.raw.value) {
    units.push(current);
    current = current.future();
  }

  return units;
});

const selectRange = (start: TimeUnit, end: TimeUnit) => {
  emit("rangeChange", start, end);
};
</script>

<template>
  <div class="time-range-selector">
    <div class="range-controls">
      <div class="range-bound">
        <label>Start:</label>
        <TimeNavigator :time-unit="startUnit" />
      </div>

      <div class="range-bound">
        <label>End:</label>
        <TimeNavigator :time-unit="endUnit" />
      </div>
    </div>

    <div class="range-preview">
      <h4>Selected Range:</h4>
      <div class="range-units">
        <TimeDisplay
          v-for="unit in rangeUnits"
          :key="unit.raw.value.getTime()"
          :time-unit="unit"
          class="range-unit"
        />
      </div>
    </div>
  </div>
</template>
```

## Event Overlay System

A pattern for overlaying events on time-based interfaces:

```vue
<!-- EventOverlay.vue -->
<script setup lang="ts">
import type { TimeUnit } from "usetemporal";

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
}

interface Props {
  timeUnit: TimeUnit;
  events: Event[];
}

const props = defineProps<Props>();

const overlappingEvents = computed(() => {
  return props.events.filter((event) => {
    const unitStart = props.timeUnit.timespan.start;
    const unitEnd = props.timeUnit.timespan.end;

    return event.start <= unitEnd && event.end >= unitStart;
  });
});

const hasEvents = computed(() => overlappingEvents.value.length > 0);
</script>

<template>
  <div class="event-overlay" :class="{ 'has-events': hasEvents }">
    <!-- Base time display -->
    <TimeDisplay :time-unit="timeUnit" />

    <!-- Event indicators -->
    <div v-if="hasEvents" class="event-indicators">
      <div
        v-for="event in overlappingEvents"
        :key="event.id"
        class="event-indicator"
        :style="{ backgroundColor: event.color || '#007acc' }"
        :title="event.title"
      >
        {{ event.title }}
      </div>
    </div>
  </div>
</template>

<!-- Usage -->
<script setup>
const events = ref([
  {
    id: "1",
    title: "Team Meeting",
    start: new Date(2024, 0, 15, 10, 0),
    end: new Date(2024, 0, 15, 11, 0),
    color: "#ff4444",
  },
  {
    id: "2",
    title: "Project Deadline",
    start: new Date(2024, 0, 20),
    end: new Date(2024, 0, 20),
    color: "#44ff44",
  },
]);

const days = computed(() => pickle.divide(month, "day"));
</script>

<template>
  <div class="calendar-with-events">
    <EventOverlay
      v-for="day in days"
      :key="day.raw.value.getTime()"
      :time-unit="day"
      :events="events"
    />
  </div>
</template>
```

## Composable Pattern Factory

A meta-pattern for creating reusable time unit combinations:

```typescript
// useTimePatterns.ts
import type { PickleCore, TimeUnit } from "usetemporal";

export const useTimePatterns = (pickle: PickleCore) => {
  // Calendar pattern (year > month > day)
  const useCalendarPattern = () => {
    const year = useYear(pickle);
    const month = useMonth(pickle);
    const day = useDay(pickle);

    return {
      year,
      month,
      day,
      months: computed(() => pickle.divide(year, "month")),
      days: computed(() => pickle.divide(month, "day")),
    };
  };

  // Business pattern (fiscal year > quarter > month)
  const useBusinessPattern = (fiscalStart = "April") => {
    const fiscalYear = useFiscalYear(pickle, { fiscalYearStart: fiscalStart });
    const quarter = useQuarter(pickle, { fiscalYearStart: fiscalStart });
    const month = useMonth(pickle);

    return {
      fiscalYear,
      quarter,
      month,
      quarters: computed(() => pickle.divide(fiscalYear, "quarter")),
      months: computed(() => pickle.divide(quarter, "month")),
    };
  };

  // Schedule pattern (week > day > hour)
  const useSchedulePattern = () => {
    const week = useWeek(pickle);
    const day = useDay(pickle);
    const hour = useHour(pickle);

    return {
      week,
      day,
      hour,
      days: computed(() => pickle.divide(week, "day")),
      hours: computed(() => pickle.divide(day, "hour")),
    };
  };

  return {
    useCalendarPattern,
    useBusinessPattern,
    useSchedulePattern,
  };
};
```

## Key Benefits

- **Universal Compatibility**: Components work with any time unit
- **Type Safety**: Full TypeScript support with proper interfaces
- **Consistent Behavior**: Same interaction patterns across all scales
- **Reusable Logic**: Write once, use everywhere
- **Scalable Architecture**: Easy to extend and maintain

## Best Practices

- **Accept TimeUnit interface**: Always use the generic `TimeUnit` type in props
- **Emit events consistently**: Use standard event patterns for time selection
- **Handle edge cases**: Check for `hasPast`/`hasFuture` for navigation limits
- **Provide visual feedback**: Show current/active states clearly
- **Keep components focused**: Each component should have a single responsibility
- **Use computed properties**: Leverage reactivity for derived time calculations

<style scoped>
.time-navigator {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
}

.nav-button {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 4px;
  cursor: pointer;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.time-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  cursor: pointer;
}

.time-display.current {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-bg-soft);
}

.time-display.clickable:hover {
  background: var(--vp-c-bg-soft);
}

.time-hierarchy {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hierarchy-level {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
}

.level-title {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.child-units {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.adaptive-calendar {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.calendar-header {
  background: var(--vp-c-bg-soft);
  padding: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.calendar-grid {
  display: grid;
  gap: 1px;
  background: var(--vp-c-divider);
}

.calendar-cell {
  background: var(--vp-c-bg);
  padding: 0.5rem;
  text-align: center;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-cell.current {
  background: var(--vp-c-brand);
  color: white;
}

.calendar-cell.selectable {
  cursor: pointer;
}

.calendar-cell.selectable:hover {
  background: var(--vp-c-bg-soft);
}

.time-range-selector {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
}

.range-controls {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.range-bound {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.range-units {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.event-overlay {
  position: relative;
}

.event-indicators {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-indicator {
  font-size: 0.75rem;
  padding: 2px 4px;
  border-radius: 2px;
  color: white;
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
