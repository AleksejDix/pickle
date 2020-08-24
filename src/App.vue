<template>
  <div class="bg-gray-100">
    <Picky />
    <Converter />
    <h1>{{ date }}</h1>
    <DatePicker v-model:date="date" :events="events" />
    <GitHubChart />
  </div>
</template>

<script>
import DatePicker from "./components/DatePicker"
import Picky from "./components/Picky"
import GitHubChart from "./components/GitHubChart"
import Converter from "./components/Converter"

export default {
  name: "App",
  components: {
    DatePicker,
    GitHubChart,
    Picky,
    Converter
  },
  data() {
    return {
      date: new Date("2020-05-20T21:00:00.000Z"),
      events: [
        {
          title: "Trip to Las Vegas",
          timespan: {
            start: new Date(2020, 4, 8),
            end: new Date(2020, 4, 20)
          }
        },
        {
          title: "Working on the side Project",
          timespan: {
            start: new Date(2020, 4, 12),
            end: new Date(2020, 4, 22)
          }
        },
        {
          title: "Trip to New York",
          timespan: {
            start: new Date(2020, 4, 10),
            end: new Date(2020, 4, 13)
          }
        }
      ]
    }
  }
}
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
