<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import type { Device } from '@repo/modules/layouts'
import { useLayout, deviceTypes } from '@repo/modules/layouts'

const { connectDevice } = useLayout()

const props = defineProps({
  device: {
    type: Object as PropType<Device>,
    required: true
  },
  ports: {
    type: Array as PropType<string[]>,
    required: true
  }
})

const serial = ref(props?.device?.port || '')

async function handleConnect (event: Event) {
  console.log('handleConnect', props.device, serial.value)
  connectDevice(serial.value, props.device)
}

</script>
<template>
  <div
    class="mx-auto w-full h-full justify-between flex flex-col border-t-4 border-b-4"
    
  >
      <span class="text-md">{{device?.id}}</span>
    <div>
      <div
        class="ma-1"
      >
        {{ device?.connection || 'Device' }}
      </div>      
      <div
        size="small"
        class=" ma-1 inline-flex"
      >
        {{ device?.port || '--' }}
      </div>
      <div
        class=" ma-1 inline-flex"
      >
        {{ device?.isConnected ? 'Connected' : 'Disconnected' }}
      </div>
      <div class="mt-4"></div>
      <!-- <v-combobox
        label="USB Port"
        v-model="serial"
        variant="outlined"
        item-title="label"
        density="compact"
        :items="ports"
      ></v-combobox> -->
      <pre>{{ports}}</pre>
    </div>
    <div>
      <button
        @click="handleConnect"
      >Connect</button>
    </div>
  </div>
</template>
