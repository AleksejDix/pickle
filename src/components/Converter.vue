<template>
  <label>
    <input type="number" id="day" v-model="day" />
    <span>days</span>
  </label>
  <div>=</div>
  <label>
    <input type="number" id="week" v-model="week" />
    <span>weeks</span>
  </label>
</template>

<script>
import { reactive, computed } from "vue"
export default {
  setup() {
    const state = reactive({
      day: undefined,
      week: undefined
    })

    const day = computed({
      get() {
        if (!state.week) return 0
        return state.week * 7
      },
      set(value) {
        state.day = value
      }
    })

    const week = computed({
      get() {
        if (!state.day) return 0
        return +state.day / 7
      },
      set(value) {
        state.week = value
      }
    })
    return {
      week,
      day
    }
  }
}
</script>

<style scoped>
body,
html {
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  font-family: sans-serif;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
}

button {
  padding: 0 1rem;
  height: 2rem;
  background: #41aaf3;
  color: white;
  font-weight: 700;
  font-size: 100%;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
}

output {
  color: #555;
  font-weight: bold;
  font-size: 200%;
  padding: 0.5rem;
  border: 1px solid #aaa;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  text-align: center;
}

section {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

input {
  background: #edf2f7;
  border: none;
  height: 2rem;
  border-radius: 0.25rem;
  font-size: 1rem;
  padding: 0 0.5rem;
}

label {
  input + span {
    margin-left: 1rem;
  }

  span {
    font-weight: 700;
  }

  + div {
    margin: 0.5rem 0;
    text-align: center;
  }
}
</style>
