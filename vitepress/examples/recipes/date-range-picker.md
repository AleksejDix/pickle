# Date Range Picker

Patterns for implementing date range selection with useTemporal.

## Basic Date Range Selection

```typescript
import { createTemporal, contains, isSame, createCustomPeriod } from 'usetemporal'

interface DateRange {
  start: Date | null
  end: Date | null
}

class DateRangePicker {
  private range: DateRange = { start: null, end: null }
  private selecting = false
  
  constructor(private temporal: Temporal) {}
  
  // Handle date selection
  selectDate(date: Date): DateRange | null {
    if (!this.range.start || (this.range.start && this.range.end)) {
      // Start new selection
      this.range = { start: date, end: null }
      this.selecting = true
    } else if (this.selecting) {
      // Complete selection
      if (date < this.range.start) {
        // Swap if end is before start
        this.range = { start: date, end: this.range.start }
      } else {
        this.range.end = date
      }
      this.selecting = false
      
      return this.getSelectedPeriod()
    }
    
    return null
  }
  
  // Get selected period
  getSelectedPeriod(): Period | null {
    if (this.range.start && this.range.end) {
      return createCustomPeriod(this.range.start, this.range.end)
    }
    return null
  }
  
  // Check if date is in selection
  isInRange(date: Date): boolean {
    if (!this.range.start) return false
    
    if (this.range.end) {
      const period = this.getSelectedPeriod()!
      return contains(period, date)
    } else if (this.selecting) {
      // Preview range while selecting
      const start = this.range.start
      const end = date
      return date >= Math.min(start.getTime(), end.getTime()) && 
             date <= Math.max(start.getTime(), end.getTime())
    }
    
    return isSame(
      this.temporal,
      toPeriod(this.temporal, date, 'day'),
      toPeriod(this.temporal, this.range.start, 'day'),
      'day'
    )
  }
  
  // Clear selection
  clear(): void {
    this.range = { start: null, end: null }
    this.selecting = false
  }
}
```

## Vue Date Range Component

```vue
<template>
  <div class="date-range-picker">
    <div class="range-inputs">
      <input
        type="text"
        :value="formattedStart"
        placeholder="Start date"
        readonly
        @click="showPicker = true"
      />
      <span class="separator">→</span>
      <input
        type="text"
        :value="formattedEnd"
        placeholder="End date"
        readonly
        @click="showPicker = true"
      />
      <button v-if="hasSelection" @click="clearSelection" class="clear-btn">
        ✕
      </button>
    </div>
    
    <div v-if="showPicker" class="calendar-popup">
      <div class="preset-ranges">
        <button
          v-for="preset in presets"
          :key="preset.label"
          @click="selectPreset(preset)"
        >
          {{ preset.label }}
        </button>
      </div>
      
      <div class="calendars">
        <MonthCalendar
          :temporal="temporal"
          :month="currentMonth"
          :selectedRange="selectedRange"
          :highlightDate="hoverDate"
          @date-click="handleDateClick"
          @date-hover="handleDateHover"
        />
        <MonthCalendar
          :temporal="temporal"
          :month="nextMonth"
          :selectedRange="selectedRange"
          :highlightDate="hoverDate"
          @date-click="handleDateClick"
          @date-hover="handleDateHover"
        />
      </div>
      
      <div class="actions">
        <button @click="cancel">Cancel</button>
        <button @click="apply" :disabled="!isComplete">Apply</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { createTemporal, toPeriod, next, previous, createCustomPeriod } from 'usetemporal'

const props = defineProps({
  modelValue: Object // { start: Date, end: Date }
})

const emit = defineEmits(['update:modelValue'])

const temporal = createTemporal({ date: new Date() })
const picker = ref(new DateRangePicker(temporal))
const showPicker = ref(false)
const hoverDate = ref(null)

const currentMonth = computed(() => 
  usePeriod(temporal, 'month').value
)

const nextMonth = computed(() => 
  next(temporal, currentMonth.value)
)

const selectedRange = computed(() => ({
  start: picker.value.range.start,
  end: picker.value.range.end
}))

const hasSelection = computed(() => 
  selectedRange.value.start && selectedRange.value.end
)

const isComplete = computed(() => 
  hasSelection.value
)

const formattedStart = computed(() => 
  selectedRange.value.start?.toLocaleDateString() || ''
)

const formattedEnd = computed(() => 
  selectedRange.value.end?.toLocaleDateString() || ''
)

// Preset ranges
const presets = [
  {
    label: 'Today',
    getRange: () => {
      const today = new Date()
      return { start: today, end: today }
    }
  },
  {
    label: 'This Week',
    getRange: () => {
      const week = toPeriod(temporal, new Date(), 'week')
      return { start: week.start, end: week.end }
    }
  },
  {
    label: 'This Month',
    getRange: () => {
      const month = toPeriod(temporal, new Date(), 'month')
      return { start: month.start, end: month.end }
    }
  },
  {
    label: 'Last 7 Days',
    getRange: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 6)
      return { start, end }
    }
  },
  {
    label: 'Last 30 Days',
    getRange: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 29)
      return { start, end }
    }
  }
]

const handleDateClick = (date) => {
  const result = picker.value.selectDate(date)
  
  if (result) {
    // Selection complete
    hoverDate.value = null
  }
}

const handleDateHover = (date) => {
  if (picker.value.selecting) {
    hoverDate.value = date
  }
}

const selectPreset = (preset) => {
  const range = preset.getRange()
  picker.value.range = range
  picker.value.selecting = false
}

const clearSelection = () => {
  picker.value.clear()
  emit('update:modelValue', null)
}

const apply = () => {
  if (hasSelection.value) {
    emit('update:modelValue', {
      start: selectedRange.value.start,
      end: selectedRange.value.end
    })
    showPicker.value = false
  }
}

const cancel = () => {
  showPicker.value = false
}
</script>

<style scoped>
.date-range-picker {
  position: relative;
  display: inline-block;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.range-inputs input {
  border: none;
  outline: none;
  width: 120px;
}

.separator {
  color: #999;
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
}

.calendar-popup {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
}

.preset-ranges {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.preset-ranges button {
  padding: 0.25rem 0.75rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.preset-ranges button:hover {
  background: #f5f5f5;
}

.calendars {
  display: flex;
  gap: 1rem;
  padding: 1rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #eee;
}
</style>
```

## Advanced Range Validation

```typescript
interface RangeConstraints {
  minDate?: Date
  maxDate?: Date
  maxDays?: number
  minDays?: number
  disabledDates?: Date[]
  disabledDaysOfWeek?: number[]
}

class ConstrainedDateRangePicker extends DateRangePicker {
  constructor(
    temporal: Temporal,
    private constraints: RangeConstraints = {}
  ) {
    super(temporal)
  }
  
  // Check if date is selectable
  isDateSelectable(date: Date): boolean {
    // Check min/max bounds
    if (this.constraints.minDate && date < this.constraints.minDate) {
      return false
    }
    if (this.constraints.maxDate && date > this.constraints.maxDate) {
      return false
    }
    
    // Check disabled dates
    if (this.constraints.disabledDates) {
      const isDisabled = this.constraints.disabledDates.some(d =>
        isSame(this.temporal,
          toPeriod(this.temporal, d, 'day'),
          toPeriod(this.temporal, date, 'day'),
          'day'
        )
      )
      if (isDisabled) return false
    }
    
    // Check disabled days of week
    if (this.constraints.disabledDaysOfWeek) {
      const dayOfWeek = date.getDay()
      if (this.constraints.disabledDaysOfWeek.includes(dayOfWeek)) {
        return false
      }
    }
    
    return true
  }
  
  // Validate range selection
  validateRange(start: Date, end: Date): string | null {
    // Check individual dates
    if (!this.isDateSelectable(start) || !this.isDateSelectable(end)) {
      return 'Selected dates are not available'
    }
    
    // Check range length
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    if (this.constraints.minDays && days < this.constraints.minDays) {
      return `Minimum ${this.constraints.minDays} days required`
    }
    
    if (this.constraints.maxDays && days > this.constraints.maxDays) {
      return `Maximum ${this.constraints.maxDays} days allowed`
    }
    
    // Check for disabled dates within range
    if (this.constraints.disabledDates) {
      const hasDisabled = this.constraints.disabledDates.some(d =>
        d >= start && d <= end
      )
      if (hasDisabled) {
        return 'Range contains unavailable dates'
      }
    }
    
    return null // Valid
  }
}
```

## Business Days Range

```typescript
// Select only business days
function createBusinessDayRangePicker(temporal: Temporal) {
  const constraints: RangeConstraints = {
    disabledDaysOfWeek: [0, 6], // Disable weekends
    disabledDates: getFederalHolidays(new Date().getFullYear())
  }
  
  return new ConstrainedDateRangePicker(temporal, constraints)
}

// Count business days in range
function countBusinessDaysInRange(
  temporal: Temporal,
  range: Period
): number {
  const days = divide(temporal, range, 'day')
  return days.filter(day => 
    !isWeekend(day) && !isHoliday(day.date)
  ).length
}

// Get business day range
function getBusinessDayRange(
  temporal: Temporal,
  startDate: Date,
  businessDays: number
): Period {
  let current = toPeriod(temporal, startDate, 'day')
  let count = 0
  let endDate = startDate
  
  while (count < businessDays) {
    if (!isWeekend(current) && !isHoliday(current.date)) {
      count++
      endDate = current.date
    }
    current = next(temporal, current)
  }
  
  return createCustomPeriod(startDate, endDate)
}
```

## React Date Range Hook

```jsx
import { useState, useCallback, useMemo } from 'react'
import { createTemporal, createCustomPeriod, contains, isSame } from 'usetemporal'

function useDateRange(constraints = {}) {
  const [temporal] = useState(() => createTemporal({ date: new Date() }))
  const [range, setRange] = useState({ start: null, end: null })
  const [selecting, setSelecting] = useState(false)
  
  const selectDate = useCallback((date) => {
    if (!range.start || (range.start && range.end)) {
      // Start new selection
      setRange({ start: date, end: null })
      setSelecting(true)
    } else if (selecting) {
      // Complete selection
      const newRange = date < range.start
        ? { start: date, end: range.start }
        : { start: range.start, end: date }
      
      setRange(newRange)
      setSelecting(false)
      
      return createCustomPeriod(newRange.start, newRange.end)
    }
    
    return null
  }, [range, selecting])
  
  const isInRange = useCallback((date) => {
    if (!range.start) return false
    
    if (range.end) {
      const period = createCustomPeriod(range.start, range.end)
      return contains(period, date)
    } else if (selecting) {
      // Preview range
      const start = range.start.getTime()
      const dateTime = date.getTime()
      return dateTime >= Math.min(start, dateTime) && 
             dateTime <= Math.max(start, dateTime)
    }
    
    return isSame(
      temporal,
      toPeriod(temporal, date, 'day'),
      toPeriod(temporal, range.start, 'day'),
      'day'
    )
  }, [temporal, range, selecting])
  
  const clear = useCallback(() => {
    setRange({ start: null, end: null })
    setSelecting(false)
  }, [])
  
  return {
    range,
    selecting,
    selectDate,
    isInRange,
    clear,
    temporal
  }
}

// Usage
function DateRangePickerComponent() {
  const {
    range,
    selecting,
    selectDate,
    isInRange,
    clear
  } = useDateRange()
  
  return (
    <div>
      {/* Calendar UI */}
    </div>
  )
}
```

## Linked Date Inputs

```typescript
// Manage start and end date inputs
class LinkedDateInputs {
  constructor(
    private temporal: Temporal,
    private onRangeChange: (range: Period | null) => void
  ) {}
  
  private start: Date | null = null
  private end: Date | null = null
  
  setStartDate(date: Date | null): void {
    this.start = date
    
    if (this.end && date && date > this.end) {
      // Auto-adjust end date
      this.end = null
    }
    
    this.updateRange()
  }
  
  setEndDate(date: Date | null): void {
    this.end = date
    
    if (this.start && date && date < this.start) {
      // Auto-adjust start date
      this.start = null
    }
    
    this.updateRange()
  }
  
  private updateRange(): void {
    if (this.start && this.end) {
      const range = createCustomPeriod(this.start, this.end)
      this.onRangeChange(range)
    } else {
      this.onRangeChange(null)
    }
  }
  
  // Get valid date range for end input
  getEndDateConstraints(): { min?: Date; max?: Date } {
    return {
      min: this.start || undefined
    }
  }
  
  // Get valid date range for start input
  getStartDateConstraints(): { min?: Date; max?: Date } {
    return {
      max: this.end || undefined
    }
  }
}
```

## Usage Examples

```typescript
const temporal = createTemporal({ date: new Date() })

// Basic range picker
const picker = new DateRangePicker(temporal)

// Select dates
picker.selectDate(new Date('2024-03-01'))
picker.selectDate(new Date('2024-03-15'))

const selectedPeriod = picker.getSelectedPeriod()
console.log(`Selected: ${selectedPeriod.start} to ${selectedPeriod.end}`)

// Constrained picker (max 7 days, no weekends)
const constrainedPicker = new ConstrainedDateRangePicker(temporal, {
  maxDays: 7,
  disabledDaysOfWeek: [0, 6]
})

// Business day range
const businessRange = getBusinessDayRange(
  temporal,
  new Date('2024-03-01'),
  10 // 10 business days
)
console.log(`10 business days: ${businessRange.start} to ${businessRange.end}`)

// Count days in range
const days = divide(temporal, selectedPeriod, 'day').length
const businessDays = countBusinessDaysInRange(temporal, selectedPeriod)
console.log(`Total days: ${days}, Business days: ${businessDays}`)
```

## See Also

- [Business Days](/examples/recipes/business-days) - Working with business days
- [Month Calendar](/examples/calendars/month-calendar) - Calendar implementation
- [contains](/api/operations/contains) - Check date containment
- [createCustomPeriod](/api/factory-functions/create-custom-period) - Create custom periods