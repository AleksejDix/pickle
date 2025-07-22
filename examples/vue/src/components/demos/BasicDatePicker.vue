<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h3 class="text-2xl font-semibold text-gray-800 mb-2">
        {{ currentMonth.name }}
      </h3>
      <p class="text-gray-600">
        Selected: {{ selectedDate ? formatDate(selectedDate) : "None" }}
      </p>
    </div>

    <!-- Month Navigation -->
    <div class="flex justify-center items-center space-x-4">
      <button
        @click="currentMonth.past()"
        class="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
      >
        <svg
          class="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div class="flex space-x-2">
        <button
          @click="jumpToToday"
          class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      <button
        @click="currentMonth.future()"
        class="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
      >
        <svg
          class="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
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
          class="aspect-square p-2 text-sm rounded-lg transition-all duration-200"
          :class="getDayClasses(day)"
        >
          {{ day.date.getDate() }}
        </button>
      </div>
    </div>

    <!-- Selected Date Info -->
    <div v-if="selectedDate" class="bg-blue-50 rounded-lg p-4 text-center">
      <h4 class="font-medium text-blue-900 mb-2">Selected Date Details</h4>
      <div class="space-y-1 text-sm text-blue-800">
        <p><strong>Day:</strong> {{ selectedDayInfo.name }}</p>
        <p><strong>Week:</strong> {{ selectedWeekInfo.name }}</p>
        <p><strong>Month:</strong> {{ selectedMonthInfo.name }}</p>
        <p>
          <strong>Is Today:</strong> {{ selectedDayInfo.isNow ? "Yes" : "No" }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { usePickle } from "../../use/usePickle";
import useMonth from "../../use/useMonth";
import useDay from "../../use/useDay";
import useWeek from "../../use/useWeek";

const pickle = usePickle({ date: new Date() });
const currentMonth = useMonth(pickle);
const selectedDate = ref<Date | null>(null);

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Get all days in the current month plus padding days
const calendarDays = computed(() => {
  const monthDays = pickle.divide(currentMonth, "day");
  const firstDay = monthDays[0].raw.value;
  const lastDay = monthDays[monthDays.length - 1].raw.value;

  const startOfWeek = new Date(firstDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const endOfWeek = new Date(lastDay);
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));

  const days = [];
  const current = new Date(startOfWeek);

  while (current <= endOfWeek) {
    days.push({
      date: new Date(current),
      isCurrentMonth: current.getMonth() === firstDay.getMonth(),
      isToday: isToday(current),
      isSelected:
        selectedDate.value &&
        current.getTime() === selectedDate.value.getTime(),
    });
    current.setDate(current.getDate() + 1);
  }

  return days;
});

// Selected date details
const selectedDayInfo = computed(() => {
  if (!selectedDate.value) return null;
  const dayPickle = usePickle({ date: selectedDate.value });
  return useDay(dayPickle);
});

const selectedWeekInfo = computed(() => {
  if (!selectedDate.value) return null;
  const weekPickle = usePickle({ date: selectedDate.value });
  return useWeek(weekPickle);
});

const selectedMonthInfo = computed(() => {
  if (!selectedDate.value) return null;
  const monthPickle = usePickle({ date: selectedDate.value });
  return useMonth(monthPickle);
});

const selectDate = (date: Date) => {
  selectedDate.value = date;
};

const jumpToToday = () => {
  pickle.jumpTo(new Date());
  selectedDate.value = new Date();
};

const isToday = (date: Date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getDayClasses = (day: any) => {
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
