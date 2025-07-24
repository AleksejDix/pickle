/**
 * Common test dates for consistent testing
 */

// Fixed test date: June 15, 2024 14:30:45
export const TEST_DATE = new Date(2024, 5, 15, 14, 30, 45);

// Start of 2024
export const YEAR_2024_START = new Date(2024, 0, 1);

// Various test dates throughout 2024
export const testDates = {
  // January dates
  jan1: new Date(2024, 0, 1),
  jan10: new Date(2024, 0, 10), // Wednesday
  jan15: new Date(2024, 0, 15),

  // February dates (leap year)
  feb15: new Date(2024, 1, 15),
  feb29: new Date(2024, 1, 29), // Leap day

  // May dates
  may15: new Date(2024, 4, 15), // Q2

  // June dates
  jun1: new Date(2024, 5, 1),
  jun15: new Date(2024, 5, 15),
  jun30: new Date(2024, 5, 30),

  // November dates
  nov15: new Date(2024, 10, 15), // Q4

  // December dates
  dec31: new Date(2024, 11, 31),

  // Non-leap year
  feb15_2023: new Date(2023, 1, 15),

  // Different years
  year2023: new Date(2023, 5, 15),
  year2025: new Date(2025, 5, 15),
};

// Time-specific dates
export const timeDates = {
  noon: new Date(2024, 5, 15, 12, 0, 0),
  afternoon: new Date(2024, 5, 15, 14, 30, 45),
  midnight: new Date(2024, 5, 15, 0, 0, 0),
  endOfDay: new Date(2024, 5, 15, 23, 59, 59, 999),
};
