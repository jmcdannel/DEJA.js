<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDebounce } from '@vueuse/core'
  
const ticks: Record<number, string> = {
  0: 'IDLE',
  1: '',
  2: '',
  3: '',
  4: '',
  5: '',
  6: '',
  7: '',
  8: '',
  9: '',
  10: '',
  11: '',
  12: '',
  13: '',
  14: '',
  15: '',
  16: '',
  17: '',
  18: '',
  19: '',
  20: '',
  21: '',
  22: '',
  23: '',
  24: '',
  25: '',
  26: '1',
  27: '',
  28: '',
  29: '',
  30: '',
  31: '',
  32: '',
  33: '',
  34: '',
  35: '',
  36: '',
  37: '',
  38: '',
  39: '',
  40: '2',
  41: '',
  42: '',
  43: '',
  44: '',
  45: '',
  46: '',
  47: '',
  48: '',
  49: '',
  50: '',
  51: '',
  52: '',
  53: '',
  54: '3',
  55: '',
  56: '',
  57: '',
  58: '',
  59: '',
  60: '',
  61: '',
  62: '',
  63: '',
  64: '',
  65: '',
  66: '',
  67: '',
  68: '4',
  69: '',
  70: '',
  71: '',
  72: '',
  73: '',
  74: '',
  75: '',
  76: '',
  77: '',
  78: '',
  79: '',
  80: '5',
  81: '',
  82: '',
  83: '',
  84: '',
  85: '',
  86: '',
  87: '',
  88: '',
  89: '',
  90: '',
  91: '',
  92: '',
  93: '',
  94: '6',
  95: '',
  96: '',
  97: '',
  98: '',
  99: '',
  100: '',
  101: '',
  102: '',
  103: '',
  104: '',
  105: '',
  106: '',
  107: '',
  108: '7',
  109: '',
  110: '',
  111: '',
  112: '',
  113: '',
  114: '',
  115: '',
  116: '',
  117: '',
  118: '',
  119: '',
  120: '',
  121: '',
  122: '',
  123: '',
  124: '',
  125: '',
  126: '8'
}

const dirTicks: Record<number, string> = {
  0: 'REV',
  1: 'IDLE',
  2: 'FWD'
}

const emit = defineEmits(['update:currentSpeed', 'stop'])
const props  = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  horizontal: {
    type: Boolean,
    default: false
  },
  speed: {
    type: Number,
    required: true
  }
})

// create a local, mutable copy of the prop to bind to the slider
const localSpeed = ref<number>(Math.abs(props.speed))
const localDirection = ref<number>(props.speed > 0 ? 2 : props.speed < 0 ? 0 : 1)

// keep the local copy in sync if the parent updates the prop
watch(() => props.speed, (v) => {
  localSpeed.value = Math.abs(v)
  localDirection.value = v > 0 ? 2 : v < 0 ? 0 : 1
})

// optional computed proxy you can use as :model-value (or with v-model)
const sliderModel = computed<number>({
  get: () => localSpeed.value,
  set: (v: number) => {
    localSpeed.value = v
    // here you can emit/update parent or other state, e.g. pendingSpeed.value = v
  }
})

const dirModel = computed<number>({
  get: () => localDirection.value,
  set: (v: number) => {
    localDirection.value = v
    // here you can emit/update parent or other state
  }
})

const brakeRef = ref(10)


const debouncedSpeed = useDebounce(sliderModel, 2000)

watch(debouncedSpeed, (speed) => {
  console.log('debounced emit', speed)
  const signedSpeed = dirModel.value === 2 ? speed : dirModel.value === 0 ? -speed : 0
  emit('update:currentSpeed', signedSpeed)
})

</script>
<template>
  <div class="p-2 @[400px]:py-2 @[400px]:px-4 @[640px]:py-2 @[640px]:px-12 flex justify-start items-center flex-grow relative w-full"
    :class="`${horizontal ? 'flex-row px-1' : 'flex-col '}`">
    <div class="w-full max-w-[24rem] my-8">
      <v-slider
          v-model="sliderModel"
          :disabled="dirModel === 1"
          show-ticks="always"
          step="1"
          tick-size="1"
          width="100%"
          :ticks="ticks"
          track-size="20"
          track-color="black"
          track-fill-color="zinc-950"
          class="shadow-lg border-2 rounded-full py-2 px-8 bg-zinc-950 border-zinc-800"
          max="126"
      >
    </v-slider>
    </div>
    <div class="w-full my-2 ml-16 flex items-center justify-end">
      <v-btn icon="mdi-bell" elevation="12" class="mr-12 border-2"></v-btn>
      <v-slider
          v-model="dirModel"
          show-ticks="always"
          :disabled="sliderModel !== 0"
          step="1"
          tick-size="1"
          width="14rem"
          track-size="0"
          thumb-size="28"
          base-color="zinc-800"
          color="zinc-800"
          track-color="zinc-800"
          :ticks="dirTicks"
          min="0"
          max="2"
          class="shadow-lg border-2 rounded-full py-4 px-8 bg-zinc-950 border-zinc-800"
      ></v-slider>
    </div>
    <div class="w-full items-start justify-start flex pr-24 my-6">
      <v-slider
          v-model="brakeRef"
          step="1"
          tick-size="5"
          hide-details
          track-size="8"
          thumb-size="32"
          thumb-color="red-darken-4"
          base-color="red-800"
          color="zinc-800"
          track-color="red-darken-2"
          min="0"
          max="10"
          class="shadow-lg border-2 rounded-full py-1 px-8 bg-zinc-950 border-zinc-800"
      ></v-slider>
    </div>
    <div class="w-full my-2 flex items-center justify-end">

      <v-btn icon="mdi-car-light-high" elevation="12" class="mr-12 border-2"></v-btn>

      <v-btn icon="mdi-car-light-dimmed" elevation="12" class="mr-12 border-2"></v-btn>
    </div>
  </div>
  <pre>
props.speed: {{ speed }}
sliderVal: {{ sliderVal }} 
pendingSpeed: {{ pendingSpeed }} 
dirRef: {{ dirRef }} 
brakeRef: {{ brakeRef }}
sliderModel: {{ sliderModel }}
  </pre>
</template>