<script setup lang="ts">
import { useMenu } from '@/Core/Menu/useMenu'

const props = defineProps({
  label: { type: String },
  icon: { type: String },
  color: { type: String },
  menu: { type: String },
  subtitle: { type: String },
})

const { getMenuItem } = useMenu()

const menuItem = props.menu ? getMenuItem(props.menu) : null
const { label, color, icon } = menuItem
  ?? { label: props.label, color: props.color, icon: props.icon }

const resolvedColor = color ?? 'sky'

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
}

const TEXT_CLASSES: Record<string, string> = {
  cyan:    'text-cyan-500 dark:text-cyan-400',
  lime:    'text-lime-500 dark:text-lime-400',
  pink:    'text-pink-500 dark:text-pink-400',
  indigo:  'text-indigo-500 dark:text-indigo-400',
  amber:   'text-amber-500 dark:text-amber-400',
  purple:  'text-purple-500 dark:text-purple-400',
  emerald: 'text-emerald-500 dark:text-emerald-400',
  teal:    'text-teal-500 dark:text-teal-400',
  rose:    'text-rose-500 dark:text-rose-400',
  blue:    'text-blue-500 dark:text-blue-400',
  sky:     'text-sky-500 dark:text-sky-400',
  red:     'text-red-500 dark:text-red-400',
}

const gradientClass = GRADIENT_CLASSES[resolvedColor] ?? GRADIENT_CLASSES.sky
const textClass = TEXT_CLASSES[resolvedColor] ?? TEXT_CLASSES.sky
</script>
<template>
  <div :class="[gradientClass, 'rounded-xl px-4 py-3 mb-6']">
    <div class="flex items-center">
      <h2 class="flex items-center" :class="textClass">
        <v-icon v-if="icon" size="32" :class="textClass" class="mr-2">{{ icon }}</v-icon>
        <span class="text-2xl">{{ label }}</span>
      </h2>
      <v-spacer></v-spacer>
      <div class="flex items-center gap-2">
        <slot></slot>
      </div>
    </div>
    <div v-if="subtitle || $slots.subtitle" class="text-sm opacity-60 mt-1">
      <slot name="subtitle">{{ subtitle }}</slot>
    </div>
  </div>
</template>
