# Custom Time Units

**Single Responsibility:** Extending the time unit system for business logic and specialized use cases.

## Overview

Learn how to create custom time units that integrate seamlessly with useTemporal's hierarchical architecture, perfect for business quarters, fiscal years, work weeks, and domain-specific time requirements.

## Business Quarters

```vue
<script setup>
import { usePickle } from "usetemporal";

const pickle = usePickle({ date: new Date() });

// Custom business quarter composable
const useQuarter = (pickle, options = {}) => {
  const { fiscalYearStart = "January" } = options;

  const fiscalStartMonth = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  }[fiscalYearStart];

  const raw = computed(() => pickle.browsing.value);

  const currentQuarter = computed(() => {
    const date = raw.value;
    const month = date.getMonth();
    const adjustedMonth = (month - fiscalStartMonth + 12) % 12;
    return Math.floor(adjustedMonth / 3) + 1;
  });

  const quarterStart = computed(() => {
    const date = raw.value;
    const quarter = currentQuarter.value;
    const startMonth = (fiscalStartMonth + (quarter - 1) * 3) % 12;
    const year = date.getFullYear();

    return new Date(year, startMonth, 1);
  });

  const quarterEnd = computed(() => {
    const start = quarterStart.value;
    const endMonth = (start.getMonth() + 3) % 12;
    const endYear =
      endMonth < start.getMonth()
        ? start.getFullYear() + 1
        : start.getFullYear();

    return new Date(endYear, endMonth, 0); // Last day of previous month
  });

  const timespan = computed(() => ({
    start: quarterStart.value,
    end: quarterEnd.value,
    duration: quarterEnd.value - quarterStart.value,
  }));

  const name = computed(
    () => `Q${currentQuarter.value} ${quarterStart.value.getFullYear()}`
  );

  const number = computed(() => currentQuarter.value);

  const isNow = computed(() => {
    const now = new Date();
    return now >= quarterStart.value && now <= quarterEnd.value;
  });

  const future = () => {
    const nextQuarter = new Date(quarterEnd.value);
    nextQuarter.setDate(nextQuarter.getDate() + 1);
    pickle.browsing.value = nextQuarter;
  };

  const past = () => {
    const prevQuarter = new Date(quarterStart.value);
    prevQuarter.setMonth(prevQuarter.getMonth() - 1);
    pickle.browsing.value = prevQuarter;
  };

  return {
    raw,
    timespan,
    name,
    number,
    isNow,
    future,
    past,
  };
};

// Usage
const businessQuarter = useQuarter(pickle, { fiscalYearStart: "April" });
</script>

<template>
  <div class="quarter-display">
    <button @click="businessQuarter.past()">← Previous Quarter</button>
    <h2>{{ businessQuarter.name }}</h2>
    <button @click="businessQuarter.future()">Next Quarter →</button>

    <p>Quarter {{ businessQuarter.number }}</p>
    <p :class="{ current: businessQuarter.isNow }">
      {{ businessQuarter.isNow ? "Current Quarter" : "Historical Quarter" }}
    </p>
  </div>
</template>
```

## Fiscal Years

```vue
<script setup>
import { usePickle } from "usetemporal";

const pickle = usePickle({ date: new Date() });

const useFiscalYear = (pickle, options = {}) => {
  const { fiscalYearStart = "April" } = options;

  const fiscalStartMonth = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  }[fiscalYearStart];

  const raw = computed(() => pickle.browsing.value);

  const fiscalYear = computed(() => {
    const date = raw.value;
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    // If we're before the fiscal year start month, we're in the previous fiscal year
    return currentMonth < fiscalStartMonth ? currentYear : currentYear + 1;
  });

  const fiscalYearStart = computed(() => {
    const year = fiscalYear.value;
    return new Date(year - 1, fiscalStartMonth, 1);
  });

  const fiscalYearEnd = computed(() => {
    const year = fiscalYear.value;
    return new Date(year, fiscalStartMonth, 0); // Last day of previous month
  });

  const timespan = computed(() => ({
    start: fiscalYearStart.value,
    end: fiscalYearEnd.value,
    duration: fiscalYearEnd.value - fiscalYearStart.value,
  }));

  const name = computed(() => `FY ${fiscalYear.value}`);
  const number = computed(() => fiscalYear.value);

  const isNow = computed(() => {
    const now = new Date();
    return now >= fiscalYearStart.value && now <= fiscalYearEnd.value;
  });

  const future = () => {
    const nextFiscalYear = new Date(fiscalYearEnd.value);
    nextFiscalYear.setDate(nextFiscalYear.getDate() + 1);
    pickle.browsing.value = nextFiscalYear;
  };

  const past = () => {
    const prevFiscalYear = new Date(fiscalYearStart.value);
    prevFiscalYear.setFullYear(prevFiscalYear.getFullYear() - 1);
    pickle.browsing.value = prevFiscalYear;
  };

  return {
    raw,
    timespan,
    name,
    number,
    isNow,
    future,
    past,
  };
};

const fiscalYear = useFiscalYear(pickle, { fiscalYearStart: "April" });
</script>

<template>
  <div class="fiscal-year-display">
    <h2>{{ fiscalYear.name }}</h2>
    <p>
      {{ fiscalYear.timespan.start.toLocaleDateString() }} -
      {{ fiscalYear.timespan.end.toLocaleDateString() }}
    </p>

    <div class="nav-controls">
      <button @click="fiscalYear.past()">Previous FY</button>
      <button @click="fiscalYear.future()">Next FY</button>
    </div>
  </div>
</template>
```

## Work Weeks (Monday-Friday)

```vue
<script setup>
import { usePickle } from "usetemporal";

const pickle = usePickle({ date: new Date() });

const useWorkWeek = (pickle) => {
  const raw = computed(() => pickle.browsing.value);

  const weekStart = computed(() => {
    const date = new Date(raw.value);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = day === 0 ? -6 : 1 - day; // Adjust to Monday
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const weekEnd = computed(() => {
    const date = new Date(weekStart.value);
    date.setDate(date.getDate() + 4); // Friday
    date.setHours(23, 59, 59, 999);
    return date;
  });

  const workDays = computed(() => {
    const days = [];
    const start = new Date(weekStart.value);

    for (let i = 0; i < 5; i++) {
      // Monday to Friday
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }

    return days;
  });

  const timespan = computed(() => ({
    start: weekStart.value,
    end: weekEnd.value,
    duration: weekEnd.value - weekStart.value,
  }));

  const name = computed(() => {
    const start = weekStart.value;
    const end = weekEnd.value;
    return `Work Week ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  });

  const number = computed(() => {
    // ISO week number
    const date = new Date(weekStart.value);
    const yearStart = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(
      ((date - yearStart) / 86400000 + yearStart.getDay() + 1) / 7
    );
  });

  const isNow = computed(() => {
    const now = new Date();
    return now >= weekStart.value && now <= weekEnd.value;
  });

  const future = () => {
    const nextWeek = new Date(weekStart.value);
    nextWeek.setDate(nextWeek.getDate() + 7);
    pickle.browsing.value = nextWeek;
  };

  const past = () => {
    const prevWeek = new Date(weekStart.value);
    prevWeek.setDate(prevWeek.getDate() - 7);
    pickle.browsing.value = prevWeek;
  };

  return {
    raw,
    timespan,
    name,
    number,
    isNow,
    future,
    past,
    workDays,
  };
};

const workWeek = useWorkWeek(pickle);
</script>

<template>
  <div class="work-week-display">
    <h2>{{ workWeek.name }}</h2>
    <p>Week {{ workWeek.number }}</p>

    <div class="work-days">
      <div
        v-for="(day, index) in workWeek.workDays"
        :key="day.getTime()"
        class="work-day"
      >
        <strong>{{ ["Mon", "Tue", "Wed", "Thu", "Fri"][index] }}</strong>
        <span>{{ day.getDate() }}</span>
      </div>
    </div>

    <div class="nav-controls">
      <button @click="workWeek.past()">← Previous Week</button>
      <button @click="workWeek.future()">Next Week →</button>
    </div>
  </div>
</template>
```

## Custom Shift System

```vue
<script setup>
import { usePickle } from "usetemporal";

const pickle = usePickle({ date: new Date() });

const useShift = (pickle, shiftConfig) => {
  const {
    shiftStart = 9, // 9 AM
    shiftEnd = 17, // 5 PM
    shiftName = "Day Shift",
  } = shiftConfig;

  const raw = computed(() => pickle.browsing.value);

  const shiftStartTime = computed(() => {
    const date = new Date(raw.value);
    date.setHours(shiftStart, 0, 0, 0);
    return date;
  });

  const shiftEndTime = computed(() => {
    const date = new Date(raw.value);
    date.setHours(shiftEnd, 0, 0, 0);
    return date;
  });

  const timespan = computed(() => ({
    start: shiftStartTime.value,
    end: shiftEndTime.value,
    duration: shiftEndTime.value - shiftStartTime.value,
  }));

  const name = computed(() => {
    const date = shiftStartTime.value;
    return `${shiftName} - ${date.toLocaleDateString()}`;
  });

  const number = computed(() => {
    return Math.floor((shiftStart + shiftEnd) / 2); // Average hour
  });

  const isNow = computed(() => {
    const now = new Date();
    return now >= shiftStartTime.value && now <= shiftEndTime.value;
  });

  const future = () => {
    const nextShift = new Date(raw.value);
    nextShift.setDate(nextShift.getDate() + 1);
    pickle.browsing.value = nextShift;
  };

  const past = () => {
    const prevShift = new Date(raw.value);
    prevShift.setDate(prevShift.getDate() - 1);
    pickle.browsing.value = prevShift;
  };

  return {
    raw,
    timespan,
    name,
    number,
    isNow,
    future,
    past,
  };
};

// Define different shifts
const dayShift = useShift(pickle, {
  shiftStart: 9,
  shiftEnd: 17,
  shiftName: "Day Shift",
});

const nightShift = useShift(pickle, {
  shiftStart: 22,
  shiftEnd: 6,
  shiftName: "Night Shift",
});

const currentShift = ref(dayShift);
</script>

<template>
  <div class="shift-scheduler">
    <div class="shift-selector">
      <button
        @click="currentShift = dayShift"
        :class="{ active: currentShift === dayShift }"
      >
        Day Shift
      </button>
      <button
        @click="currentShift = nightShift"
        :class="{ active: currentShift === nightShift }"
      >
        Night Shift
      </button>
    </div>

    <div class="shift-info">
      <h3>{{ currentShift.name }}</h3>
      <p :class="{ active: currentShift.isNow }">
        {{ currentShift.isNow ? "Currently Active" : "Inactive" }}
      </p>

      <div class="shift-times">
        <span>{{ currentShift.timespan.start.toLocaleTimeString() }}</span>
        <span>-</span>
        <span>{{ currentShift.timespan.end.toLocaleTimeString() }}</span>
      </div>
    </div>

    <div class="nav-controls">
      <button @click="currentShift.past()">← Previous Day</button>
      <button @click="currentShift.future()">Next Day →</button>
    </div>
  </div>
</template>
```

## Integration with divide() Pattern

```vue
<script setup>
import { usePickle } from "usetemporal";

const pickle = usePickle({ date: new Date() });

// Custom time units can be used with divide() too
const businessYear = useFiscalYear(pickle, { fiscalYearStart: "April" });

// Create quarters within the fiscal year
const quarters = computed(() => {
  const quarters = [];
  const startDate = businessYear.timespan.start;

  for (let i = 0; i < 4; i++) {
    const quarterStart = new Date(startDate);
    quarterStart.setMonth(quarterStart.getMonth() + i * 3);

    const quarterPickle = usePickle({ date: quarterStart });
    quarters.push(useQuarter(quarterPickle, { fiscalYearStart: "April" }));
  }

  return quarters;
});

// Or integrate with existing divide pattern
const extendedPickle = {
  ...pickle,
  divide: (timeUnit, targetUnit) => {
    if (targetUnit === "quarter") {
      return quarters.value;
    }
    return pickle.divide(timeUnit, targetUnit);
  },
};
</script>

<template>
  <div class="fiscal-breakdown">
    <h2>{{ businessYear.name }}</h2>

    <div class="quarters-grid">
      <div
        v-for="quarter in quarters"
        :key="quarter.name"
        class="quarter-card"
        :class="{ current: quarter.isNow }"
      >
        <h4>{{ quarter.name }}</h4>
        <p>
          {{ quarter.timespan.start.toLocaleDateString() }} -
          {{ quarter.timespan.end.toLocaleDateString() }}
        </p>
      </div>
    </div>
  </div>
</template>
```

## Key Benefits

- **Consistent Interface**: Custom units follow the same TimeUnit interface
- **Seamless Integration**: Works with existing useTemporal patterns
- **Business Logic**: Encode domain-specific time rules
- **Extensible**: Easy to create new time units for any use case
- **Type Safety**: Full TypeScript support with proper interfaces

## Best Practices

- Always implement the complete TimeUnit interface
- Use computed properties for reactive behavior
- Integrate with the existing pickle instance
- Handle edge cases (leap years, month boundaries, etc.)
- Document custom time unit behavior clearly
- Consider timezone implications for business units

<style scoped>
.quarter-display, .fiscal-year-display, .work-week-display, .shift-scheduler, .fiscal-breakdown {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.nav-controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.work-days {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.work-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  min-width: 50px;
}

.shift-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.shift-selector button.active {
  background: var(--vp-c-brand);
  color: white;
}

.shift-info {
  text-align: center;
  margin: 1rem 0;
}

.shift-times {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: monospace;
}

.quarters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.quarter-card {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}

.quarter-card.current {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-bg-soft);
}

.current {
  color: var(--vp-c-brand);
  font-weight: 600;
}

.active {
  color: var(--vp-c-brand);
  font-weight: 600;
}
</style>
