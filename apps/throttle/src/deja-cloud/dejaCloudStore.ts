import { defineStore } from 'pinia'
import { collection } from 'firebase/firestore'
import { db } from '@repo/firebase-config/firebase'

export const useDejaCloudStore = defineStore('dejaCloud', {
  state: () => ({
    initialized: false,
    locoDocId: null as string | null,
    locos: {} as ReturnType<typeof collection>,
    throttles: {} as ReturnType<typeof collection>,
  }),
  actions: {
    async init(layoutId: string) {
      console.log('dejaCloudStore.init', layoutId)
      this.locos = collection(db, `layouts/${layoutId}/locos`)
      this.throttles = collection(db, `layouts/${layoutId}/throttles`)
      this.initialized = true
    },
  },
})

export default useDejaCloudStore
