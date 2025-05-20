import { defineStore } from 'pinia'
import type { Loco, ConsistLoco } from './types'

export const localStorageKey = '@DEJA/locos'

export const useThrottleStore = defineStore('locos', {
  state: () => {
    const savedState = localStorage.getItem(localStorageKey);
    return { 
      selectedLoco: null as Loco | null,
      locos: savedState ? JSON.parse(savedState) : [] as Loco[]
    }
  },
  actions: {
    setLocos(newLocos: Loco[]) {
      this.locos = newLocos
      this.saveLocos()
    },
    saveLocos() {
      localStorage.setItem(localStorageKey, JSON.stringify(this.locos))
    },
    setSelectedLoco(loco: Loco) {
      this.selectedLoco = loco
    }
  },
})

export default useThrottleStore