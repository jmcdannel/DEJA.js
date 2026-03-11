<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { getBackgroundById } from './registry'

const props = defineProps<{
  backgroundId: string
  selected?: boolean
}>()

const bgDef = computed(() =>
  props.backgroundId === 'none' ? null : getBackgroundById(props.backgroundId),
)

const label = computed(() => bgDef.value?.name ?? 'None')

const effectComponent = computed(() => {
  if (bgDef.value?.type === 'effect' && bgDef.value.component) {
    return defineAsyncComponent(bgDef.value.component)
  }
  return null
})
</script>

<template>
  <div
    class="relative w-24 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-150"
    :class="
      selected
        ? 'border-sky-400 ring-2 ring-sky-400/40 scale-105'
        : 'border-slate-700 hover:border-slate-500'
    "
  >
    <!-- None option -->
    <div
      v-if="!bgDef"
      class="absolute inset-0 bg-slate-900 flex items-center justify-center"
    >
      <v-icon size="20" color="grey">mdi-cancel</v-icon>
    </div>

    <!-- Image thumbnail -->
    <div
      v-else-if="bgDef.type === 'image' && bgDef.asset"
      class="absolute inset-0 bg-cover bg-center"
      :style="{ backgroundImage: `url(${bgDef.asset})` }"
    />

    <!-- Effect thumbnail -->
    <div
      v-else-if="bgDef.type === 'effect' && effectComponent"
      class="absolute inset-0 bg-slate-900 overflow-hidden"
    >
      <component :is="effectComponent" class="absolute inset-0 scale-50 origin-center" />
    </div>

    <!-- Label overlay -->
    <div class="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5">
      <span class="text-[10px] text-slate-200 truncate block text-center">
        {{ label }}
      </span>
    </div>

    <!-- Selected checkmark -->
    <div
      v-if="selected"
      class="absolute top-0.5 right-0.5"
    >
      <v-icon size="14" color="rgb(56, 189, 248)">mdi-check-circle</v-icon>
    </div>
  </div>
</template>
