/**
 * Example: Defining Custom Units with the Unit Plugin System
 * 
 * This demonstrates how to define custom time units like sprints,
 * fiscal quarters, and academic semesters using the unit registry.
 */

import { createTemporal, defineUnit, usePeriod, divide, next } from "@usetemporal/core";
import { createNativeAdapter } from "@usetemporal/adapter-native";

// Initialize temporal with native adapter
const adapter = createNativeAdapter();
const temporal = createTemporal({ adapter });

// Example 1: Define a Sprint unit (2-week development cycles)
defineUnit("sprint", {
  createPeriod(date, adapter) {
    // Sprints start on Monday
    const dayOfWeek = date.getDay();
    const daysToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
    const monday = new Date(date);
    monday.setDate(date.getDate() + daysToMonday);
    
    const start = adapter.startOf(monday, "day");
    // Sprint is 2 weeks (14 days)
    const end = new Date(start);
    end.setDate(start.getDate() + 13);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  },
  divisions: ["week", "day"],
  mergesTo: "quarter",
});

// Example 2: Define Fiscal Quarter (fiscal year starts in July)
defineUnit("fiscal-quarter", {
  createPeriod(date, adapter) {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    // Q1: Jul-Sep, Q2: Oct-Dec, Q3: Jan-Mar, Q4: Apr-Jun
    let quarterStartMonth: number;
    
    if (month >= 6 && month <= 8) { // Jul-Sep (Q1)
      quarterStartMonth = 6;
    } else if (month >= 9 && month <= 11) { // Oct-Dec (Q2)
      quarterStartMonth = 9;
    } else if (month >= 0 && month <= 2) { // Jan-Mar (Q3)
      quarterStartMonth = 0;
    } else { // Apr-Jun (Q4)
      quarterStartMonth = 3;
    }
    
    const start = new Date(year, quarterStartMonth, 1);
    const end = new Date(year, quarterStartMonth + 3, 0, 23, 59, 59, 999);
    
    return { start, end };
  },
  divisions: ["month", "week", "day"],
  mergesTo: "fiscal-year",
});

// Example 3: Define Academic Semester
defineUnit("semester", {
  createPeriod(date, adapter) {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    let start: Date;
    let end: Date;
    
    // Fall semester: August 15 - December 20
    // Spring semester: January 10 - May 15
    // Summer semester: May 20 - August 10
    
    if (month >= 7 || month === 0) { // Fall (Aug-Dec) or early Jan
      // Fall semester
      start = new Date(year, 7, 15); // August 15
      end = new Date(year, 11, 20, 23, 59, 59, 999); // December 20
      
      if (month === 0) { // If January, we're in the previous year's fall
        start = new Date(year - 1, 7, 15);
        end = new Date(year - 1, 11, 20, 23, 59, 59, 999);
      }
    } else if (month >= 1 && month <= 4) { // Spring (Jan-May)
      start = new Date(year, 0, 10); // January 10
      end = new Date(year, 4, 15, 23, 59, 59, 999); // May 15
    } else { // Summer (May-Aug)
      start = new Date(year, 4, 20); // May 20
      end = new Date(year, 7, 10, 23, 59, 59, 999); // August 10
    }
    
    return { start, end };
  },
  divisions: ["month", "week", "day"],
  mergesTo: "academic-year",
});

// Now use the custom units!
console.log("=== Custom Unit Examples ===\n");

// Sprint example
const currentSprint = usePeriod(temporal, "sprint");
console.log("Current Sprint:");
console.log(`  Start: ${currentSprint.value.start.toDateString()}`);
console.log(`  End: ${currentSprint.value.end.toDateString()}`);

// Get next sprint
const nextSprint = next(temporal, currentSprint.value);
console.log("\nNext Sprint:");
console.log(`  Start: ${nextSprint.start.toDateString()}`);
console.log(`  End: ${nextSprint.end.toDateString()}`);

// Divide sprint into days
const sprintDays = divide(temporal, currentSprint.value, "day");
console.log(`\nSprint contains ${sprintDays.length} days`);

// Fiscal quarter example
const fiscalQuarter = usePeriod(temporal, "fiscal-quarter");
console.log("\nCurrent Fiscal Quarter:");
console.log(`  Start: ${fiscalQuarter.value.start.toDateString()}`);
console.log(`  End: ${fiscalQuarter.value.end.toDateString()}`);

// Academic semester example
const semester = usePeriod(temporal, "semester");
console.log("\nCurrent Semester:");
console.log(`  Start: ${semester.value.start.toDateString()}`);
console.log(`  End: ${semester.value.end.toDateString()}`);

// TypeScript Module Augmentation (for type safety)
// In a real project, you would put this in a .d.ts file:
declare module "@usetemporal/core" {
  interface UnitRegistry {
    "sprint": true;
    "fiscal-quarter": true;
    "fiscal-year": true;
    "semester": true;
    "academic-year": true;
  }
}

// Now TypeScript knows about our custom units!
// The following would have autocomplete and type checking:
const typedSprint = usePeriod(temporal, "sprint"); // ✓ Type-safe!
const typedFiscal = usePeriod(temporal, "fiscal-quarter"); // ✓ Type-safe!