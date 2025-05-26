<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
// import { useDejaJS } from '@repo/deja/useDejaJS'
// import { useColors } from '@/Core/UI/useColors'
import { useLayout } from '@/api/useLayout'

// const { sendDejaCommand } = useDejaJS()
const { deviceTypes, connectDevice } = useLayout()
// const { colors, DEFAULT_COLOR } = useColors()

const props = defineProps({
  device: Object,
  ports: Array,
})

const serial = ref(props?.device?.port || '')
// const color = ref(colors[DEFAULT_COLOR])

const deviceType = computed(() => deviceTypes.find((type) => type.value === props?.device?.type))
// const color = colors[deviceType.color || DEFAULT_COLOR]

// onMounted(() => {
//   console.log('DeviceListItem', props.device, deviceType.value?.color, deviceType)
//   deviceType.value?.color && (color.value = colors[deviceType.value.color])
// })

// watch(() => deviceType.value?.color, (newVal) => {
//   console.log('deviceType.color', newVal)
//   color.value = colors[newVal]
// })

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
      <!-- <img v-if="deviceType?.image" :src="deviceType.image" alt="DCC-EX Logo" class="w-16 h-16 mr-2" />
      <v-icon v-else :icon="deviceType?.icon || 'mdi-help'" class="w-16 h-16 mr-2 border rounded-full" /> -->
  
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
