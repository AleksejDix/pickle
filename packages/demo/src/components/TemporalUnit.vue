<template>
  <div class="flex space-x-2">
    <div class="flex">
      <button
        class="hover:text-orange-500 focus:outline-none focus:text-orange-500"
        @click="timeunit.past()"
      >
        <svg
          class="w-5 h-5 icon"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z"
            clip-rule="evenodd"
            fill-rule="evenodd"
          />
        </svg>
      </button>
      <button
        class="hover:text-orange-500 focus:outline-none focus:text-orange-500"
        @click="timeunit.future()"
      >
        <svg
          class="w-5 h-5 icon"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
            clip-rule="evenodd"
            fill-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <div class="flex-1 flex justify-between">
      <button
        class="cursor-pointer"
        :class="{
          'text-orange-500': timeunit.isNow
        }"
        @click="select(timeunit.raw)"
      >
        {{ timeunit.name }}
      </button>
      <button
        title="now"
        class="whitespace-no-wrap inline-block flex space-x-2 hover:text-orange-500"
        @click="select(new Date())"
      >
        <svg
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clip-rule="evenodd"
            fill-rule="evenodd"
          />
        </svg>
        <span class="sr-only">now</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    timeunit: {
      type: Object,
      required: true
    },
    picked: {
      type: Date,
      required: true
    }
  },
  setup(props, context) {
    const select = (n) => {
      context.emit("update:picked", n)
    }

    return {
      select
    }
  }
}
</script>
