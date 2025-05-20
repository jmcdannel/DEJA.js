import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMQTT } from 'mqtt-vue-hook'
import { useCurrentUser } from 'vuefire'
import { useConnectionStore } from '@/connections/connectionStore'
import { useDejaCloud } from '@/deja-cloud/useDejaCloud'

export function useDejaJs() {
  const mqttBroker = import.meta.env.VITE_MQTT_BROKER
  const mqttPort = 8081
  const clientId = '@ttt/throttle'

  const user = useCurrentUser()
  const mqttHook = useMQTT()
  const dejaCloud = useDejaCloud()
  const conn = useConnectionStore()

  const { layoutId } = storeToRefs(conn)
  const dejaTopic = ref(`@ttt/DEJA.js/${layoutId.value}`)

  let ports: never[] = []

  async function parseMessage(topic: string, message: string) {
    try {
      const { action, payload } = JSON.parse(message)
      console.log('[DCC API] parseMessage', topic, message, action, payload)
      switch (action) {
        case 'portList':
          ports = payload || []
          conn.ports = ports
          break
        case 'status':
          console.log('!!payload?.isConnected', !!payload?.isConnected)
          // if (!!payload?.isConnected) {
          //   conn.connectDccEx()
          //   conn.connect('dejaJS', layoutId.value || undefined)
          // }
          break
        case 'connected':
          // conn.connect('dejaJS', layoutId.value || undefined)
          break
      }
    } catch {
      console.warn('Message not in JSON format.')
    }
  }

  function handleConnect(_topic: string, message: string) {
    try {
      console.log(
        'MQTT BROKER CONNECTION SUCCESSFUL',
        _topic,
        message,
        dejaTopic.value
      )
      mqttHook.subscribe([dejaTopic.value])
      conn.connectMqtt()
      send({ action: 'getStatus', payload: {} })
      send({ action: 'listPorts', payload: {} })
    } catch (err) {
      console.error(err)
    }
  }

  function handleMessage(topic: string, message: string) {
    try {
      console.log('handleMessage', topic, message.toString())
      parseMessage(topic, message.toString())
    } catch (err) {
      console.error(err)
    }
  }

  async function connectMqtt() {
    try {
      console.log(
        'CONNECTING TO MQTT BROKER',
        mqttBroker,
        layoutId?.value,
        dejaTopic.value
      )
      mqttHook.registerEvent(dejaTopic.value, handleMessage, clientId)
      mqttHook.registerEvent('on-connect', handleConnect, clientId)
      await mqttHook.connect(mqttBroker, { port: mqttPort })
      conn.connect('dejaJS', layoutId.value || undefined)
    } catch (err) {
      console.error(err)
    }
  }

  async function connectDejaCloud() {
    try {
      console.log(
        'CONNECTING TO DEJA CLOUD from useDejaJS',
        layoutId?.value,
        user?.value
      )

      const layout = await dejaCloud.getLayout()
      console.log('layout', layout)
      conn.connect('dejaJS', layoutId.value || undefined)
      send({ action: 'getStatus', payload: {} })
    } catch (err) {
      console.error(err)
    }
  }

  async function connect() {
    try {
      console.log('CONNECTING', user.value)
      !!user.value ? await connectDejaCloud() : await connectMqtt()
    } catch (err) {
      console.error(err)
    }
  }

  async function send({ action, payload }) {
    if (!!user.value) {
      dejaCloud.send({ action, payload })
    } else {
      mqttHook.publish(
        `@ttt/dcc/${layoutId.value}`,
        JSON.stringify({ action, payload })
      )
    }
  }

  return {
    connectMqtt,
    connectDejaCloud,
    connect,
    send,
  }
}

export default useDejaJs
