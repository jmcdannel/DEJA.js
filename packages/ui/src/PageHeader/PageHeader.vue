<script setup lang="ts">
import { useSlots } from 'vue'

const props = defineProps<{
  title: string
  icon?: string
  color?: string
  subtitle?: string
}>()

const slots = useSlots()
const hasControls = () => !!slots.controls

const resolvedColor = props.color ?? 'sky'

const GRADIENT_CLASSES: Record<string, string> = {
  cyan:    'bg-gradient-to-r from-cyan-500/20 to-transparent',
  lime:    'bg-gradient-to-r from-lime-500/20 to-transparent',
  pink:    'bg-gradient-to-r from-pink-500/20 to-transparent',
  indigo:  'bg-gradient-to-r from-indigo-500/20 to-transparent',
  amber:   'bg-gradient-to-r from-amber-500/20 to-transparent',
  purple:  'bg-gradient-to-r from-purple-500/20 to-transparent',
  emerald: 'bg-gradient-to-r from-emerald-500/20 to-transparent',
  teal:    'bg-gradient-to-r from-teal-500/20 to-transparent',
  rose:    'bg-gradient-to-r from-rose-500/20 to-transparent',
  blue:    'bg-gradient-to-r from-blue-500/20 to-transparent',
  sky:     'bg-gradient-to-r from-sky-500/20 to-transparent',
  red:     'bg-gradient-to-r from-red-500/20 to-transparent',
  violet:  'bg-gradient-to-r from-violet-500/20 to-transparent',
}

const TEXT_CLASSES: Record<string, string> = {
  cyan:    'text-cyan-400',
  lime:    'text-lime-400',
  pink:    'text-pink-400',
  indigo:  'text-indigo-400',
  amber:   'text-amber-400',
  purple:  'text-purple-400',
  emerald: 'text-emerald-400',
  teal:    'text-teal-400',
  rose:    'text-rose-400',
  blue:    'text-blue-400',
  sky:     'text-sky-400',
  red:     'text-red-400',
  violet:  'text-violet-400',
}

const gradientClass = GRADIENT_CLASSES[resolvedColor] ?? GRADIENT_CLASSES.sky
const textClass = TEXT_CLASSES[resolvedColor] ?? TEXT_CLASSES.sky
</script>

<template>
  <div class="mb-2">
    <!-- Title Row -->
    <div :class="[gradientClass, 'px-4 py-3']">
      <div class="flex items-center justify-between">
        <h1 class="flex items-center tracking-tight" :class="textClass">
          <v-icon v-if="icon" :class="textClass" class="mr-2" size="24">{{ icon }}</v-icon>
          <span class="text-2xl font-black uppercase">{{ title }}</span>
        </h1>
        <div v-if="$slots.actions" class="flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
      <div v-if="subtitle || $slots.subtitle" class="text-sm text-slate-400 mt-1 ml-[34px]">
        <slot name="subtitle">{{ subtitle }}</slot>
      </div>
    </div>

    <!-- Controls Row -->
    <div v-if="hasControls()">
      <slot name="controls" />
    </div>
  </div>
</template>
