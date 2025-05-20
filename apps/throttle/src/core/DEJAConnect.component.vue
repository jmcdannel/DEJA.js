<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useMQTT } from 'mqtt-vue-hook'
  import useDcc from '@/api/dccApi'
  import { useConnectionStore } from '@/connections/connectionStore'

  const mqttBroker = import.meta.env.VITE_MQTT_BROKER
  const mqttPort = 8081

  const dccApi = useDcc()
  const mqttHook = useMQTT()
  const conn = useConnectionStore()

  const { layoutId } = storeToRefs(conn)
  const dejaTopic = ref(`@ttt/DEJA.js/${layoutId.value}`)
  const clientId = '@ttt/throttle'

  function handleMessage(topic: string, message: string) {
    try {
      console.log('handleMessage', topic, message.toString())
      dccApi.parseMessage(topic, message.toString())
    } catch (err) {
      console.error(err);
    }
  }

  function handleConnect(_topic: string, message: string) {
    try {
      console.log('MQTT BROKER CONNECTION SUCCESSFUL', _topic, message, dejaTopic.value)
      mqttHook.subscribe([dejaTopic.value])
      conn.$patch({ mqttConnected: true })
      dccApi.send('getStatus', { })
      dccApi.send('listPorts', { })
    } catch (err) {
      console.error(err);
    }
  }

  onMounted(async () => {
    try {
      console.log('CONNECTING TO MQTT BROKER', mqttBroker, layoutId?.value, dejaTopic.value)
      mqttHook.registerEvent(dejaTopic.value, handleMessage, clientId)      
      mqttHook.registerEvent('on-connect', handleConnect, clientId)
      await mqttHook.connect(mqttBroker, { port: mqttPort })
    } catch (err) {
      console.error(err);
    }
  });
</script>

<template>
</template>