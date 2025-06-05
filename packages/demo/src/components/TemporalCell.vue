<template>
  <div class="relative padding-t-full">
    <button
      class="absolute inset-0 w-full rounded-full focus:outline-none focus:shadow-outline"
    >
      <!-- <div class="flex justify-center space-x-1">
      <div v-for="(event, index) in day.events" :key="index">
        <div
          class="absolute inset-0 bg-opacity-50 bg-gray-800 border-gray-500 border-opacity-50"
          :class="{
            'bg-orange-900': event.color === 'orange',
            'border-l-4 rounded-l-full': event.isStart && !event.isEnd,
            'border-b-4 border-t-4': event.isWithing,
            'border-r-4 rounded-r-full': event.isEnd && !event.isStart,
            'border-4 rounded-full': event.isStart && event.isEnd
          }"
        ></div>
        <div
          :class="{
            'm-1 ml z-10 bg-gray-900 rounded-full absolute inset-0 ':
              event.isStart || event.isEnd
          }"
        ></div>
      </div>
    </div> -->

      <div
        v-if="unit.isSame(unit.raw.value, selected)"
        class="absolute inset-0 bg-orange-500 rounded-full"
      />

      <div
        class="z-10 absolute inset-0 flex justify-center items-center text-xs"
        :class="{
          'text-black': unit.isSame(unit.raw.value, selected)
        }"
      >
        {{ unit.name.value }}
      </div>
    </button>
  </div>
</template>

<script>
import { ref } from "vue"
export default {
  props: ["unit"],
  setup() {
    const selected = ref(new Date())
    return { selected }
  }
}
</script>

<style>
.padding-t-full {
  padding-top: 100%;
}
</style>
