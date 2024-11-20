<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const DEFAULT_COLOR = 'blue'

interface IColorSource {
  id: string
  label: string
  disabled?: boolean
  color?: () => string | string
}

const defualtColorSources = [
  { id: 'primary', label: 'Use Theme Color - Primary', color: 'primary' },
  { id: 'tag', label: 'Tag', disabled: true },
  { id: 'custom', label: 'Custom', color: () => customColor.value },
] as IColorSource[]

const model = defineModel()
const props = defineProps<{
  additionalSources?: IColorSource[] | undefined
}>()

const colorSources = ref(props.additionalSources 
  ? props.additionalSources.concat(defualtColorSources) 
  : defualtColorSources)
const colorSource = ref(model.value ? 'custom' : colorSources.value[0].id)
const customColor = ref<string>(typeof model.value === 'string' ? model.value : DEFAULT_COLOR)

const color = computed(() => {
  const source = colorSources.value.find((source) => source.id === colorSource.value)
  if (source?.color) {
    return typeof source.color === 'function' ? source.color() : source.color
  }
})

watch(colorSource, (value) => {
  const source = colorSources.value.find((source) => source.id === value)  
  if (source?.color) {
    model.value = typeof source.color === 'function' ? source.color() : source.color
  }
})

watch(customColor, (value) => {
  if (colorSource.value === 'custom') {
    model.value = value
  }
})

</script>
<template>
  <v-card-title>
    <v-avatar :color="color" size="48">
      <v-icon>mdi-palette</v-icon>
    </v-avatar>
    <v-label class="ml-4 text-lg">Color</v-label>
  </v-card-title>
  <v-radio-group v-model="colorSource">
    <v-radio 
      v-for="source in colorSources" 
      :key="source.id" 
      :label="source.label" 
      :value="source.id" 
      :disabled="source.disabled"
    >
    </v-radio>
  </v-radio-group>
  <v-color-picker 
    v-if="colorSource === 'custom'" 
    v-model="customColor"
    hide-canvas 
    hide-inputs 
    show-swatches
  >
  </v-color-picker>
</template>