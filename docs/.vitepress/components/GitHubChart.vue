<template>
  <div class="github-chart my-8">
    <div class="demo-container border rounded-lg p-6 bg-white shadow-sm">
      <div class="text-center mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">
          GitHub-Style Contribution Chart
        </h3>
        <p class="text-sm text-gray-600">
          Built with useTemporal's divide() pattern -
          {{ totalContributions }} contributions in {{ currentYear.name.value }}
        </p>
      </div>

      <!-- Year Navigation -->
      <div class="flex justify-center items-center space-x-4 mb-6">
        <button
          @click="currentYear.past()"
          class="px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          ← {{ currentYear.raw.value.getFullYear() - 1 }}
        </button>

        <div class="text-center">
          <div class="text-base font-semibold">
            {{ currentYear.name.value }}
          </div>
          <div class="text-xs text-gray-500">
            {{ yearDays.length }} days tracked
          </div>
        </div>

        <button
          @click="currentYear.future()"
          class="px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          {{ currentYear.raw.value.getFullYear() + 1 }} →
        </button>
      </div>

      <!-- Contribution Chart Table -->
      <div class="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200">
        <table
          class="mx-auto border-separate"
          style="
            border-spacing: 3px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
              sans-serif;
            font-size: 11px;
          "
          role="img"
          :aria-label="`GitHub-style contribution chart for ${currentYear.name.value}`"
        >
          <!-- Month Headers -->
          <thead>
            <tr>
              <th
                class="w-12 border-none bg-transparent p-0 m-0"
                scope="col"
                style="
                  border: none !important;
                  background: transparent !important;
                  padding: 0 !important;
                "
              ></th>
              <th
                v-for="month in monthHeaders"
                :key="month.name"
                :colspan="month.weeks"
                class="text-left text-gray-600 font-medium align-bottom border-none bg-transparent p-0 m-0"
                style="
                  font-size: 10px;
                  font-weight: 500;
                  border: none !important;
                  background: transparent !important;
                  padding: 0 !important;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                "
                scope="col"
              >
                {{ month.name }}
              </th>
            </tr>
          </thead>

          <!-- Days Grid -->
          <tbody>
            <tr v-for="(dayName, dayIndex) in weekdayNames" :key="dayName">
              <!-- <th
                class="w-12 text-right text-gray-600 font-normal align-middle border-none bg-transparent p-0 m-0"
                style="
                  font-size: 10px;
                  border: none !important;
                  background: transparent !important;
                  padding: 0 2px 0 0 !important;
                "
                scope="row"
              >
                {{ dayName }}
              </th> -->
              <td
                v-for="(day, weekIndex) in getWeekDays(dayIndex)"
                :key="`${dayIndex}-${weekIndex}`"
                class="text-center align-middle border-none bg-transparent p-0 m-0"
                style="
                  border: none !important;
                  background: transparent !important;
                  padding: 0 !important;
                "
                :title="day ? getTooltip(day) : ''"
                @click="day && selectDay(day)"
                @mouseenter="day && (hoverDay = day)"
                @mouseleave="hoverDay = null"
              >
                <div
                  v-if="day"
                  class="w-3 h-3 rounded-sm cursor-pointer transition-all duration-150 border block hover:scale-110 hover:shadow-sm focus:outline-blue-500 focus:outline-2 focus:outline-offset-2"
                  :class="getContributionClasses(day.contributions)"
                ></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Legend -->
      <div class="flex items-center justify-between text-xs">
        <div class="text-gray-600">
          Less
          <div class="inline-flex space-x-1">
            <div class="w-3 h-3 bg-gray-100 border rounded-sm"></div>
            <div class="w-3 h-3 bg-green-100 rounded-sm"></div>
            <div class="w-3 h-3 bg-green-300 rounded-sm"></div>
            <div class="w-3 h-3 bg-green-500 rounded-sm"></div>
            <div class="w-3 h-3 bg-green-700 rounded-sm"></div>
          </div>
          More
        </div>

        <button
          @click="generateNewData"
          class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Generate New Data
        </button>
      </div>

      <!-- Selected Day Info -->
      <div v-if="selectedDay" class="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 class="font-medium text-blue-900 mb-1 text-sm">
          {{ formatDate(selectedDay.date) }}
        </h4>
        <p class="text-xs text-blue-800">
          {{ selectedDay.contributions }} contributions on this day
        </p>
      </div>

      <!-- Hover Tooltip -->
      <div v-if="hoverDay" class="mt-2 text-xs text-gray-600 text-center">
        {{ getTooltip(hoverDay) }}
      </div>
    </div>

    <!-- Code Example -->
    <div class="mt-6 bg-gray-900 rounded-lg p-4">
      <h4 class="text-white font-medium mb-3 text-sm">How It's Built</h4>
      <pre
        class="text-green-400 text-xs overflow-x-auto"
      ><code>const pickle = usePickle({ date: new Date() });
const year = useYear(pickle);

// Get all days in the year using divide()
const yearDays = pickle.divide(year, 'day'); // {{ yearDays.length }} days

// Group into months for organization
const yearMonths = pickle.divide(year, 'month'); // {{ yearMonths.length }} months

// Each day has contribution data
yearDays.forEach(day => {
  day.contributions = generateContributions(day.raw.value);
});</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { usePickle } from "../../../src/use/usePickle";
import useYear from "../../../src/use/useYear";

const pickle = usePickle({
  date: new Date(),
  now: new Date(),
  locale: "en-US",
});

const currentYear = useYear(pickle);
const selectedDay = ref(null);
const hoverDay = ref(null);

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Get all days and months using divide()
const yearDays = computed(() => pickle.divide(currentYear, "day"));
const yearMonths = computed(() => pickle.divide(currentYear, "month"));

// Generate random contribution data
const contributionData = ref(new Map());

const generateContributions = (date) => {
  const key = date.toDateString();
  if (!contributionData.value.has(key)) {
    // Generate realistic contribution patterns
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseChance = isWeekend ? 0.3 : 0.7;

    // Higher activity in certain months (simulate coding projects)
    const month = date.getMonth();
    const projectMonths = [2, 5, 9]; // March, June, October
    const monthMultiplier = projectMonths.includes(month) ? 1.5 : 1;

    const random = Math.random() * monthMultiplier;
    let contributions = 0;

    if (random < 0.4) contributions = 0;
    else if (random < 0.6) contributions = Math.floor(Math.random() * 3) + 1;
    else if (random < 0.8) contributions = Math.floor(Math.random() * 6) + 4;
    else if (random < 0.95) contributions = Math.floor(Math.random() * 10) + 7;
    else contributions = Math.floor(Math.random() * 15) + 15;

    contributionData.value.set(key, contributions);
  }
  return contributionData.value.get(key);
};

// Create grid organized by weeks
const weeklyGrid = computed(() => {
  const days = yearDays.value;
  if (!days.length) return [];

  // Start from the first Sunday of the year (or before)
  const firstDay = days[0].raw.value;
  const startOfGrid = new Date(firstDay);
  startOfGrid.setDate(startOfGrid.getDate() - startOfGrid.getDay());

  // End on the last Saturday of the year (or after)
  const lastDay = days[days.length - 1].raw.value;
  const endOfGrid = new Date(lastDay);
  endOfGrid.setDate(endOfGrid.getDate() + (6 - endOfGrid.getDay()));

  const weeks = [];
  const current = new Date(startOfGrid);

  while (current <= endOfGrid) {
    const week = [];

    // Fill the week (7 days)
    for (let i = 0; i < 7; i++) {
      const date = new Date(current);
      const isCurrentYear = date.getFullYear() === firstDay.getFullYear();

      week.push(
        isCurrentYear
          ? {
              date,
              contributions: generateContributions(date),
              isCurrentYear: true,
            }
          : null
      );

      current.setDate(current.getDate() + 1);
    }

    weeks.push(week);
  }

  return weeks;
});

// Calculate month headers with proper colspans
const monthHeaders = computed(() => {
  const grid = weeklyGrid.value;
  if (!grid.length) return [];

  const headers = [];
  const monthWeeksMap = new Map();

  // Count weeks for each month
  grid.forEach((week, weekIndex) => {
    const firstCurrentYearDay = week.find((day) => day?.isCurrentYear);
    if (firstCurrentYearDay) {
      const month = firstCurrentYearDay.date.getMonth();
      if (!monthWeeksMap.has(month)) {
        monthWeeksMap.set(month, []);
      }
      monthWeeksMap.get(month).push(weekIndex);
    }
  });

  // Convert to headers with colspans
  Array.from(monthWeeksMap.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([monthIndex, weekIndices]) => {
      const monthData = yearMonths.value[monthIndex];
      if (monthData && weekIndices.length > 0) {
        headers.push({
          name: monthData.name.value.slice(0, 3),
          weeks: weekIndices.length,
        });
      }
    });

  return headers;
});

// Get days for a specific weekday across all weeks
const getWeekDays = (dayIndex) => {
  return weeklyGrid.value.map((week) => week[dayIndex]);
};

const totalContributions = computed(() => {
  return weeklyGrid.value
    .flat()
    .filter((day) => day?.isCurrentYear)
    .reduce((sum, day) => sum + (day?.contributions || 0), 0);
});

const getContributionClasses = (contributions) => {
  const baseClasses = "border-gray-200";

  if (contributions === 0) return `bg-gray-100 ${baseClasses}`;
  if (contributions <= 3) return `bg-green-200 ${baseClasses}`;
  if (contributions <= 6) return `bg-green-400 ${baseClasses}`;
  if (contributions <= 12) return `bg-green-600 ${baseClasses}`;
  return `bg-green-800 ${baseClasses}`;
};

const selectDay = (day) => {
  selectedDay.value = day;
};

const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getTooltip = (day) => {
  const contributions = day.contributions;
  const date = day.date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (contributions === 0) {
    return `No contributions on ${date}`;
  } else if (contributions === 1) {
    return `1 contribution on ${date}`;
  } else {
    return `${contributions} contributions on ${date}`;
  }
};

const generateNewData = () => {
  contributionData.value.clear();
  // Force reactivity by updating the year slightly
  const currentDate = pickle.picked.value;
  pickle.picked.value = new Date(currentDate.getTime() + 1);
  pickle.picked.value = currentDate;
};
</script>
