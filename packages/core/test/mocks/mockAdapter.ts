import type { DateAdapter, DateDuration, TimeUnitName } from "../../src/types/core";

export class MockDateAdapter implements DateAdapter {
  name = "mock";

  add(date: Date, duration: DateDuration): Date {
    const result = new Date(date);
    
    if (duration.years) result.setFullYear(result.getFullYear() + duration.years);
    if (duration.months) result.setMonth(result.getMonth() + duration.months);
    if (duration.weeks) result.setDate(result.getDate() + duration.weeks * 7);
    if (duration.days) result.setDate(result.getDate() + duration.days);
    if (duration.hours) result.setHours(result.getHours() + duration.hours);
    if (duration.minutes) result.setMinutes(result.getMinutes() + duration.minutes);
    if (duration.seconds) result.setSeconds(result.getSeconds() + duration.seconds);
    if (duration.milliseconds) result.setMilliseconds(result.getMilliseconds() + duration.milliseconds);
    
    return result;
  }

  subtract(date: Date, duration: DateDuration): Date {
    const result = new Date(date);
    
    if (duration.years) result.setFullYear(result.getFullYear() - duration.years);
    if (duration.months) result.setMonth(result.getMonth() - duration.months);
    if (duration.weeks) result.setDate(result.getDate() - duration.weeks * 7);
    if (duration.days) result.setDate(result.getDate() - duration.days);
    if (duration.hours) result.setHours(result.getHours() - duration.hours);
    if (duration.minutes) result.setMinutes(result.getMinutes() - duration.minutes);
    if (duration.seconds) result.setSeconds(result.getSeconds() - duration.seconds);
    if (duration.milliseconds) result.setMilliseconds(result.getMilliseconds() - duration.milliseconds);
    
    return result;
  }

  startOf(date: Date, unit: TimeUnitName): Date {
    const result = new Date(date);
    
    switch (unit) {
      case "year":
        result.setMonth(0, 1);
        result.setHours(0, 0, 0, 0);
        break;
      case "month":
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        break;
      case "week":
        const dayOfWeek = result.getDay();
        result.setDate(result.getDate() - dayOfWeek);
        result.setHours(0, 0, 0, 0);
        break;
      case "day":
        result.setHours(0, 0, 0, 0);
        break;
      case "hour":
        result.setMinutes(0, 0, 0);
        break;
      case "minute":
        result.setSeconds(0, 0);
        break;
      case "second":
        result.setMilliseconds(0);
        break;
    }
    
    return result;
  }

  endOf(date: Date, unit: TimeUnitName): Date {
    const result = new Date(date);
    
    switch (unit) {
      case "year":
        result.setMonth(11, 31);
        result.setHours(23, 59, 59, 999);
        break;
      case "month":
        result.setMonth(result.getMonth() + 1, 0);
        result.setHours(23, 59, 59, 999);
        break;
      case "week":
        const dayOfWeek = result.getDay();
        result.setDate(result.getDate() + (6 - dayOfWeek));
        result.setHours(23, 59, 59, 999);
        break;
      case "day":
        result.setHours(23, 59, 59, 999);
        break;
      case "hour":
        result.setMinutes(59, 59, 999);
        break;
      case "minute":
        result.setSeconds(59, 999);
        break;
      case "second":
        result.setMilliseconds(999);
        break;
    }
    
    return result;
  }

  isSame(a: Date, b: Date, unit: TimeUnitName): boolean {
    switch (unit) {
      case "year":
        return a.getFullYear() === b.getFullYear();
      case "month":
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
      case "week":
        const startA = this.startOf(a, "week");
        const startB = this.startOf(b, "week");
        return startA.getTime() === startB.getTime();
      case "day":
        return (
          a.getFullYear() === b.getFullYear() &&
          a.getMonth() === b.getMonth() &&
          a.getDate() === b.getDate()
        );
      case "hour":
        return this.isSame(a, b, "day") && a.getHours() === b.getHours();
      case "minute":
        return this.isSame(a, b, "hour") && a.getMinutes() === b.getMinutes();
      case "second":
        return this.isSame(a, b, "minute") && a.getSeconds() === b.getSeconds();
      default:
        return a.getTime() === b.getTime();
    }
  }

  isBefore(a: Date, b: Date): boolean {
    return a.getTime() < b.getTime();
  }

  isAfter(a: Date, b: Date): boolean {
    return a.getTime() > b.getTime();
  }

  eachInterval(start: Date, end: Date, unit: TimeUnitName): Date[] {
    const result: Date[] = [];
    let current = new Date(start);
    
    while (current.getTime() <= end.getTime()) {
      result.push(new Date(current));
      
      switch (unit) {
        case "year":
          current = this.add(current, { years: 1 });
          break;
        case "month":
          current = this.add(current, { months: 1 });
          break;
        case "day":
          current = this.add(current, { days: 1 });
          break;
        default:
          // Prevent infinite loop
          return result;
      }
    }
    
    return result;
  }

}