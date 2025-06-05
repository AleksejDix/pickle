// useTemporal - Hierarchical time composables for Vue 3
// Export all types
export type {
  TimeSpan,
  Event,
  TimeUnit,
  ExtendedTimeUnit,
  UsePickleOptions,
  UseTimeUnitOptions,
  UseDatePickerOptions,
  PickleCore,
  TimeUnitType,
  DatePickerProps,
  PickleGridProps,
  PickleCellProps,
  PickleUnitProps,
  DatePickerEmits,
  PickleGridEmits,
  PickleUnitEmits,
  DateOrRef,
  StringOrRef,
  NumberOrRef,
  TimeBoxOptions,
  TimeBoxUnit,
  TimeBoxWeek,
  TimeBox,
  TimeBoxMonth,
  TimeUnitComposable,
  DateFormatter,
  TimeUnitDivider,
  LocaleOptions,
} from "./types";

// Export core composables - the heart of useTemporal
export { usePickle } from "./use/usePickle";
export { default as useDatePicker } from "./use/useDatePicker";
export { default as useTimeBox } from "./use/useTimeBox";

// Export hierarchical time unit composables
export { default as useMillennium } from "./use/useMillenium";
export { default as useCentury } from "./use/useCentury";
export { default as useDecade } from "./use/useDecade";
export { default as useYear } from "./use/useYear";
export { default as useYearQuarter } from "./use/useYearQuarter";
export { default as useMonth } from "./use/useMonth";
export { default as useWeek } from "./use/useWeek";
export { default as useDay } from "./use/useDay";
export { default as useHour } from "./use/useHour";
export { default as useHourQuarter } from "./use/useHourQuarter";
export { default as useMinute } from "./use/useMinute";

// Export utility composables
export { default as useCurrentDateTime } from "./use/useCurrentDateTime";

// Export components (for those who want to use them directly)
export { default as DatePicker } from "./components/DatePicker.vue";
export { default as Picky } from "./components/Picky.vue";
export { default as GitHubChart } from "./components/GitHubChart.vue";
export { default as PickleGrid } from "./components/PickleGrid.vue";
export { default as PickleCell } from "./components/PickleCell.vue";
export { default as PickleUnit } from "./components/PickleUnit.vue";
export { default as Converter } from "./components/Converter.vue";
export { default as Month } from "./components/Month.vue";
export { default as Week } from "./components/Week.vue";

// Export utility functions
export { same } from "./use/usePickle";

// Default export for convenience - the main useTemporal composable
export { usePickle as default } from "./use/usePickle";
export { usePickle as useTemporal } from "./use/usePickle";
