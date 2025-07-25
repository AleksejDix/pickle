# Documentation Index

## Root Documents

### [Home](./index.md)
The useTemporal homepage featuring the library's philosophy, quick start guide, and core features overview.

## API

Complete API reference for useTemporal's functional architecture:

### [API Reference](./api/index.md)
The useTemporal API organized into Factory Functions, Operations, Utilities, Types, Composables, and Unit System.

### [Implementation Plan](./api/implementation-plan.md)
Detailed implementation roadmap for the useTemporal API architecture.

## API/Composables

Reactive composables for framework integration:

### [usePeriod](./api/composables/use-period.md)
Creates a reactive period that automatically updates based on the temporal instance's browsing state.

## API/Factory Functions

Core factory functions for creating temporal objects:

### [Factory Functions Overview](./api/factory-functions/index.md)
Factory functions are used to create temporal instances and period objects.

### [createTemporal](./api/factory-functions/create-temporal.md)
Creates a new temporal instance - the central controller for time operations in useTemporal.

### [createPeriod](./api/factory-functions/create-period.md)
Creates a period of a specific unit type using another period's date as reference.

### [createCustomPeriod](./api/factory-functions/create-custom-period.md)
Creates a custom period with arbitrary start and end dates.

### [toPeriod](./api/factory-functions/to-period.md)
Converts a date to a period of a specific unit type.

## API/Operations

Pure functional operations for time manipulation:

### [Operations Overview](./api/operations/index.md)
Operations are pure functions that work with Period objects to perform time calculations and transformations.

### [divide()](./api/operations/divide.md)
The revolutionary divide() function is the heart of useTemporal's unique time management pattern. It allows you to split any time period into smaller units with perfect synchronization and consistency.

### [contains](./api/operations/contains.md)
Check if a period contains a date or another period.

### [go](./api/operations/go.md)
Navigate forward or backward by multiple periods.

### [isSame](./api/operations/is-same.md)
Check if two periods represent the same time unit.

### [merge](./api/operations/merge.md)
Merge multiple periods into a single larger period.

### [next](./api/operations/next.md)
Navigate to the next period of the same type.

### [previous](./api/operations/previous.md)
Navigate to the previous period of the same type.

### [split](./api/operations/split.md)
Split a period into smaller units with flexible options.

## API/Types

TypeScript type definitions for type safety:

### [Types Overview](./api/types/index.md)
TypeScript type definitions for useTemporal.

### [API Verification Report](./api/types/API_VERIFICATION_REPORT.md)
Comprehensive verification report of the API type system and implementations.

### [Adapter](./api/types/adapter.md)
Date adapter interface for integrating different date libraries.

### [Period](./api/types/period.md)
The Period type represents a time span with a start and end date. It's the fundamental unit of time in useTemporal.

### [Temporal](./api/types/temporal.md)
The main temporal instance that manages time state and operations.

### [Unit](./api/types/unit.md)
Time unit types supported by useTemporal.

### [UnitRegistry](./api/types/unit-registry.md)
Type definitions for the extensible unit registry system.

## API/Unit System

Extensible unit system documentation:

### [Constants](./api/unit-system/constants.md)
Predefined constants for common time units and durations.

### [defineUnit](./api/unit-system/define-unit.md)
Define custom time units for specialized use cases.

### [getRegisteredUnits](./api/unit-system/get-registered-units.md)
Retrieve all registered time units in the system.

### [getUnitDefinition](./api/unit-system/get-unit-definition.md)
Get the definition details for a specific time unit.

### [hasUnit](./api/unit-system/has-unit.md)
Check if a time unit is registered in the system.

## API/Utilities

Utility functions for common date operations:

### [Utilities Overview](./api/utilities/index.md)
Utility functions for common date-related checks and operations.

### [isToday](./api/utilities/is-today.md)
Check if a period represents today.

### [isWeekday](./api/utilities/is-weekday.md)
Check if a date falls on a weekday (Monday-Friday).

### [isWeekend](./api/utilities/is-weekend.md)
Check if a date falls on a weekend (Saturday-Sunday).

## Examples

Practical examples and demonstrations:

### [Basic Usage](./examples/basic-usage.md)
Quick examples to get you started with useTemporal.

### [Calendar Examples](./examples/calendar.md)
Complete calendar implementations in different frameworks.

### [Stable Month Calendar](./examples/stable-month-calendar.md)
Implementation of a calendar with stable week rows across months.

## Examples/Basic

Basic usage examples:

### [Basic Examples](./examples/basic/index.md)
Simple examples demonstrating core useTemporal features.

## Examples/Calendars

Calendar implementation examples:

### [Calendar Examples Overview](./examples/calendars/index.md)
Complete calendar implementations using useTemporal's divide() pattern.

### [Calendar Grid](./examples/calendars/calendar-grid.md)
Building a flexible calendar grid component.

### [Mini Calendar](./examples/calendars/mini-calendar.md)
Compact calendar widget implementation.

### [Month Calendar](./examples/calendars/month-calendar.md)
Full-featured month view calendar.

### [Year Overview](./examples/calendars/year-overview.md)
Year-at-a-glance calendar implementation.

## Examples/Frameworks

Framework-specific integration examples:

### [Framework Examples](./examples/frameworks/index.md)
Examples for integrating useTemporal with popular frameworks.

### [React Calendar](./examples/frameworks/react-calendar.md)
Complete React calendar component using useTemporal.

### [React Integration](./examples/frameworks/react-integration.md)
Guide for integrating useTemporal with React applications.

### [Vue Calendar](./examples/frameworks/vue-calendar.md)
Vue.js calendar component implementation.

### [Vue Integration](./examples/frameworks/vue-integration.md)
Guide for integrating useTemporal with Vue applications.

## Examples/Recipes

Common patterns and solutions:

### [Recipes Overview](./examples/recipes/index.md)
Common patterns and solutions using useTemporal.

### [Business Days](./examples/recipes/business-days.md)
Working with business days and excluding weekends/holidays.

### [Business Time](./examples/recipes/business-time.md)
Handling business hours and working time calculations.

### [Date Range Picker](./examples/recipes/date-range-picker.md)
Building a date range selection component.

### [Time Slots](./examples/recipes/time-slots.md)
Managing time slots for scheduling and appointments.

## Guide

Comprehensive guides and tutorials:

### [What is useTemporal?](./guide/what-is-usetemporal.md)
Introduction to useTemporal and its revolutionary approach to time management.

### [Getting Started](./guide/getting-started.md)
Welcome to useTemporal! This guide provides a quick overview to get you up and running.

### [Installation](./guide/installation.md)
How to install and set up useTemporal in your project.

### [Core Concepts](./guide/core-concepts.md)
Understanding these core concepts will help you use useTemporal effectively.

### [First App](./guide/first-app.md)
Build your first application with useTemporal.

### [The divide() Pattern](./guide/divide-pattern.md)
The divide() pattern is the revolutionary core feature that sets useTemporal apart from every other date library. It enables hierarchical time subdivision with perfect synchronization between parent and child time units.

### [Operations](./guide/operations.md)
All operations in useTemporal are pure functions that work with Period objects.

### [Date Adapters](./guide/adapters.md)
useTemporal supports multiple date libraries through a simple adapter pattern.

### [TypeScript Support](./guide/typescript.md)
useTemporal is written in TypeScript and provides comprehensive type safety.

### [Reactive Time Units](./guide/reactive-time-units.md)
How useTemporal's reactive system automatically updates time periods.

### [Framework Agnostic](./guide/framework-agnostic.md)
Using useTemporal across different JavaScript frameworks.

### [Migration Guide](./guide/migration.md)
Migrating from other date libraries to useTemporal.

### [Performance](./guide/performance.md)
Performance considerations and optimization techniques.

### [Testing](./guide/testing.md)
Testing strategies for applications using useTemporal.

### [Troubleshooting](./guide/troubleshooting.md)
Common issues and their solutions.

## Guide/Advanced

Advanced topics and optimization:

### [Performance Optimization](./guide/advanced/performance-optimization.md)
Advanced techniques for optimizing performance in large-scale applications.

## Guide/Integrations

Framework and library integrations:

### [Integrations Overview](./guide/integrations/overview.md)
Guide to integrating useTemporal with various frameworks and libraries.

## Guide/Patterns

Design patterns and best practices:

### [Patterns Overview](./guide/patterns/overview.md)
Common patterns and best practices for using useTemporal.

### [Business Logic](./guide/patterns/business-logic.md)
Implementing business logic with time-based rules.

### [The divide() Pattern](./guide/patterns/divide-pattern.md)
Deep dive into the revolutionary divide() pattern.

### [Navigation](./guide/patterns/navigation.md)
Time navigation patterns and strategies.

### [Time Analysis](./guide/patterns/time-analysis.md)
Analyzing time data and generating insights.

## Resources

Additional resources and reference materials:

### [Calendar Systems History](./resources/calendar-systems-history.md)
Historical overview of different calendar systems worldwide.

### [Date Formats Worldwide](./resources/date-formats-worldwide.md)
Understanding international date format variations.

### [JavaScript Date Quirks](./resources/javascript-date-quirks.md)
Common pitfalls and quirks of JavaScript's Date object.

### [Timezones in Browsers](./resources/timezones-in-browsers.md)
How browsers handle timezones and related challenges.

### [Week Start Days](./resources/week-start-days.md)
The question "What day does the week start?" has a surprisingly complex answer that varies by culture, religion, and international standards. This variation creates interesting challenges for developers building international applications.