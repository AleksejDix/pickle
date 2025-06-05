<template>
  <div class="space-y-6">
    <!-- Scale Selector -->
    <div class="text-center">
      <h3 class="text-2xl font-semibold text-gray-800 mb-4">
        Multi-Scale Calendar
      </h3>
      <div class="flex justify-center space-x-2">
        <button
          v-for="scale in scales"
          :key="scale"
          @click="currentScale = scale"
          class="px-4 py-2 rounded-lg transition-colors"
          :class="
            currentScale === scale
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          "
        >
          {{ scale.charAt(0).toUpperCase() + scale.slice(1) }}
        </button>
      </div>
    </div>

    <!-- Current Unit Display -->
    <div class="text-center">
      <h4 class="text-xl font-medium text-gray-800">{{ currentUnit.name }}</h4>
      <p class="text-gray-600">{{ currentScale }} view</p>
    </div>

    <!-- Navigation -->
    <div class="flex justify-center items-center space-x-4">
      <button
        @click="currentUnit.past()"
        class="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
      >
        ← Previous
      </button>

      <button
        @click="goToNow"
        class="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
      >
        Go to Now
      </button>

      <button
        @click="currentUnit.future()"
        class="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
      >
        Next →
      </button>
    </div>

    <!-- Subdivisions Grid -->
    <div class="max-w-4xl mx-auto">
      <div class="grid gap-2" :class="getGridClasses()">
        <div
          v-for="subdivision in subdivisions"
          :key="subdivision.number"
          @click="zoomIn(subdivision)"
          class="p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md"
          :class="getSubdivisionClasses(subdivision)"
        >
          <div class="text-sm font-medium">
            {{ getSubdivisionLabel(subdivision) }}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ subdivision.isNow ? "Current" : "" }}
          </div>
        </div>
      </div>
    </div>

    <!-- Info Panel -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h5 class="font-medium text-gray-800 mb-2">Current View Info</h5>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Scale:</span>
          <span class="ml-2 font-medium">{{ currentScale }}</span>
        </div>
        <div>
          <span class="text-gray-600">Subdivisions:</span>
          <span class="ml-2 font-medium"
            >{{ subdivisions.length }} {{ nextScale }}s</span
          >
        </div>
        <div>
          <span class="text-gray-600">Current:</span>
          <span class="ml-2 font-medium">{{
            currentUnit.isNow ? "Yes" : "No"
          }}</span>
        </div>
        <div>
          <span class="text-gray-600">Number:</span>
          <span class="ml-2 font-medium">{{ currentUnit.number }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { usePickle } from "../../use/usePickle";
import useYear from "../../use/useYear";
import useMonth from "../../use/useMonth";
import useDay from "../../use/useDay";
import useHour from "../../use/useHour";

const pickle = usePickle({ date: new Date() });
const scales = ["year", "month", "day", "hour"] as const;
const currentScale = ref<(typeof scales)[number]>("month");

const scaleToNextScale = {
  year: "month",
  month: "day",
  day: "hour",
  hour: "minute",
} as const;

const nextScale = computed(
  () => scaleToNextScale[currentScale.value] || "minute"
);

const currentUnit = computed(() => {
  switch (currentScale.value) {
    case "year":
      return useYear(pickle);
    case "month":
      return useMonth(pickle);
    case "day":
      return useDay(pickle);
    case "hour":
      return useHour(pickle);
    default:
      return useMonth(pickle);
  }
});

const subdivisions = computed(() => {
  const next = nextScale.value;
  if (next === "minute") return []; // Don't show minutes for now
  return pickle.divide(currentUnit.value, next as any);
});

const getGridClasses = () => {
  switch (currentScale.value) {
    case "year":
      return "grid-cols-3 md:grid-cols-4"; // months
    case "month":
      return "grid-cols-7"; // days
    case "day":
      return "grid-cols-6 md:grid-cols-8"; // hours
    case "hour":
      return "grid-cols-6 md:grid-cols-10"; // minutes
    default:
      return "grid-cols-7";
  }
};

const getSubdivisionClasses = (subdivision: any) => {
  const classes = ["border-gray-200"];

  if (subdivision.isNow) {
    classes.push("bg-blue-100 border-blue-300 text-blue-800");
  } else {
    classes.push("bg-white hover:bg-gray-50");
  }

  return classes.join(" ");
};

const getSubdivisionLabel = (subdivision: any) => {
  switch (currentScale.value) {
    case "year":
      // For months, show abbreviated name
      return subdivision.name.split(" ")[0]; // "January 2024" -> "January"
    case "month":
      // For days, show day number
      return subdivision.number.toString();
    case "day":
      // For hours, show hour with AM/PM
      const hour = subdivision.number;
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}${ampm}`;
    default:
      return subdivision.name;
  }
};

const zoomIn = (subdivision: any) => {
  // Navigate to this subdivision's date
  pickle.date.value = subdivision.raw.value;

  // Move to the next scale
  const currentIndex = scales.indexOf(currentScale.value);
  if (currentIndex < scales.length - 1) {
    currentScale.value = scales[currentIndex + 1];
  }
};

const goToNow = () => {
  pickle.date.value = new Date();
};
</script>
