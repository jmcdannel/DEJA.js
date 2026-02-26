<script setup lang="ts">
const props = withDefaults(defineProps<{
  tag?: string
  stagger?: number
}>(), {
  tag: 'div',
  stagger: 50,
})

function onBeforeEnter(el: Element) {
  const htmlEl = el as HTMLElement
  htmlEl.style.opacity = '0'
  htmlEl.style.transform = 'translateY(12px)'
}

function onEnter(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement
  const index = Number(htmlEl.dataset.index || 0)
  const delay = Math.min(index * props.stagger, 500)

  htmlEl.style.transition = `opacity 250ms ease-out ${delay}ms, transform 250ms ease-out ${delay}ms`
  requestAnimationFrame(() => {
    htmlEl.style.opacity = '1'
    htmlEl.style.transform = 'translateY(0)'
  })

  setTimeout(done, 250 + delay)
}

function onLeave(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement
  htmlEl.style.transition = 'opacity 150ms ease-in, transform 150ms ease-in'
  htmlEl.style.opacity = '0'
  htmlEl.style.transform = 'translateY(-8px)'
  setTimeout(done, 150)
}
</script>

<template>
  <TransitionGroup
    :tag="tag"
    :css="false"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @leave="onLeave"
  >
    <slot />
  </TransitionGroup>
</template>
