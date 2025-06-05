<template>
  <div class="interactive-demo">
    <div class="demo-container border rounded-lg p-6 bg-white shadow-sm">
      <!-- Header -->
      <div class="text-center mb-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-2">
          {{ currentMonth.name.value }}
        </h3>
        <p class="text-gray-600">
          Selected: {{ selectedDate ? formatDate(selectedDate) : "None" }}
        </p>
      </div>

      <!-- Month Navigation -->
      <div class="flex justify-center items-center space-x-4 mb-6">
        <button
          @click="currentMonth.past()"
          class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          ← Previous
        </button>

        <button
          @click="jumpToToday"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Today
        </button>

        <button
          @click="currentMonth.future()"
          class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Next →
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="max-w-sm mx-auto">
        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div
            v-for="day in weekdays"
            :key="day"
            class="p-2 text-center text-sm font-medium text-gray-500"
          >
            {{ day }}
          </div>
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="day in calendarDays"
            :key="day.date.getTime()"
            @click="selectDate(day.date)"
            class="aspect-square p-2 text-sm rounded transition-all duration-200"
            :class="getDayClasses(day)"
          >
            {{ day.date.getDate() }}
          </button>
        </div>
      </div>

      <!-- Selected Date Info -->
      <div
        v-if="selectedDate"
        class="mt-6 bg-blue-50 rounded-lg p-4 text-center"
      >
        <h4 class="font-medium text-blue-900 mb-2">Selected Date Details</h4>
        <div class="space-y-1 text-sm text-blue-800">
          <p><strong>Day:</strong> {{ selectedDayInfo?.name.value }}</p>
          <p><strong>Week:</strong> {{ selectedWeekInfo?.name.value }}</p>
          <p><strong>Month:</strong> {{ selectedMonthInfo?.name.value }}</p>
          <p>
            <strong>Is Today:</strong>
            {{ selectedDayInfo?.isNow.value ? "Yes" : "No" }}
          </p>
        </div>
      </div>
    </div>

    <!-- Code Example -->
    <div class="mt-6 bg-gray-900 rounded-lg p-4">
      <h4 class="text-white font-medium mb-3">Code Example</h4>
      <pre
        class="text-green-400 text-sm overflow-x-auto"
      ><code>const pickle = usePickle({ date: new Date() });
const month = useMonth(pickle);
const days = pickle.divide(month, 'day');

// Navigate months
month.past();   // Previous month
month.future(); // Next month

// Days automatically update
console.log(days.length); // {{ monthDays.length }} days</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { usePickle } from "../../../src/use/usePickle";
import useMonth from "../../../src/use/useMonth";
import useDay from "../../../src/use/useDay";
import useWeek from "../../../src/use/useWeek";

const pickle = usePickle({
  date: new Date(),
  now: new Date(),
  locale: "en-US",
});

const currentMonth = useMonth(pickle);
const selectedDate = ref(null);

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Get all days in the current month using divide()
const monthDays = computed(() => pickle.divide(currentMonth, "day"));

// Get all days including padding for calendar grid
const calendarDays = computed(() => {
  const days = monthDays.value;
  if (!days.length) return [];

  const firstDay = days[0].raw.value;
  const lastDay = days[days.length - 1].raw.value;

  const startOfWeek = new Date(firstDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const endOfWeek = new Date(lastDay);
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));

  const calendarDays = [];
  const current = new Date(startOfWeek);

  while (current <= endOfWeek) {
    calendarDays.push({
      date: new Date(current),
      isCurrentMonth: current.getMonth() === firstDay.getMonth(),
      isToday: isToday(current),
      isSelected:
        selectedDate.value &&
        current.getTime() === selectedDate.value.getTime(),
    });
    current.setDate(current.getDate() + 1);
  }

  return calendarDays;
});

// Selected date details using individual pickles
const selectedDayInfo = computed(() => {
  if (!selectedDate.value) return null;
  const dayPickle = usePickle({
    date: selectedDate.value,
    now: new Date(),
    locale: "en-US",
  });
  return useDay(dayPickle);
});

const selectedWeekInfo = computed(() => {
  if (!selectedDate.value) return null;
  const weekPickle = usePickle({
    date: selectedDate.value,
    now: new Date(),
    locale: "en-US",
  });
  return useWeek(weekPickle);
});

const selectedMonthInfo = computed(() => {
  if (!selectedDate.value) return null;
  const monthPickle = usePickle({
    date: selectedDate.value,
    now: new Date(),
    locale: "en-US",
  });
  return useMonth(monthPickle);
});

const selectDate = (date) => {
  selectedDate.value = date;
};

const jumpToToday = () => {
  pickle.picked.value = new Date();
  selectedDate.value = new Date();
};

const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getDayClasses = (day) => {
  const classes = [];

  if (!day.isCurrentMonth) {
    classes.push("text-gray-300 cursor-not-allowed");
  } else {
    classes.push("hover:bg-blue-100 cursor-pointer");

    if (day.isToday) {
      classes.push("bg-blue-500 text-white font-bold");
    } else if (day.isSelected) {
      classes.push("bg-blue-200 text-blue-900 font-medium");
    } else {
      classes.push("text-gray-700");
    }
  }

  return classes.join(" ");
};
</script>

<style scoped>
.interactive-demo {
  margin: 2rem 0;
}
</style>
