<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
  mode?: 'in-out' | 'out-in' | 'default'
}>(), {
  direction: 'up',
  duration: 300,
  mode: 'out-in',
})

const transitionName = computed(() => `deja-slide-${props.direction}`)
</script>

<template>
  <Transition :name="transitionName" :mode="mode">
    <slot />
  </Transition>
</template>

<style>
/* Slide up */
.deja-slide-up-enter-active,
.deja-slide-up-leave-active {
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.deja-slide-up-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.deja-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}

/* Slide down */
.deja-slide-down-enter-active,
.deja-slide-down-leave-active {
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.deja-slide-down-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}
.deja-slide-down-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

/* Slide left */
.deja-slide-left-enter-active,
.deja-slide-left-leave-active {
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.deja-slide-left-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.deja-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

/* Slide right */
.deja-slide-right-enter-active,
.deja-slide-right-leave-active {
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.deja-slide-right-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}
.deja-slide-right-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
