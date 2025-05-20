import { defineStore } from 'pinia'

export const useConnectionStore = defineStore('connections', {
  state: () => ({
    mqttConnected: false,
    ports: [],
    dejaConnected: false,
    serialConnected: false,
    isEmulated: false,
    layoutId: localStorage.getItem('@DEJA/layoutId') || null
  }),
  actions: {
    connect(connType: String) {
      this.disconnect()
      switch (connType) {
        case 'deja':
          this.dejaConnected = true
          break
        case 'serial':
          this.serialConnected = true
          break
        case 'emulator':
          this.isEmulated = true
          break
        default:
          console.error('Unknown connection type:', connType)
          break
      }
    },
    disconnect() {
      this.ports = []
      this.mqttConnected = false
      this.layoutId = null
      this.dejaConnected = false
      this.serialConnected = false
      this.isEmulated = false
      localStorage.removeItem('@DEJA/layoutId')
    }
  }
})

export default useConnectionStore
