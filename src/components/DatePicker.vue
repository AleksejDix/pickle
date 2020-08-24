<template>
  <div>
    <article class="mx-auto max-w-md border rounded-lg p-3 shadow">
      <header>
        <button>
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"
            ></path>
          </svg>
        </button>

        <div>
          <PickleUnit :timeunit="year" v-model:picked="pickle.picked" />
          <transition name="fade" mode="out-in">
            <PickleGrid
              :columns="3"
              :gap="12"
              :key="year.name"
              :timeunit="yearMonths"
              v-model:picked="pickle.picked"
            >
              <template #default="{unit, index}">
                <h1
                  :class="{ 'text-orange-500': unit.isNow.value }"
                  class="text-white text-xl py-2  capitalize leading-normal tracking-wide"
                >
                  {{ pickle.f(unit.raw.value, { month: "long" }) }}
                </h1>
                <PickleGrid
                  :offset="unit.weekDay.value"
                  :columns="7"
                  :timeunit="monthDays[index]"
                  v-model:picked="pickle.picked"
                >
                  <template #default="{unit}">
                    <PickleCell :unit="unit" />
                  </template>
                </PickleGrid>
              </template>
            </PickleGrid>
          </transition>
        </div>
      </header>
    </article>
  </div>
</template>

<script>
import { usePickle } from "@/use/usePickle"
import { ref, watch, computed } from "vue"
import PickleUnit from "./PickleUnit"
import PickleGrid from "./PickleGrid"
import PickleCell from "./PickleCell"
import useYear from "./../use/useYear"
// import useDay from "../use/useDay";

export default {
  props: ["date"],
  components: {
    PickleUnit,
    PickleGrid,
    PickleCell
  },
  setup(props, context) {
    const now = ref(new Date())

    const pickle = usePickle({
      now,
      date: props.date,
      locale: "en"
    })

    const year = useYear(pickle)

    const yearMonths = computed(() => pickle.divide(year, "month"))

    const monthDays = computed(() =>
      yearMonths.value.map((month) => pickle.divide(month, "day"))
    )

    watch(
      () => pickle.picked.value,
      (n) => {
        context.emit("update:date", n)
      }
    )

    const select = (n) => {
      context.emit("update:date", n)
    }

    return { select, pickle, year, yearMonths, monthDays }
  }
}
</script>
