---
layout: home

hero:
  name: "useTemporal"
  text: "Revolutionary Vue 3 Time Composables"
  tagline: "Hierarchical time management with the groundbreaking divide() pattern"
  image:
    src: /logo.svg
    alt: useTemporal Logo
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View Examples
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com/your-username/usetemporal

features:
  - icon: 🧩
    title: Hierarchical Design
    details: Every time scale uses the same consistent interface. Learn once, use everywhere from millennia to minutes.
  - icon: ⚡
    title: Revolutionary divide()
    details: One method divides any time unit into smaller units. pickle.divide(year, 'month') creates 12 synchronized months.
  - icon: 🔄
    title: Reactive by Design
    details: Built on Vue 3's reactivity. Changes propagate automatically throughout your entire time hierarchy.
  - icon: 📐
    title: Mathematical Precision
    details: No off-by-one errors or manual date calculations. Each time unit knows its exact boundaries.
  - icon: 🎯
    title: Data-First Architecture
    details: Composables return reactive data, not rigid UI components. Build any interface you can imagine.
  - icon: 🚀
    title: Infinite Scalability
    details: Add new time scales without changing existing code. The consistent interface scales infinitely.
---

## Experience useTemporal

Try the revolutionary divide() pattern right here in the documentation:

<QuickDemo />

## Real-World Application: GitHub Contribution Chart

See how useTemporal makes complex time-based visualizations incredibly simple. This GitHub-style contribution chart demonstrates the power of the `divide()` pattern with a familiar interface:

<GitHubChart />

### What This Demonstrates

🎯 **Single Pattern, Infinite Possibilities**: The same `pickle.divide(year, 'day')` creates 365 perfectly organized time units
⚡ **Automatic Reactivity**: Navigate years - all 365 squares update instantly without manual DOM manipulation  
🧮 **Perfect Grid Layout**: Days automatically arrange into the correct week structure
📊 **Real-Time Data Binding**: Click any square to see reactive data updates in action

## Interactive Examples

### 📅 Full-Featured Date Picker

Build complete date pickers with automatic month navigation and day highlighting:

[**Try the Date Picker →**](/examples/basic-date-picker)

### 🔍 Multi-Scale Calendar

Seamlessly zoom between years, months, days, and hours with unified interactions:

[**Try the Multi-Scale Calendar →**](/examples/multi-scale-calendar)

### 🌳 Time Hierarchy

See how all time units stay perfectly synchronized across different scales:

[**View Time Hierarchy Demo →**](/concepts/divide-pattern)

## Why useTemporal is Revolutionary

### Traditional Approach (Problematic)

```typescript
// Separate, disconnected APIs
const years = getYears();
const months = getMonthsForYear(year);
const days = getDaysForMonth(month);
const hours = getHoursForDay(day);

// Different handling for each scale
if (scale === "year") handleYears();
else if (scale === "month") handleMonths();
// Complex, error-prone, non-scalable
```

### useTemporal Approach (Revolutionary)

```typescript
// One unified pattern for all scales
const pickle = usePickle({ date: new Date() });
const currentUnit = useYear(pickle); // or useMonth, useDay, useHour...
const subdivisions = pickle.divide(currentUnit, "month");

// Same interface for every time scale
currentUnit.past(); // Works for ALL scales
currentUnit.future(); // Consistent everywhere
currentUnit.isNow; // Always available
```

## The Breakthrough: divide() Pattern

Watch the divide() pattern in action. Navigate months and see how the number of days automatically updates:

<QuickDemo />

### How It Works

The `pickle.divide()` method is the core innovation that enables fractal time architecture:

```typescript
const year = useYear(pickle);
const months = pickle.divide(year, "month"); // 12 months
const days = pickle.divide(month, "day"); // 28-31 days
const hours = pickle.divide(day, "hour"); // 24 hours
const minutes = pickle.divide(hour, "minute"); // 60 minutes

// All automatically synchronized!
year.future(); // Everything else updates automatically
```

## Real-World Applications

### 📊 Business Dashboards

```typescript
const quarter = useQuarter(pickle);
const months = pickle.divide(quarter, "month");
const workingDays = days.filter((day) => isBusinessDay(day));
```

### 📅 Calendar Applications

```typescript
const month = useMonth(pickle);
const weeks = pickle.divide(month, "week");
const days = pickle.divide(month, "day");
// Perfect calendar grids automatically
```

### ⏰ Time Tracking

```typescript
const day = useDay(pickle);
const hours = pickle.divide(day, "hour");
const timeSlots = hours.map((hour) => ({
  time: hour.name.value,
  available: !hasBooking(hour),
}));
```

## Get Started in Minutes

### 1. **Install**

```bash
npm install usetemporal
```

### 2. **Import**

```typescript
import { usePickle, useMonth } from "usetemporal";
```

### 3. **Use**

```typescript
const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);
const days = pickle.divide(month, "day");

// Navigate
month.past(); // Previous month
month.future(); // Next month

// Days automatically update!
```

## Why Developers Love useTemporal

### ✨ **Intuitive API**

"Finally, time management that makes sense. The divide() pattern is genius!"

### 🚀 **Incredible Performance**

"Reactive updates are lightning fast. Only what needs to change actually changes."

### 🧩 **Perfect Composability**

"I can build any time interface imaginable. The consistency is mind-blowing."

### 🔄 **Zero Configuration**

"Just works out of the box. No complex setup or configuration needed."

## Ready to Transform Your Time Interfaces?

<div style="text-align: center; margin: 2rem 0;">
  <a href="/getting-started" style="display: inline-block; background: #3b82f6; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 0.5rem;">
    🚀 Get Started Now
  </a>
  <a href="/examples/" style="display: inline-block; background: #10b981; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 0.5rem;">
    🎯 See Examples
  </a>
</div>

---

**useTemporal** - Revolutionizing time management in Vue 3 applications through hierarchical composables and the groundbreaking divide() pattern.

<script setup>
import QuickDemo from './.vitepress/components/QuickDemo.vue'
import GitHubChart from './.vitepress/components/GitHubChart.vue'
</script>
