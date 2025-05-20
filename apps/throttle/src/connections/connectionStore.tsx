import { defineStore } from 'pinia'

export const useConnectionStore = defineStore('connections', {
  state: () => ({
    mqttConnected: false,
    dccExConnected: false,
    isSerial: false,
    isDejaJS: false,
    isDejaServer: false,
    isEmulated: false,
    layoutId: localStorage.getItem('@DEJA/layoutId') || null,
    connectionType: localStorage.getItem('@DEJA/conn') || null,
    ports: [],
  }),
  actions: {
    connect(connType: string, layoutId?: string) {
      this.resetConnections()
      this.connectionType = connType
      localStorage.setItem('@DEJA/conn', connType)
      switch (connType) {
        case 'dejaJS':
          this.isDejaJS = true
          break
        case 'dejaServer':
          this.isDejaServer = true
          break
        case 'serial':
          this.isSerial = true
          break
        case 'emulator':
          this.isEmulated = true
          break
        default:
          console.error('Unknown connection type:', connType)
          break
      }      
      this.selectLayout(layoutId)
    },
    connectDccEx() {
      this.dccExConnected = true
    },
    connectMqtt() {
      this.mqttConnected = true
    },
    selectLayout(layoutId: string | undefined | null) {
      if (layoutId) {
        this.layoutId = layoutId
        localStorage.setItem('@DEJA/layoutId', layoutId)
      }
    },
    disconnect() {
      this.mqttConnected = false
      this.dccExConnected = false

      this.resetConnections()

      this.layoutId = null
      this.ports = []

      localStorage.removeItem('@DEJA/layoutId')
    },
    resetConnections() {
      this.isEmulated = false
      this.isDejaJS = false
      this.isDejaServer = false
      this.isSerial = false
      localStorage.removeItem('@DEJA/conn')
      this.connectionType = null
    }
  }
})

export default useConnectionStore
