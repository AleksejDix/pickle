import { createTemporal } from 'usetemporal'
import { createNativeAdapter } from '@usetemporal/adapter-native'

// Create a single shared temporal instance
export const temporal = createTemporal({
  date: new Date(),
  adapter: createNativeAdapter({ weekStartsOn: 1 }),
  weekStartsOn: 1, // Monday
})