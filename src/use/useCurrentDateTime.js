import {watchEffect, ref} from 'vue'
export default function useCurrentDateTime() {
  const now = ref(new Date())

  watchEffect((stop) => {
  
      const intervalId = setInterval(() => now.value = new Date(), 1000 );

      stop(() => {
        clearInterval(intervalId);
      })
  })

  return { now }
}
