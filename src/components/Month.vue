<template>
  <div class="p-2">

        <div class="grid grid-cols-7 row-gap-1">
          <div
            :class="{
              'text-white': picker.day.isSameDay(day.date, picker.now)
            }"
            class="day uppercase text-center text-xs"
            v-for="day in picker.week.days"
            :key="day"
          >
            <slot name="name" :day="day"></slot>
          </div>
        </div>
         <transition name="fade" mode="out-in">
        <div :key="picker.browsing" class="grid grid-cols-7 row-gap-1">
          <div
            class="relative padding-t-full"
            :key="day.date"
            v-for="(day, index) in picker.month.days"
            v-bind="{
              ...(index === 0 && {
                style: { 'grid-column-start': picker.week.weekDay(day.date) }
              })
            }"
          >
            <button
              @click.exact="picker.pick(day.date)"
              @click.shift="picker.pickSecond(day.date)"
              class="absolute inset-0 p-4 w-full rounded-full focus:outline-none focus:shadow-outline"
            >
              <div class="flex justify-center space-x-1">
                <div v-for="(event, index) in day.events" :key="index">
                  <div
                    class="absolute inset-0 bg-opacity-50 bg-gray-800 border-gray-500 border-opacity-50"
                    :class="{
                      'bg-orange-900': event.color === 'orange',
                      'border-l-4 rounded-l-full':
                        event.isStart && !event.isEnd,
                      'border-b-4 border-t-4': event.isWithing,
                      'border-r-4 rounded-r-full':
                        event.isEnd && !event.isStart,
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
              </div>

              <div
                v-if="
                  picker.selected &&
                    picker.day.isSameDay(day.date, picker.selected)
                "
                class="absolute inset-0 bg-opacity-50  border-orange-500  border-4 rounded-full"
              ></div>

              <div
                class="z-10 absolute inset-0 flex justify-center items-center"
                :class="{
                  'text-white':
                    picker.selected &&
                    picker.day.isSameDay(day.date, picker.selected),
                  'text-orange-500': picker.day.isSameDay(day.date, picker.now)
                }"
              >
                <slot :day="day.date"></slot>
              </div>
            </button>
          </div>
        </div>
    </transition>
      </div>

</template>

<script>
export default {
  props: ["picker"]
};
</script>

<style >
.padding-t-full {
  padding-top: 100%;
}
</style>
