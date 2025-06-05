<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-5xl font-extrabold text-gray-900 mb-4">
          useTemporal ⏰
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Revolutionary hierarchical time composables for Vue 3
        </p>
        <p class="text-lg text-gray-500 mt-2">
          Experience the power of the
          <code class="bg-gray-100 px-2 py-1 rounded font-mono">divide()</code>
          pattern
        </p>
      </header>

      <!-- Interactive Demo Tabs -->
      <div class="mb-8">
        <div class="flex justify-center space-x-2 mb-8">
          <button
            v-for="demo in demos"
            :key="demo.id"
            @click="currentDemo = demo.id"
            class="px-6 py-3 rounded-lg font-medium transition-all"
            :class="
              currentDemo === demo.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            "
          >
            {{ demo.name }}
          </button>
        </div>
      </div>

      <!-- Demo Content -->
      <div class="bg-white rounded-lg shadow-xl p-8 mb-8">
        <div v-if="currentDemo === 'basic'" class="space-y-8">
          <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">
              Basic Time Navigation
            </h2>
            <p class="text-gray-600">
              Navigate through different time scales using the same interface
            </p>
          </div>

          <!-- Year Demo -->
          <div class="border rounded-lg p-6">
            <h3 class="text-xl font-semibold mb-4">Year Level</h3>
            <div class="flex items-center justify-between mb-4">
              <button
                @click="year.past()"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                ← Previous Year
              </button>
              <div class="text-center">
                <div class="text-2xl font-bold">{{ year.name.value }}</div>
                <div class="text-sm text-gray-500">
                  {{ year.isNow.value ? "Current Year" : "Not Current" }}
                </div>
              </div>
              <button
                @click="year.future()"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Next Year →
              </button>
            </div>

            <div class="mt-6">
              <h4 class="font-medium mb-2">Months in {{ year.name.value }}:</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                <div
                  v-for="month in months"
                  :key="month.name.value"
                  @click="selectMonth(month)"
                  class="p-3 rounded cursor-pointer transition-colors text-center"
                  :class="
                    month.isNow.value
                      ? 'bg-blue-100 border-2 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  "
                >
                  <div class="font-medium">
                    {{ month.name.value.split(" ")[0] }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ month.number.value }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Month Demo -->
          <div class="border rounded-lg p-6">
            <h3 class="text-xl font-semibold mb-4">Month Level</h3>
            <div class="flex items-center justify-between mb-4">
              <button
                @click="selectedMonth.past()"
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                ← Previous Month
              </button>
              <div class="text-center">
                <div class="text-2xl font-bold">
                  {{ selectedMonth.name.value }}
                </div>
                <div class="text-sm text-gray-500">
                  {{
                    selectedMonth.isNow.value ? "Current Month" : "Not Current"
                  }}
                </div>
              </div>
              <button
                @click="selectedMonth.future()"
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Next Month →
              </button>
            </div>

            <div class="mt-6">
              <h4 class="font-medium mb-2">
                Days in {{ selectedMonth.name.value }}:
              </h4>
              <div class="grid grid-cols-7 gap-1">
                <!-- Weekday headers -->
                <div
                  v-for="day in [
                    'Sun',
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat',
                  ]"
                  :key="day"
                  class="p-2 text-center text-sm font-medium text-gray-500"
                >
                  {{ day }}
                </div>
                <!-- Calendar days -->
                <div
                  v-for="day in monthDays"
                  :key="day.raw.value.getTime()"
                  class="aspect-square p-1 text-center rounded cursor-pointer transition-colors flex items-center justify-center"
                  :class="
                    day.isNow.value
                      ? 'bg-green-100 border-2 border-green-300 font-bold'
                      : 'hover:bg-gray-100'
                  "
                >
                  {{ day.raw.value.getDate() }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hierarchy Demo -->
        <div v-if="currentDemo === 'hierarchy'" class="space-y-6">
          <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">
              Time Hierarchy
            </h2>
            <p class="text-gray-600">
              See how all time units stay synchronized automatically
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <div
              v-for="(unit, scale) in hierarchyUnits"
              :key="scale"
              class="border rounded-lg p-4"
            >
              <h3 class="text-lg font-semibold mb-3 capitalize">{{ scale }}</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Name:</span>
                  <span class="font-medium">{{ unit.name.value }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Number:</span>
                  <span class="font-medium">{{ unit.number.value }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Is Current:</span>
                  <span
                    class="font-medium"
                    :class="
                      unit.isNow.value ? 'text-green-600' : 'text-gray-400'
                    "
                  >
                    {{ unit.isNow.value ? "Yes" : "No" }}
                  </span>
                </div>
                <div class="flex space-x-2 mt-3">
                  <button
                    @click="unit.past()"
                    class="flex-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    ←
                  </button>
                  <button
                    @click="unit.future()"
                    class="flex-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center">
            <button
              @click="resetToNow"
              class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Reset All to Now
            </button>
          </div>
        </div>

        <!-- divide() Pattern Demo -->
        <div v-if="currentDemo === 'divide'" class="space-y-6">
          <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">
              The divide() Pattern
            </h2>
            <p class="text-gray-600">
              See how any time unit can be divided into smaller units
            </p>
          </div>

          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Current Year → Months</h3>
            <div class="mb-4">
              <code class="bg-gray-800 text-green-400 px-4 py-2 rounded block">
                const months = pickle.divide(year, 'month'); //
                {{ months.length }} months
              </code>
            </div>
            <div class="grid grid-cols-4 md:grid-cols-6 gap-2">
              <div
                v-for="month in months"
                :key="month.number.value"
                class="p-2 bg-white rounded text-center text-sm"
                :class="month.isNow.value ? 'bg-blue-100 font-bold' : ''"
              >
                {{ month.name.value.split(" ")[0] }}
              </div>
            </div>
          </div>

          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Current Month → Days</h3>
            <div class="mb-4">
              <code class="bg-gray-800 text-green-400 px-4 py-2 rounded block">
                const days = pickle.divide(month, 'day'); //
                {{ monthDays.length }} days
              </code>
            </div>
            <div class="grid grid-cols-7 gap-1">
              <div
                v-for="day in monthDays.slice(0, 14)"
                :key="day.number.value"
                class="aspect-square p-1 bg-white rounded text-center text-sm flex items-center justify-center"
                :class="day.isNow.value ? 'bg-green-100 font-bold' : ''"
              >
                {{ day.raw.value.getDate() }}
              </div>
            </div>
            <div
              v-if="monthDays.length > 14"
              class="text-center mt-2 text-gray-500"
            >
              ... and {{ monthDays.length - 14 }} more days
            </div>
          </div>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="grid md:grid-cols-3 gap-8 mb-8">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">
            🧩 Hierarchical Design
          </h3>
          <p class="text-gray-600 mb-4">
            Every time scale uses the same consistent interface. Learn once, use
            everywhere.
          </p>
          <code class="text-sm bg-gray-100 p-2 rounded block">
            year.past() === month.past()
          </code>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">
            ⚡ Revolutionary divide()
          </h3>
          <p class="text-gray-600 mb-4">
            Divide any time unit into smaller units with perfect
            synchronization.
          </p>
          <code class="text-sm bg-gray-100 p-2 rounded block">
            pickle.divide(year, 'month')
          </code>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">
            🔄 Reactive by Design
          </h3>
          <p class="text-gray-600 mb-4">
            Built on Vue 3 reactivity. Changes propagate automatically
            everywhere.
          </p>
          <code class="text-sm bg-gray-100 p-2 rounded block">
            watch(year, updateUI)
          </code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  createTemporal,
  useYear,
  useMonth,
  useDay,
  useHour,
} from "usetemporal";

// Core pickle instance
const pickle = createTemporal({
  date: new Date(),
  now: new Date(),
  locale: "en-US",
});

// Demo state
const demos = [
  { id: "basic", name: "🚀 Basic Demo" },
  { id: "hierarchy", name: "🌳 Hierarchy" },
  { id: "divide", name: "🔄 divide() Pattern" },
];
const currentDemo = ref("basic");

// Time units
const year = useYear(pickle);
const selectedMonth = useMonth(pickle);

// Derived data using divide() pattern
const months = pickle.divide(year, "month");
const monthDays = pickle.divide(selectedMonth, "day");

// Hierarchy demo units
const hierarchyUnits = computed(() => ({
  year: useYear(pickle),
  month: useMonth(pickle),
  day: useDay(pickle),
  hour: useHour(pickle),
}));

// Methods
const selectMonth = (month: any) => {
  pickle.picked.value = month.raw.value;
};

const resetToNow = () => {
  pickle.picked.value = new Date();
  pickle.now.value = new Date();
};
</script>

<style>
html {
  @apply bg-gray-900 text-gray-500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
