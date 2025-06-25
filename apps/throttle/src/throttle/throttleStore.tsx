import { defineStore } from 'pinia'
import type { Loco, Throttle } from '@repo/modules/locos'

export const localStorageKeyLocos = '@DEJA/locos'
export const localStorageKeyThrottles = '@DEJA/throttles'

export const useThrottleStore = defineStore('locos', {
  state: () => {
    const savedStateLocos = localStorage.getItem(localStorageKeyLocos);
    const savedStateThrottles = localStorage.getItem(localStorageKeyThrottles);
    return { 
      locos: savedStateLocos ? JSON.parse(savedStateLocos) : [] as Loco[],
      throttles: savedStateThrottles ? JSON.parse(savedStateThrottles) : [] as Throttle[]
    }
  },
  actions: {
    initialize: () => {
    },
    setLocos(newLocos: Loco[]) {
      this.locos = newLocos
      this.saveLocos()
    },
    saveLocos() {
      localStorage.setItem(localStorageKeyLocos, JSON.stringify(this.locos))
    },
    setThrottles(newThrottles: Throttle[]) {
      this.throttles = newThrottles
      this.saveThrottles()
    },
    saveThrottles() {
      localStorage.setItem(localStorageKeyThrottles, JSON.stringify(this.throttles))
    },
    acquireThrottle(address: number) {
      const throttle = this.throttles.find((t:Throttle) => t.id === address)
      if (!throttle) {
        this.throttles.push({ id: address, direction: false, speed: 0, timesstamp: Date.now() })
        this.saveThrottles()
      }
      return this.throttles.find((t:Throttle) => t.id === address)
    },
    releaseThrottle(address: number) {
      this.throttles = this.throttles.filter((t:Throttle) => t.id !== address)
      this.saveThrottles()
    }
  },
})

export default useThrottleStore