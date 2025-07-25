# Zoom Patterns in useTemporal

While useTemporal doesn't include dedicated zoom operations, you can easily achieve zoom functionality by composing the fundamental operations. This guide shows common patterns for zooming between time units.

## Basic Zoom Patterns

### Zooming In (Year → Month → Day)

```typescript
import { createTemporal, usePeriod, divide, contains } from '@usetemporal/core';

const temporal = createTemporal({ adapter, date: new Date() });

// Start with a year
const year = usePeriod(temporal, 'year');

// Zoom in to months
const months = divide(temporal, year.value, 'month');
// Find the month containing the current browsing date
const currentMonth = months.find(m => contains(m, temporal.browsing.value.date)) || months[0];

// Zoom in further to days
const days = divide(temporal, currentMonth, 'day');
const currentDay = days.find(d => contains(d, temporal.browsing.value.date)) || days[0];
```

### Zooming Out (Day → Month → Year)

```typescript
import { createPeriod, toPeriod } from '@usetemporal/core';

// Start with a day
const day = usePeriod(temporal, 'day');

// Zoom out to month
const month = createPeriod(temporal, day.value.date, 'month');

// Zoom out to year
const year = toPeriod(temporal, month.date, 'year');
```

## Calendar View Navigation

A common use case is navigating between calendar views (year → month → week → day):

```typescript
import { ref } from 'vue';
import type { Unit, Period, Temporal } from '@usetemporal/core';

function useCalendarNavigation(temporal: Temporal) {
  const currentView = ref<Unit>('month');
  const currentPeriod = ref<Period>(createPeriod(temporal, new Date(), 'month'));
  
  const viewHierarchy: Unit[] = ['year', 'month', 'week', 'day'];
  
  function canZoomIn() {
    const index = viewHierarchy.indexOf(currentView.value);
    return index < viewHierarchy.length - 1;
  }
  
  function canZoomOut() {
    const index = viewHierarchy.indexOf(currentView.value);
    return index > 0;
  }
  
  function zoomIn() {
    if (!canZoomIn()) return;
    
    const currentIndex = viewHierarchy.indexOf(currentView.value);
    const nextUnit = viewHierarchy[currentIndex + 1];
    
    // Get subdivisions
    const subPeriods = divide(temporal, currentPeriod.value, nextUnit);
    
    // Find the period containing the reference date
    const targetPeriod = subPeriods.find(p => 
      contains(p, currentPeriod.value.date)
    ) || subPeriods[0];
    
    currentView.value = nextUnit;
    currentPeriod.value = targetPeriod;
  }
  
  function zoomOut() {
    if (!canZoomOut()) return;
    
    const currentIndex = viewHierarchy.indexOf(currentView.value);
    const prevUnit = viewHierarchy[currentIndex - 1];
    
    // Create parent period
    const parentPeriod = createPeriod(temporal, currentPeriod.value.date, prevUnit);
    
    currentView.value = prevUnit;
    currentPeriod.value = parentPeriod;
  }
  
  function zoomTo(unit: Unit) {
    if (!viewHierarchy.includes(unit)) return;
    
    currentView.value = unit;
    currentPeriod.value = createPeriod(temporal, currentPeriod.value.date, unit);
  }
  
  return {
    currentView,
    currentPeriod,
    canZoomIn,
    canZoomOut,
    zoomIn,
    zoomOut,
    zoomTo
  };
}
```

## React Example

```typescript
import { useState, useCallback } from 'react';
import { divide, contains, createPeriod } from '@usetemporal/core';

function useZoomableCalendar(temporal: Temporal) {
  const [view, setView] = useState<Unit>('month');
  const [period, setPeriod] = useState(() => 
    createPeriod(temporal, new Date(), 'month')
  );
  
  const handleZoomIn = useCallback(() => {
    const units: Unit[] = ['year', 'month', 'week', 'day'];
    const currentIndex = units.indexOf(view);
    
    if (currentIndex < units.length - 1) {
      const nextUnit = units[currentIndex + 1];
      const subPeriods = divide(temporal, period, nextUnit);
      const targetPeriod = subPeriods.find(p => 
        contains(p, period.date)
      ) || subPeriods[0];
      
      setView(nextUnit);
      setPeriod(targetPeriod);
    }
  }, [temporal, period, view]);
  
  const handleZoomOut = useCallback(() => {
    const units: Unit[] = ['year', 'month', 'week', 'day'];
    const currentIndex = units.indexOf(view);
    
    if (currentIndex > 0) {
      const prevUnit = units[currentIndex - 1];
      const parentPeriod = createPeriod(temporal, period.date, prevUnit);
      
      setView(prevUnit);
      setPeriod(parentPeriod);
    }
  }, [temporal, period, view]);
  
  return { view, period, handleZoomIn, handleZoomOut };
}
```

## Performance Considerations

When implementing zoom patterns, consider:

1. **Memoization**: Cache `divide()` results when zooming in repeatedly
2. **Lazy Loading**: Only calculate periods when needed
3. **Virtualization**: For large date ranges, virtualize the period list

```typescript
import { computed } from 'vue';

function useOptimizedZoom(temporal: Temporal, period: Ref<Period>) {
  // Memoize subdivisions
  const monthsInYear = computed(() => 
    period.value.type === 'year' 
      ? divide(temporal, period.value, 'month')
      : []
  );
  
  const daysInMonth = computed(() =>
    period.value.type === 'month'
      ? divide(temporal, period.value, 'day')
      : []
  );
  
  // Efficient zoom in
  function zoomInToMonth(targetDate: Date) {
    const month = monthsInYear.value.find(m => contains(m, targetDate));
    return month || monthsInYear.value[0];
  }
  
  function zoomInToDay(targetDate: Date) {
    const day = daysInMonth.value.find(d => contains(d, targetDate));
    return day || daysInMonth.value[0];
  }
  
  return { monthsInYear, daysInMonth, zoomInToMonth, zoomInToDay };
}
```

## Summary

The removal of zoom operations encourages you to think about what you actually need:
- Use `divide()` when you need to see subdivisions
- Use `createPeriod()` or `toPeriod()` when changing to a different unit
- Compose these operations to create your perfect zoom behavior

This approach gives you more control and keeps the library focused on fundamental operations.