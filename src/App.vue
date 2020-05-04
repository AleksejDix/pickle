<template>
  <div id="app">
    <DatePicker v-model="selectedDate" />
  </div>
</template>

<script>
import DatePicker from './components/DatePicker.vue'

export default {
  name: 'App',
  components: {
    DatePicker
  },
  data() {
    return {
      selectedDate: new Date("2018-06-06T21:00:00.000Z")
    };
  },
}
</script>

<style>
html {
  @apply bg-gray-900 text-gray-500;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

</style>