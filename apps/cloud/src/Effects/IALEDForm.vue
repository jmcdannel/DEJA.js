<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { IEfx } from '@/Effects/types'
// import type { IDevice } from '@/Devices/types'
import { useLayout } from '@/Layout/useLayout'

const pattern = defineModel('pattern')
const range = defineModel('range')
const config = defineModel('config')
const strip = defineModel('strip')

const props = defineProps<{
  efx: IEfx,
  device: string,
  color: string
}>()

// const color = ref(props.efx?.color)
const device = ref(null as null | Object)

const { getDevice } = useLayout()

onMounted(async () => {
  console.log('IALEDForm', props.efx)
  if (props.device) {
    const result = await getDevice(props.device)
    if (result) {
      device.value = result
    }
  }
})

watch(strip, (value) => {
  range.value = `0:${device.value?.strips?.[value]}`
})

watch(() => props.color, (value) => {
  const rgb = value?.replace(/^#/, '').match(/.{2}/g)?.map(x => parseInt(x, 16))
  if (rgb) {
    config.value = rgb.join(':')
  }
})
watch(() => props.device, async (value) => {
  const result = await getDevice(value)
  if (result) {
    device.value = result
  }
})

/*
  color
  rainbow
  chaserainbow
  chasecolor
  wipe
*/
const patterns = [
  { 
    id: 'solid',
    label: 'Solid',
    config: {
      required: ['color']
    }
  },
  { 
    id: 'rainbow',
    label: 'Rainbow',
    config: {
      required: []
    }
  },
  { 
    id: 'chaserainbow',
    label: 'Chase Rainbow',
    config: {
      required: []
    }
  },
  { 
    id: 'chasecolor',
    label: 'Chase Color',
    config: {
      required: ['color']
    }
  },
  { 
    id: 'wipe',
    label: 'Wipe',
    config: {
      required: ['color']
    }
  }
]

</script>
<template>
  <v-btn-toggle :color="color" v-model="strip">
    <v-btn v-for="(len, num) in device?.strips" :key="num" :value="num">
      Strip ID: {{ num }} [{{ len }}]
    </v-btn>
  </v-btn-toggle>
  <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
  <v-btn-toggle v-model="pattern">
    <v-btn v-for="p in patterns" :key="p.id" :value="p.id" :color="color || efx.color || 'purple'">
      {{ p.label }}
    </v-btn>
  </v-btn-toggle>
  <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
  <!-- <pre>{{ device }}</pre> -->
  <!-- <pre>{{ efx.color }}</pre> -->
</template>