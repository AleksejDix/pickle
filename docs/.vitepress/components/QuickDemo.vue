<template>
  <div class="quick-demo">
    <div
      class="demo-container border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50"
    >
      <div class="text-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Try useTemporal Now</h3>
        <p class="text-sm text-gray-600">
          Experience the revolutionary divide() pattern
        </p>
      </div>

      <!-- Current Time Display -->
      <div class="text-center mb-4">
        <div class="text-xl font-bold text-blue-700">
          {{ currentMonth.name.value }}
        </div>
        <div class="text-sm text-gray-600">{{ daysInMonth.length }} days</div>
      </div>

      <!-- Navigation -->
      <div class="flex justify-center space-x-2 mb-4">
        <button
          @click="currentMonth.past()"
          class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          ← Prev
        </button>
        <button
          @click="goToNow"
          class="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Now
        </button>
        <button
          @click="currentMonth.future()"
          class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Next →
        </button>
      </div>

      <!-- Live Code Display -->
      <div class="bg-gray-900 rounded p-3 text-xs">
        <div class="text-green-400 font-mono">
          <div>const month = useMonth(pickle);</div>
          <div>const days = pickle.divide(month, 'day');</div>
          <div class="text-blue-300">
            // days.length = {{ daysInMonth.length }}
          </div>
        </div>
      </div>

      <!-- Current Status -->
      <div class="mt-3 text-center text-xs text-gray-600">
        {{ currentMonth.isNow.value ? "Current month" : "Not current month" }} •
        Month #{{ currentMonth.number.value }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { usePickle } from "../../../src/use/usePickle";
import useMonth from "../../../src/use/useMonth";

const pickle = usePickle({
  date: new Date(),
  now: new Date(),
  locale: "en-US",
});

const currentMonth = useMonth(pickle);

// Demonstrate the divide() pattern
const daysInMonth = computed(() => pickle.divide(currentMonth, "day"));

const goToNow = () => {
  pickle.picked.value = new Date();
};
</script>

<style scoped>
.quick-demo {
  margin: 1rem 0;
}
</style>
