# Calendar Systems and Historical Changes

Throughout history, humanity has developed numerous calendar systems to track time. The story of how we arrived at our current Gregorian calendar is filled with fascinating reforms, lost days, and political intrigue that continues to affect software development today.

## The Missing 10 Days of 1582

### The Great Calendar Reform

In October 1582, millions of people went to bed on October 4th and woke up on October 15th. Ten days had vanished from history by papal decree.

```javascript
// These dates never existed in Catholic countries
const missingDates = [
  new Date(1582, 9, 5), // October 5, 1582
  new Date(1582, 9, 6), // October 6, 1582
  new Date(1582, 9, 7), // October 7, 1582
  new Date(1582, 9, 8), // October 8, 1582
  new Date(1582, 9, 9), // October 9, 1582
  new Date(1582, 9, 10), // October 10, 1582
  new Date(1582, 9, 11), // October 11, 1582
  new Date(1582, 9, 12), // October 12, 1582
  new Date(1582, 9, 13), // October 13, 1582
  new Date(1582, 9, 14), // October 14, 1582
];
// Note: JavaScript's Date object doesn't handle this historical quirk!
```

### Why Remove 10 Days?

The Julian calendar (introduced by Julius Caesar in 45 BCE) assumed a year was exactly 365.25 days long. In reality, a year is about 365.2422 days. This tiny difference of 0.0078 days per year had accumulated to 10 days by 1582.

Pope Gregory XIII's reform:

1. Removed 10 days to realign with the solar year
2. Changed leap year rules to prevent future drift
3. Moved the spring equinox back to March 21

### The Gradual Adoption

Different countries adopted the Gregorian calendar at different times, creating a patchwork of calendar systems:

```javascript
const gregorianAdoption = {
  // Catholic countries (1582)
  Spain: "1582-10-04", // Next day: Oct 15
  Portugal: "1582-10-04",
  Italy: "1582-10-04",
  France: "1582-12-09", // Next day: Dec 20

  // Protestant resistance
  Britain: "1752-09-02", // Next day: Sep 14 (lost 11 days)
  Sweden: "1753-02-17", // Next day: Mar 1
  Germany: "Various dates between 1582-1700",

  // Orthodox countries
  Russia: "1918-01-31", // Next day: Feb 14 (Soviet era)
  Greece: "1923-02-15", // Next day: Mar 1

  // Asian adoption
  Japan: "1873-01-01", // Meiji Restoration
  China: "1912-01-01", // Republic established
  Korea: "1896-01-01",
  Turkey: "1926-01-01", // Atatürk's reforms
};
```

## Sweden's February 30, 1712

### The Failed Gradual Transition

Sweden attempted a unique approach to calendar reform:

```javascript
// Sweden's plan (1700)
// Skip leap days for 40 years to gradually align with Gregorian
// 1700: No leap day (done)
// 1704: Forgot to skip!
// 1708: Forgot again!
// 1712: Gave up and added TWO leap days

// This created the only February 30 in history
const feb30 = {
  date: "February 30, 1712",
  country: "Sweden",
  reason: "Double leap day to return to Julian calendar",
};
```

## The French Revolutionary Calendar

### Decimal Time Revolution (1793-1806)

The French Revolution attempted to decimalize time itself:

```javascript
const revolutionaryCalendar = {
  months: 12,
  daysPerMonth: 30,
  weeks: "Abolished",
  daysPerWeek: 10, // Called "décades"
  hoursPerDay: 10,
  minutesPerHour: 100,
  secondsPerMinute: 100,

  monthNames: [
    "Vendémiaire", // Grape harvest
    "Brumaire", // Fog
    "Frimaire", // Frost
    "Nivôse", // Snow
    "Pluviôse", // Rain
    "Ventôse", // Wind
    "Germinal", // Germination
    "Floréal", // Flower
    "Prairial", // Pasture
    "Messidor", // Harvest
    "Thermidor", // Summer heat
    "Fructidor", // Fruit
  ],

  extraDays: 5, // 6 in leap years, called "Sansculottides"
};

// A revolutionary timestamp
// Year 2, Thermidor 9 at 5:50:50 (decimal time)
// = July 27, 1794 at 14:00:00 (standard time)
```

### Why It Failed

1. **Cultural resistance**: 10-day weeks meant only 1 rest day per 10
2. **Practical issues**: Couldn't coordinate with other countries
3. **Religious opposition**: Eliminated Sunday worship
4. **Napoleon**: Abandoned it to reconcile with the Catholic Church

## Calendar Systems Still in Use

### 1. Islamic Calendar (Hijri)

```javascript
// Purely lunar calendar - 354 or 355 days per year
const islamicCalendar = {
  type: "lunar",
  monthsPerYear: 12,
  daysPerYear: 354.36, // 11 days shorter than solar
  era: "Started July 16, 622 CE",

  // Months drift through seasons
  example: "Ramadan occurs 11 days earlier each Gregorian year",
};

// Conversion is complex
function approximateIslamicYear(gregorianYear) {
  // Rough approximation only!
  return Math.floor((gregorianYear - 622) * 1.030684);
}
```

### 2. Hebrew Calendar

```javascript
// Lunisolar calendar - lunar months with solar year adjustment
const hebrewCalendar = {
  type: "lunisolar",
  monthsPerYear: "12 or 13", // Leap months!
  currentYear: 5784, // As of 2024 CE

  leapYearCycle: {
    years: 19,
    leapYears: 7, // Years 3, 6, 8, 11, 14, 17, 19
    leapMonth: "Adar II", // Extra month added
  },
};
```

### 3. Chinese Calendar

```javascript
// Lunisolar with complex rules
const chineseCalendar = {
  type: "lunisolar",
  yearsInCycle: 60, // Sexagenary cycle
  zodiacAnimals: 12,
  elements: 5,

  // Each year has an animal and element
  getYearName: (year) => {
    const animals = [
      "Rat",
      "Ox",
      "Tiger",
      "Rabbit",
      "Dragon",
      "Snake",
      "Horse",
      "Goat",
      "Monkey",
      "Rooster",
      "Dog",
      "Pig",
    ];
    const elements = ["Wood", "Fire", "Earth", "Metal", "Water"];

    // 2024 is Year of the Wood Dragon
    const baseYear = 1924; // Wood Rat
    const offset = year - baseYear;

    return `${elements[Math.floor(offset / 2) % 5]} ${animals[offset % 12]}`;
  },
};
```

### 4. Ethiopian Calendar

```javascript
// 13 months! Still used officially in Ethiopia
const ethiopianCalendar = {
  monthsPerYear: 13,
  daysPerMonth: 30, // For first 12 months
  thirteenthMonth: {
    name: "Pagume",
    days: 5, // 6 in leap years
  },

  // Currently about 7-8 years behind Gregorian
  currentYear: 2016, // As of 2024 CE
  newYear: "September 11 (or 12 in leap years)",

  // Different leap year calculation
  leapYear: (year) => year % 4 === 3,
};
```

## Historical Date Handling in Software

### The Challenge for Developers

```javascript
// Historical dates are problematic
class HistoricalDate {
  constructor(year, month, day, calendar = "gregorian") {
    this.year = year;
    this.month = month;
    this.day = day;
    this.calendar = calendar;
  }

  toGregorian() {
    // Need to know:
    // 1. Which calendar system?
    // 2. When did this location switch calendars?
    // 3. Were there any local variations?

    if (this.calendar === "julian") {
      // Complex conversion based on date
      if (this.year < 1582) {
        return this; // Already aligned
      } else if (this.year < 1700) {
        // Depends on country!
        throw new Error("Need location for conversion");
      }
    }
  }
}
```

### Double Dating in Historical Documents

Before universal Gregorian adoption, dates were often written with both calendar systems:

```javascript
// Historical document notation
const historicalNotations = [
  "February 11, 1731/32", // Old Style/New Style
  "11 February 1731 O.S.", // Old Style (Julian)
  "22 February 1732 N.S.", // New Style (Gregorian)
];

// George Washington's birthday
const washington = {
  julian: "February 11, 1731", // Original records
  gregorian: "February 22, 1732", // Modern celebration
  reason: "Britain adopted Gregorian calendar in 1752",
};
```

## Leap Year Rules Across Calendars

### Gregorian Leap Years

```javascript
function isGregorianLeapYear(year) {
  // Divisible by 4
  if (year % 4 !== 0) return false;

  // Except centuries
  if (year % 100 === 0) {
    // Unless divisible by 400
    return year % 400 === 0;
  }

  return true;
}

// This gives us 97 leap years per 400 years
// Average year length: 365.2425 days
```

### Julian Leap Years

```javascript
function isJulianLeapYear(year) {
  // Simple: every 4 years
  return year % 4 === 0;
}

// This gives us 100 leap years per 400 years
// Average year length: 365.25 days
// 0.0075 days too long!
```

## Modern Implications

### Database Storage

```javascript
// Storing historical dates requires metadata
const historicalEvent = {
  date: "1605-11-05",
  calendar: "julian", // Guy Fawkes Night
  location: "England",
  gregorianEquivalent: "1605-11-15",
  notes: "England still used Julian calendar",
};
```

### Time Zone Database (TZDB)

The IANA Time Zone Database includes historical data:

```javascript
// TZDB handles historical timezone changes
// Example: Alaska timezone history
const alaskaHistory = [
  { until: "1867-10-18", zone: "America/Sitka" }, // Russian America
  { until: "1900-08-20", zone: "America/Sitka" }, // After purchase
  { until: "1942-01-01", zone: "America/Yakutat" }, // Multiple zones
  { until: "1946-01-01", zone: "America/Anchorage" }, // War time
  { until: "1967-04-01", zone: "America/Anchorage" }, // Standard time
  { until: "1983-10-30", zone: "America/Anchorage" }, // Multiple zones
  { from: "1983-10-30", zone: "America/Anchorage" }, // Unified
];
```

## Best Practices for Historical Dates

### 1. Always Specify the Calendar System

```javascript
class HistoricalDate {
  constructor(dateString, options = {}) {
    this.dateString = dateString;
    this.calendar = options.calendar || "gregorian";
    this.location = options.location;
    this.uncertainty = options.uncertainty;
  }
}
```

### 2. Handle Ambiguous Dates

```javascript
// Between 1582 and 1923, dates are ambiguous
function parseHistoricalDate(dateString, location) {
  const year = extractYear(dateString);

  if (year >= 1582 && year <= 1923) {
    console.warn(
      `Date ${dateString} is ambiguous. ` +
        `${location} switched to Gregorian in ${getAdoptionDate(location)}`
    );
  }
}
```

### 3. Document Calendar Assumptions

```javascript
/**
 * @param {string} date - ISO 8601 date string
 * @param {Object} options
 * @param {string} options.calendar - 'gregorian' (default), 'julian', 'islamic', etc.
 * @param {boolean} options.proleptic - Extend calendar rules before official adoption
 */
function createHistoricalDate(date, options = {}) {
  // Implementation
}
```

## How useTemporal Handles Calendar Complexity

### Adapter Pattern for Calendar Systems

useTemporal's adapter pattern makes it ready for different calendar systems:

```javascript
import { createTemporal } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";
import { luxonAdapter } from "@usetemporal/adapter-luxon";

// Gregorian calendar (default)
const gregorian = createTemporal({
  dateAdapter: nativeAdapter,
});

// Future: Support for other calendars via adapters
const islamic = createTemporal({
  dateAdapter: luxonAdapter,
  calendar: "islamic", // Planned feature
});

const hebrew = createTemporal({
  dateAdapter: luxonAdapter,
  calendar: "hebrew", // Planned feature
});
```

### Handling Calendar Edge Cases

useTemporal gracefully handles calendar quirks:

```javascript
// Leap year handling
const temporal = createTemporal({ dateAdapter: nativeAdapter });

// February in leap vs non-leap years
const feb2024 = temporal.periods.month(temporal, {
  date: new Date(2024, 1, 1), // Leap year
});
const feb2023 = temporal.periods.month(temporal, {
  date: new Date(2023, 1, 1), // Non-leap year
});

// Divide pattern handles different month lengths
const days2024 = temporal.divide(feb2024, "day");
const days2023 = temporal.divide(feb2023, "day");

console.log(days2024.length); // 29 days
console.log(days2023.length); // 28 days
```

### Historical Date Awareness

While JavaScript's Date object doesn't handle pre-Gregorian dates correctly, useTemporal provides a consistent interface:

```javascript
// Current limitation: JavaScript Date assumes proleptic Gregorian
// But useTemporal provides consistent API for future enhancements

const temporal = createTemporal({ dateAdapter: nativeAdapter });

// Future feature: Historical calendar support
const historicalTemporal = createTemporal({
  dateAdapter: historicalAdapter, // Planned adapter
  calendar: "julian",
  switchDate: "1752-09-14", // When to switch to Gregorian
});

// API remains the same
const year1700 = historicalTemporal.periods.year(historicalTemporal, {
  date: new Date(1700, 0, 1),
});
```

### The 13-Month Calendar Problem

useTemporal's divide pattern naturally handles non-standard calendars:

```javascript
// Ethiopian calendar has 13 months
// Future adapter could support this

const ethiopianTemporal = createTemporal({
  dateAdapter: ethiopianAdapter, // Planned feature
  calendar: "ethiopian",
});

// The divide pattern still works!
const year = ethiopianTemporal.periods.year(ethiopianTemporal);
const months = ethiopianTemporal.divide(year, "month");

console.log(months.length); // Would return 13 for Ethiopian calendar

// Each month would have correct properties
months.forEach((month) => {
  console.log(month.days); // 30 for months 1-12, 5-6 for month 13
});
```

### Stable Month Pattern

useTemporal introduces the innovative `stableMonth` concept for UI consistency:

```javascript
// Problem: Calendar UIs need consistent 6-week displays
// Solution: stableMonth always returns 42 days (6 weeks)

const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1, // Monday
});

// Regular month - variable length
const regularMonth = temporal.periods.month(temporal);
const regularDays = temporal.divide(regularMonth, "day");
console.log(regularDays.length); // 28-31 days

// Stable month - always 42 days
const stableMonth = temporal.periods.stableMonth(temporal);
const stableDays = temporal.divide(stableMonth, "day");
console.log(stableDays.length); // Always 42 days

// Perfect for calendar grids!
const weeks = temporal.divide(stableMonth, "week");
console.log(weeks.length); // Always 6 weeks
```

### Future-Proof Calendar Support

useTemporal is designed to support multiple calendar systems:

```javascript
// Planned multi-calendar support
const multiCalendar = createTemporal({
  dateAdapter: universalAdapter, // Future adapter

  // Primary calendar
  calendar: "gregorian",

  // Secondary calendars for display
  additionalCalendars: ["islamic", "hebrew", "chinese"],

  // Conversion methods
  onCalendarChange: (calendar) => {
    console.log(`Switched to ${calendar} calendar`);
  },
});

// Convert between calendars
const gregorianDate = multiCalendar.periods.day(multiCalendar);
const islamicDate = gregorianDate.toCalendar("islamic"); // Planned
const hebrewDate = gregorianDate.toCalendar("hebrew"); // Planned
```

### Handling Leap Seconds and Irregular Days

```javascript
// useTemporal abstracts away complexity
const temporal = createTemporal({ dateAdapter: nativeAdapter });

// During a leap second (23:59:60)
// Adapters handle this internally
const day = temporal.periods.day(temporal);
const hours = temporal.divide(day, "hour");
const minutes = temporal.divide(hours[23], "minute");
const seconds = temporal.divide(minutes[59], "second");

// Adapter ensures consistent behavior
// Even during leap seconds
```

### Benefits for Calendar Applications

```javascript
// Building a multi-cultural calendar app
function createMultiCulturalCalendar(options) {
  const temporal = createTemporal({
    dateAdapter: options.adapter,
    calendar: options.primaryCalendar,
    weekStartsOn: options.weekStart,
  });

  // Consistent API regardless of calendar system
  const year = temporal.periods.year(temporal);
  const months = temporal.divide(year, "month");

  return months.map((month) => ({
    name: month.name,
    days: month.days,
    // Format according to calendar system
    formatted: month.format(options.locale),
  }));
}

// Works with any supported calendar
const gregorianCal = createMultiCulturalCalendar({
  adapter: nativeAdapter,
  primaryCalendar: "gregorian",
  weekStart: 1,
  locale: "en-US",
});

const islamicCal = createMultiCulturalCalendar({
  adapter: luxonAdapter,
  primaryCalendar: "islamic",
  weekStart: 6,
  locale: "ar-SA",
});
```

## Conclusion

Calendar systems reflect the rich tapestry of human culture and history. As developers, we must:

1. **Respect complexity**: Simple date arithmetic fails for historical dates
2. **Know the context**: Location and era determine which calendar applies
3. **Document assumptions**: Always specify which calendar system you're using
4. **Test edge cases**: Calendar transitions create unusual dates
5. **Use specialized libraries**: For historical dates, use libraries designed for the task

The story of calendars reminds us that even something as "simple" as counting days is deeply intertwined with culture, politics, and human nature. When we handle dates in our software, we're not just manipulating numbers – we're working with systems that have evolved over millennia of human civilization.

useTemporal embraces this complexity through its adapter pattern and divide functionality, providing a consistent API that works across different calendar systems. While full historical calendar support is planned for future releases, the foundation is already in place to handle the rich diversity of human timekeeping systems. The innovative stableMonth pattern solves practical UI challenges, while the framework-agnostic design ensures your calendar code works everywhere.
