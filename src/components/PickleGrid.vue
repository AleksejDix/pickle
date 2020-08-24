<template>
  <ul
    class="grid gap-2"
    :style="{
      gap: `${gap}px`,
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
    }"
  >
    <li v-for="(subunit, index) in timeunit" :key="subunit">
      <slot :unit="subunit" :index="index">
        <button
          @click="select(subunit)"
          class="w-full py-3 border-4 rounded-full border-transparent focus:outline-none focus:shadow-outline"
          :class="{
            'border-orange-500 text-white': subunit.isSame(picked, subunit.raw),
            'text-orange-500': subunit.isNow
          }"
        >
          {{ subunit.name }}
        </button>
      </slot>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    timeunit: {
      type: Array,
      required: true
    },
    picked: {
      type: Date,
      required: true
    },
    columns: {
      type: Number,
      default: 1
    },
    offset: {
      type: Number,
      default: 1
    },
    gap: {
      type: Number,
      default: 1
    }
  },
  setup(props, context) {
    const select = (subpickle) => {
      context.emit("update:picked", subpickle.raw)
    }

    return {
      select
    }
  }
}
</script>
