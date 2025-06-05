<template>
  <div class="interactive-demo">
    <div class="demo-container border rounded-lg p-6 bg-white shadow-sm">
      <div class="text-center mb-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-2">
          Time Hierarchy Synchronization
        </h3>
        <p class="text-gray-600">
          Watch how all time units stay perfectly synchronized
        </p>
      </div>

      <!-- Control Panel -->
      <div class="flex justify-center space-x-4 mb-8">
        <button
          @click="resetToNow"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Reset to Now
        </button>
        <button
          @click="jumpToSpecificDate"
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Jump to 2025
        </button>
      </div>

      <!-- Time Units Grid -->
      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <div
          v-for="(unit, scale) in hierarchyUnits"
          :key="scale"
          class="border rounded-lg p-4 bg-gray-50"
        >
          <h4
            class="text-lg font-semibold mb-3 capitalize flex items-center justify-between"
          >
            {{ scale }}
            <span
              v-if="unit.isNow.value"
              class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
            >
              Current
            </span>
          </h4>

          <div class="space-y-2 text-sm">
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
                :class="unit.isNow.value ? 'text-green-600' : 'text-gray-400'"
              >
                {{ unit.isNow.value ? "Yes" : "No" }}
              </span>
            </div>
          </div>

          <div class="flex space-x-2 mt-4">
            <button
              @click="unit.past()"
              class="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              ← Past
            </button>
            <button
              @click="unit.future()"
              class="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Future →
            </button>
          </div>
        </div>
      </div>

      <!-- Demonstration of divide() pattern -->
      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="font-medium text-blue-900 mb-3">
          divide() Pattern in Action
        </h4>
        <div class="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-blue-700">Months in Year:</span>
            <span class="ml-2 font-medium">{{ yearMonths.length }}</span>
          </div>
          <div>
            <span class="text-blue-700">Days in Month:</span>
            <span class="ml-2 font-medium">{{ monthDays.length }}</span>
          </div>
          <div>
            <span class="text-blue-700">Hours in Day:</span>
            <span class="ml-2 font-medium">{{ dayHours.length }}</span>
          </div>
          <div>
            <span class="text-blue-700">All Auto-Update:</span>
            <span class="ml-2 font-medium text-green-600">✓ Yes</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Code Example -->
    <div class="mt-6 bg-gray-900 rounded-lg p-4">
      <h4 class="text-white font-medium mb-3">Code Example</h4>
      <pre
        class="text-green-400 text-sm overflow-x-auto"
      ><code>const pickle = usePickle({ date: new Date() });

// Create all time units from the same pickle
const year = useYear(pickle);
const month = useMonth(pickle);
const day = useDay(pickle);
const hour = useHour(pickle);

// They stay synchronized automatically!
year.future(); // All other units update to next year

// Use divide() to get subdivisions
const months = pickle.divide(year, 'month');   // {{ yearMonths.length }} months
const days = pickle.divide(month, 'day');      // {{ monthDays.length }} days
const hours = pickle.divide(day, 'hour');      // {{ dayHours.length }} hours</code></pre>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { usePickle } from "../../../src/use/usePickle";
import useYear from "../../../src/use/useYear";
import useMonth from "../../../src/use/useMonth";
import useDay from "../../../src/use/useDay";
import useHour from "../../../src/use/useHour";

const pickle = usePickle({
  date: new Date(),
  now: new Date(),
  locale: "en-US",
});

// All time units from the same pickle - they stay synchronized!
const hierarchyUnits = computed(() => ({
  year: useYear(pickle),
  month: useMonth(pickle),
  day: useDay(pickle),
  hour: useHour(pickle),
}));

// Demonstrate divide() pattern
const yearMonths = computed(() =>
  pickle.divide(hierarchyUnits.value.year, "month")
);
const monthDays = computed(() =>
  pickle.divide(hierarchyUnits.value.month, "day")
);
const dayHours = computed(() =>
  pickle.divide(hierarchyUnits.value.day, "hour")
);

const resetToNow = () => {
  pickle.picked.value = new Date();
  pickle.now.value = new Date();
};

const jumpToSpecificDate = () => {
  pickle.picked.value = new Date("2025-06-15T14:30:00");
};
</script>

<style scoped>
.interactive-demo {
  margin: 2rem 0;
}
</style>
