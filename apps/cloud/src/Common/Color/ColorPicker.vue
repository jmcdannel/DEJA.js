<script setup lang="ts">
import {  onMounted, ref, watch } from 'vue'
import type { ITag } from '@/Common/Tags/types'
import { useLayout } from '@/Layout/useLayout'

defineEmits(['select', 'cancel'])
const model = defineModel<string>()

const { getTags } = useLayout()

const current = ref<string>(model.value || '')
const layoutTags = ref<ITag[]>([])

// list of vuestic colors
const themeColors = [
  'primary',
  'success',
  'info',
  'warning',
  'error',
  'neutral',
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'blue-grey',
  'grey',
  'black',
  'white',
  'transparent',
]

const showCustomColor = ref(false)
const customSwatches = ref<string[]>([])
const customColor = ref<string>("")

onMounted(async () => {
  layoutTags.value = await getTags()
})

watch(current, (value) => {
  console.log('current', value)
  if (value !== 'custom') {
    model.value = value
  }
})

function handleSelectCustomColor() {
  showCustomColor.value = false
  model.value = customColor.value
  if (!customSwatches.value.includes(customColor.value)) {
    customSwatches.value.push(customColor.value)
    current.value = customColor.value
  }
}

</script>
<template>
  <v-card class="mx-auto w-full h-full justify-between flex flex-col bg-neutral-500"
    variant="tonal"
    density="compact"
    :color="model || 'purple'">
    <v-card-item class="font-weight-black">
      <v-card-title class="font-weight-black">
        Color Picker {{ current }} - {{ model }}
      </v-card-title>
    </v-card-item>
    <v-card-text>
      <v-btn-toggle v-model="current" divided class="flex-wrap h-auto">
        <v-btn v-for="tag in layoutTags" :value="tag.color" :key="tag.id"
          class="min-h-[10rem] min-w-[10rem] border"
          variant="flat"
          :color="tag.color">
          <div class="flex flex-col justify-center items-center">
            <v-icon :color="current === tag.color ? 'white' : tag.color" size="48">mdi-palette</v-icon>
            <div class="mt-4 text-xs">{{ tag.name }}</div>
          </div>      
        </v-btn>
        <v-btn v-for="themeColor in themeColors" :value="themeColor" :key="themeColor"
          class="min-h-[10rem] min-w-[10rem] border"
          variant="flat"
          :color="themeColor">
          <div class="flex flex-col justify-center items-center">
            <v-icon :color="current === themeColor ? 'white' : themeColor" size="48">mdi-palette</v-icon>
            <div class="mt-4 text-xs">{{ themeColor }}</div>
          </div>
        </v-btn>
        <v-btn v-for="swatch in customSwatches" :value="swatch" :key="swatch"
          class="min-h-[10rem] min-w-[10rem] border"
          variant="flat"
          :color="swatch">
          <div class="flex flex-col justify-center items-center">
            <v-icon :color="current === swatch ? 'white' : swatch" size="48">mdi-palette</v-icon>
            <div class="mt-4 text-xs">{{ swatch }}</div>
          </div>      
        </v-btn>
        <v-btn
          value="custom"
          @click="showCustomColor = true"
          class="min-h-[10rem] min-w-[10rem] border bg-gradient-to-br from-green-500 via-violet-500 to-red-500">        
          <div class="relative flex flex-col justify-center items-center">
            <v-icon size="48">mdi-palette</v-icon>
            <div class="mt-4 text-xs">Custom</div>
          </div>        
        </v-btn>
      </v-btn-toggle>
    </v-card-text>
    <v-card-actions>
      <v-btn
        class="text-white"
        prepend-icon="mdi-cancel"
        variant="plain"
        @click="$emit('cancel')">
        Cacnel
      </v-btn>
      <v-btn
        prepend-icon="mdi-check"
        :color="model"
        variant="flat"
        @click="$emit('select')">
        Save Color
      </v-btn>
    </v-card-actions>
  </v-card>
  <v-dialog max-width="500" v-model="showCustomColor">
    <v-card>
      <v-card-title>Custom Color</v-card-title>
      <v-card-text>
        <v-color-picker 
          v-model="customColor"
          hide-canvas 
          hide-inputs 
          show-swatches
        >
        </v-color-picker>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="showCustomColor = false" icon="mdi-cancel"></v-btn>
        <v-btn color="success" variant="tonal" icon="mdi-check" @click="handleSelectCustomColor"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>