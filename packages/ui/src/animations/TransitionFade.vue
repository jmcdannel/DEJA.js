<script setup lang="ts">
withDefaults(defineProps<{
  duration?: number
  mode?: 'in-out' | 'out-in' | 'default'
}>(), {
  duration: 250,
  mode: 'out-in',
})
</script>

<template>
  <Transition name="deja-fade" :mode="mode">
    <slot />
  </Transition>
</template>

<style>
.deja-fade-enter-active,
.deja-fade-leave-active {
  transition: opacity 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
.deja-fade-enter-from,
.deja-fade-leave-to {
  opacity: 0;
}
</style>
