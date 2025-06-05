<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-blue-600">useTemporal</h1>
            <span class="text-sm text-gray-500">Interactive Demo</span>
          </div>

          <div class="flex space-x-4">
            <button
              v-for="demo in demos"
              :key="demo.id"
              @click="currentDemo = demo.id"
              class="px-4 py-2 rounded-md transition-colors"
              :class="
                currentDemo === demo.id
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              "
            >
              {{ demo.name }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Demo Description -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          {{ currentDemoInfo.name }}
        </h2>
        <p class="text-lg text-gray-600">{{ currentDemoInfo.description }}</p>
      </div>

      <!-- Demo Component -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <component :is="currentDemoComponent" />
      </div>

      <!-- Code Example -->
      <div class="mt-8 bg-gray-900 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Code Example</h3>
        <pre
          class="text-green-400 text-sm overflow-x-auto"
        ><code>{{ currentDemoInfo.code }}</code></pre>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import BasicDatePicker from "./demos/BasicDatePicker.vue";
import MultiScaleCalendar from "./demos/MultiScaleCalendar.vue";
import HierarchicalNavigation from "./demos/HierarchicalNavigation.vue";
import TimeComparison from "./demos/TimeComparison.vue";
import BusinessDashboard from "./demos/BusinessDashboard.vue";
import TimelineVisualizer from "./demos/TimelineVisualizer.vue";

const demos = [
  {
    id: "basic-picker",
    name: "Date Picker",
    description: "A reactive date picker built with useTemporal composables",
    component: BasicDatePicker,
    code: `const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);
const days = pickle.divide(month, 'day');

// Navigate months
month.past(); // Previous month
month.future(); // Next month`,
  },
  {
    id: "multi-scale",
    name: "Multi-Scale Calendar",
    description:
      "Seamlessly zoom between time scales (year → month → day → hour)",
    component: MultiScaleCalendar,
    code: `const scales = ['year', 'month', 'day', 'hour'];
const currentScale = ref('month');

const subdivisions = computed(() => {
  const unit = useTimeUnit(pickle, currentScale.value);
  return pickle.divide(unit, getNextScale(currentScale.value));
});`,
  },
  {
    id: "hierarchical-nav",
    name: "Hierarchical Navigation",
    description:
      "Navigate through time hierarchies with breadcrumbs and context",
    component: HierarchicalNavigation,
    code: `const hierarchy = [
  useYear(pickle),
  useMonth(pickle),
  useDay(pickle),
  useHour(pickle)
];

// All units stay synchronized automatically`,
  },
  {
    id: "time-comparison",
    name: "Time Comparison",
    description: "Compare different time periods side by side",
    component: TimeComparison,
    code: `const pickle1 = usePickle({ date: new Date('2024-01-01') });
const pickle2 = usePickle({ date: new Date('2024-06-01') });

const quarter1 = useQuarter(pickle1);
const quarter2 = useQuarter(pickle2);`,
  },
  {
    id: "business-dashboard",
    name: "Business Dashboard",
    description:
      "Real-world business application with fiscal quarters and metrics",
    component: BusinessDashboard,
    code: `const quarter = useQuarter(pickle, {
  fiscalYearStart: 'April'
});

const months = pickle.divide(quarter, 'month');
const workingDays = days.filter(day => isWorkingDay(day));`,
  },
  {
    id: "timeline",
    name: "Timeline Visualizer",
    description: "Interactive timeline with events and time range filtering",
    component: TimelineVisualizer,
    code: `const events = ref([...]);
const timeRange = ref({ start: ..., end: ... });

const visibleEvents = computed(() => 
  events.value.filter(event => 
    timeRange.value.contains(event.date)
  )
);`,
  },
];

const currentDemo = ref("basic-picker");

const currentDemoInfo = computed(
  () => demos.find((demo) => demo.id === currentDemo.value) ?? demos[0]
);

const currentDemoComponent = computed(() => currentDemoInfo.value.component);
</script>

<style scoped>
code {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
}
</style>
