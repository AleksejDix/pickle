<template>
  <div class="interactive-demo">
    <div class="demo-container border rounded-lg p-6 bg-white shadow-sm">
      <!-- Scale Selector -->
      <div class="text-center mb-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">
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
      <div class="text-center mb-6">
        <h4 class="text-lg font-medium text-gray-800">
          {{ currentUnit.name.value }}
        </h4>
        <p class="text-gray-600">{{ currentScale }} view</p>
      </div>

      <!-- Navigation -->
      <div class="flex justify-center items-center space-x-4 mb-6">
        <button
          @click="currentUnit.past()"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          ← Previous
        </button>

        <button
          @click="goToNow"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Go to Now
        </button>

        <button
          @click="currentUnit.future()"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Next →
        </button>
      </div>

      <!-- Subdivisions Grid -->
      <div class="max-w-6xl mx-auto">
        <div
          v-if="subdivisions.length > 0"
          class="grid gap-2"
          :class="getGridClasses()"
        >
          <div
            v-for="(subdivision, index) in subdivisions"
            :key="index"
            @click="zoomIn(subdivision)"
            class="border rounded-lg cursor-pointer transition-all hover:shadow-md relative"
            :class="getSubdivisionClasses(subdivision)"
            :style="getSubdivisionStyle(subdivision)"
          >
            <div class="text-center p-2">
              <div class="font-medium" :class="getLabelClasses()">
                {{ getSubdivisionLabel(subdivision) }}
              </div>
              <div
                v-if="currentScale === 'month'"
                class="text-xs text-gray-400 mt-1"
              >
                {{ getDayName(subdivision) }}
              </div>
              <div
                v-if="subdivision.isNow.value"
                class="text-xs font-medium mt-1 text-blue-600"
              >
                Now
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state for hour scale -->
        <div
          v-else-if="currentScale === 'hour'"
          class="text-center py-8 text-gray-500"
        >
          <p>Hour view shows the current hour in detail.</p>
          <p class="text-sm mt-2">
            Use navigation buttons to explore different hours.
          </p>
        </div>

        <!-- Generic empty state -->
        <div v-else class="text-center py-8 text-gray-500">
          <p>No subdivisions available for this scale.</p>
        </div>
      </div>

      <!-- Info Panel -->
      <div class="mt-6 bg-gray-50 rounded-lg p-4">
        <h5 class="font-medium text-gray-800 mb-3">Current View Information</h5>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Scale:</span>
              <span class="font-medium capitalize">{{ currentScale }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Current {{ currentScale }}:</span>
              <span class="font-medium">{{
                currentUnit.isNow.value ? "Yes" : "No"
              }}</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Subdivisions:</span>
              <span class="font-medium">
                {{
                  subdivisions.length > 0
                    ? `${subdivisions.length} ${nextScale}s`
                    : "None shown"
                }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600"
                >{{
                  currentScale === "day"
                    ? "Day"
                    : currentScale === "hour"
                    ? "Hour"
                    : "Number"
                }}:</span
              >
              <span class="font-medium">{{ currentUnit.number.value }}</span>
            </div>
          </div>
        </div>

        <!-- Scale-specific information -->
        <div class="mt-4 pt-3 border-t border-gray-200">
          <div class="text-xs text-gray-500">
            <template v-if="currentScale === 'year'">
              Click any month to zoom into that month's daily view
            </template>
            <template v-else-if="currentScale === 'month'">
              Click any day to zoom into that day's hourly view
            </template>
            <template v-else-if="currentScale === 'day'">
              Click any hour to zoom into that time period
            </template>
            <template v-else>
              Use navigation buttons to explore different time periods
            </template>
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
const {{ currentScale }} = use{{ currentScale.charAt(0).toUpperCase() + currentScale.slice(1) }}(pickle);

// The revolutionary divide() pattern
const {{ nextScale }}s = pickle.divide({{ currentScale }}, '{{ nextScale }}');
console.log({{ nextScale }}s.length); // {{ subdivisions.length }} {{ nextScale }}s

// Navigate through time
{{ currentScale }}.past();   // Previous {{ currentScale }}
{{ currentScale }}.future(); // Next {{ currentScale }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
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

const scales = ["year", "month", "day", "hour"];
const currentScale = ref("month");

const scaleToNextScale = {
  year: "month",
  month: "day",
  day: "hour",
  hour: "minute",
};

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
  // Only show subdivisions if the next scale is valid and not minutes
  if (next === "minute" || !next) return [];

  try {
    const result = pickle.divide(currentUnit.value, next);
    return result || [];
  } catch (error) {
    console.warn(`Could not divide ${currentScale.value} into ${next}:`, error);
    return [];
  }
});

const getGridClasses = () => {
  switch (currentScale.value) {
    case "year":
      return "grid-cols-3 md:grid-cols-4"; // months (12 items)
    case "month":
      return "grid-cols-7"; // days (28-31 items)
    case "day":
      return "grid-cols-4 md:grid-cols-6 lg:grid-cols-8"; // hours (24 items)
    case "hour":
      return "grid-cols-5 md:grid-cols-6 lg:grid-cols-10"; // minutes (60 items)
    default:
      return "grid-cols-7";
  }
};

const getSubdivisionClasses = (subdivision) => {
  const classes = ["border-gray-200"];

  if (subdivision.isNow.value) {
    classes.push(
      "bg-blue-100 border-blue-300 text-blue-900 ring-2 ring-blue-200"
    );
  } else {
    classes.push("bg-white hover:bg-gray-50 hover:border-gray-300");
  }

  // Add scale-specific styling
  switch (currentScale.value) {
    case "year":
      classes.push("hover:shadow-lg");
      break;
    case "month":
      // Weekend styling for days
      if (subdivision.we && subdivision.we.value) {
        classes.push("bg-red-50 hover:bg-red-100");
      }
      break;
    case "day":
      classes.push("hover:shadow-md");
      break;
  }

  return classes.join(" ");
};

const getLabelClasses = () => {
  switch (currentScale.value) {
    case "year":
      return "text-sm"; // Month names
    case "month":
      return "text-lg"; // Day numbers
    case "day":
      return "text-sm"; // Hour times
    case "hour":
      return "text-xs"; // Minutes
    default:
      return "text-sm";
  }
};

const getSubdivisionStyle = (subdivision) => {
  // Add minimum height for better visual consistency
  switch (currentScale.value) {
    case "year":
      return { minHeight: "80px" }; // Month cards
    case "month":
      return { minHeight: "60px" }; // Day cards
    case "day":
      return { minHeight: "50px" }; // Hour cards
    default:
      return { minHeight: "40px" };
  }
};

const getDayName = (subdivision) => {
  // Extract weekday name for month view
  try {
    const date = subdivision.raw.value;
    return date.toLocaleDateString("en-US", { weekday: "short" });
  } catch {
    return "";
  }
};

const getSubdivisionLabel = (subdivision) => {
  switch (currentScale.value) {
    case "year":
      // For months, show abbreviated name
      return subdivision.name.value.split(" ")[0]; // "January 2024" -> "January"
    case "month":
      // For days, show day number
      return subdivision.number.value.toString();
    case "day":
      // For hours, show hour with AM/PM in a clean format
      const hour = subdivision.number.value;
      if (hour === 0) return "12 AM";
      if (hour < 12) return `${hour} AM`;
      if (hour === 12) return "12 PM";
      return `${hour - 12} PM`;
    case "hour":
      // For minutes, show minute number
      const minute = subdivision.number.value;
      return `${minute.toString().padStart(2, "0")}min`;
    default:
      return subdivision.name.value;
  }
};

const zoomIn = (subdivision) => {
  // Navigate to this subdivision's date
  pickle.picked.value = subdivision.raw.value;

  // Move to the next scale, but don't go beyond hour
  const currentIndex = scales.indexOf(currentScale.value);
  if (currentIndex < scales.length - 1) {
    currentScale.value = scales[currentIndex + 1];
  }
};

const goToNow = () => {
  pickle.picked.value = new Date();
};
</script>

<style scoped>
.interactive-demo {
  margin: 2rem 0;
}
</style>
