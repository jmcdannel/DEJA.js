<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { Component } from 'vue'
import type { Throttle } from '@repo/modules/locos'

const props = defineProps<{
  throttles: Throttle[]
  modelValue: number | null | undefined
  variantComponent: Component
  variantProps?: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [address: number]
}>()

const containerRef = ref<HTMLElement | null>(null)
const slideEls = ref<(HTMLElement | null)[]>([])
const currentVisibleAddress = ref<number | null>(null)

let observer: IntersectionObserver | null = null

function getSlideIndex(address: number): number {
  return props.throttles.findIndex(t => t.address === address)
}

function scrollToAddress(address: number, behavior: ScrollBehavior = 'smooth') {
  const index = getSlideIndex(address)
  const el = slideEls.value[index]
  if (index < 0 || !el) return
  el.scrollIntoView({ behavior, inline: 'start', block: 'nearest' })
}

function setupObserver() {
  observer?.disconnect()
  if (!containerRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          const index = slideEls.value.indexOf(entry.target as HTMLElement)
          const throttle = props.throttles[index]
          if (throttle && throttle.address !== currentVisibleAddress.value) {
            currentVisibleAddress.value = throttle.address
            emit('update:modelValue', throttle.address)
          }
        }
      }
    },
    { root: containerRef.value, threshold: 0.55 },
  )
  slideEls.value.forEach(el => { if (el) observer?.observe(el) })
}

// External navigation (nav chip, deep link) → scroll to matching slide
watch(() => props.modelValue, (address) => {
  if (address == null || address === currentVisibleAddress.value) return
  nextTick(() => scrollToAddress(address, 'smooth'))
})

// Throttle list changed (add/remove) → re-observe and re-anchor
watch(() => props.throttles.length, () => {
  nextTick(() => {
    setupObserver()
    if (props.modelValue != null) scrollToAddress(props.modelValue, 'instant')
  })
})

onMounted(() => {
  nextTick(() => {
    setupObserver()
    if (props.modelValue != null) scrollToAddress(props.modelValue, 'instant')
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div ref="containerRef" class="swipe-container">
    <div
      v-for="(throttle, index) in throttles"
      :key="throttle.address"
      :ref="(el) => { slideEls[index] = el as HTMLElement | null }"
      class="swipe-slide"
    >
      <component
        :is="variantComponent"
        :address="throttle.address"
        v-bind="variantProps"
      />
    </div>
  </div>
</template>

<style scoped>
.swipe-container {
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
  width: 100%;
  height: 100%;
}

.swipe-container::-webkit-scrollbar {
  display: none;
}

.swipe-slide {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  scroll-snap-align: start;
}
</style>
