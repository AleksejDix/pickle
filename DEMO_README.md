# useTemporal Interactive Demo

This project showcases the revolutionary capabilities of **useTemporal** - a Vue 3 library for hierarchical time composables.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:5173
```

## 📖 Documentation

Visit the comprehensive documentation:

```bash
# Start documentation server
npm run docs:dev

# Visit http://localhost:5173 (docs)
```

## 🎯 What You'll See

### 1. Basic Time Navigation Demo

- **Year Level Navigation**: Navigate through years and see months automatically update
- **Month Level Navigation**: Navigate through months and see days in calendar format
- **Synchronized Updates**: All time units stay perfectly synchronized
- **Current Highlighting**: Current time periods are visually highlighted

### 2. Time Hierarchy Demo

- **Multiple Scales**: See Year, Month, Day, and Hour all at once
- **Automatic Synchronization**: Change any unit and watch others update
- **Consistent Interface**: Every time scale uses identical navigation methods
- **Reset to Now**: Jump back to current time with one click

### 3. The divide() Pattern Demo

- **Year → Months**: See how `pickle.divide(year, 'month')` creates 12 month units
- **Month → Days**: See how `pickle.divide(month, 'day')` creates 28-31 day units
- **Live Updates**: Watch subdivisions update as you navigate
- **Code Examples**: See the actual code that generates each subdivision

## 🧩 Key Features Demonstrated

### Revolutionary divide() Pattern

```typescript
// Any time unit can be divided into smaller units
const months = pickle.divide(year, "month"); // 12 months
const days = pickle.divide(month, "day"); // 28-31 days
const hours = pickle.divide(day, "hour"); // 24 hours
const minutes = pickle.divide(hour, "minute"); // 60 minutes
```

### Consistent Time Unit Interface

```typescript
// Every time scale works the same way
year.past(); // Go to previous year
month.past(); // Go to previous month
day.past(); // Go to previous day
hour.past(); // Go to previous hour

// All have the same properties
console.log(year.name); // "2024"
console.log(month.name); // "January 2024"
console.log(day.name); // "Monday, January 15, 2024"
console.log(hour.name); // "2:00 PM"
```

### Reactive Synchronization

```typescript
// Change one unit, all related units update automatically
const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);
const month = useMonth(pickle);

year.future(); // Go to next year
// month automatically updates to same month in next year
```

## 🔧 Technical Implementation

### Core Architecture

- **PickleCore**: Central time management with `divide()` method
- **TimeUnit Interface**: Consistent contract all time units implement
- **Reactive Properties**: Built on Vue 3's reactivity system
- **Hierarchical Design**: Time scales from millennium to minute

### File Structure

```
src/
├── components/
│   ├── DemoApp.vue              # Main demo application
│   └── demos/
│       ├── BasicDatePicker.vue   # Interactive date picker
│       └── MultiScaleCalendar.vue # Multi-scale calendar demo
├── use/
│   ├── usePickle.ts             # Core time management
│   ├── useYear.ts               # Year-level composable
│   ├── useMonth.ts              # Month-level composable
│   ├── useDay.ts                # Day-level composable
│   └── useHour.ts               # Hour-level composable
└── types/
    └── index.ts                 # TypeScript interfaces
```

## 💡 Key Innovations

### 1. Fractal Time Architecture

Unlike traditional date libraries that treat each time scale separately, useTemporal uses a unified pattern where every scale works identically.

### 2. Data-First Design

Composables return reactive data, not UI components. Build any interface you can imagine.

### 3. Automatic Synchronization

Changes to any time unit automatically propagate to all related units through Vue's reactivity.

### 4. Revolutionary divide() Method

The breakthrough innovation that enables seamless time subdivision at any scale.

## 🎨 UI Components Built

The demo showcases several complete UI components built with useTemporal:

- **Interactive Calendar**: Full month view with day selection
- **Multi-Scale Navigator**: Zoom between year/month/day/hour views
- **Time Hierarchy Display**: Show multiple time scales simultaneously
- **Synchronized Navigation**: Multiple time units that stay in sync

## 🔍 Try It Yourself

1. **Navigate Through Time**: Use the arrow buttons to move through different time periods
2. **Select Different Scales**: Switch between year, month, day, and hour views
3. **Click on Time Units**: Click months or days to jump to specific times
4. **Reset to Now**: Use "Reset to Now" to jump back to current time
5. **Watch Synchronization**: Notice how all related time units update automatically

## 📚 Learn More

- **Documentation**: Complete API reference and guides
- **Examples**: Comprehensive examples for every use case
- **Types**: Full TypeScript definitions and interfaces
- **Concepts**: Deep dives into the hierarchical time architecture

This demo proves that useTemporal revolutionizes how we work with time in web applications! 🚀
