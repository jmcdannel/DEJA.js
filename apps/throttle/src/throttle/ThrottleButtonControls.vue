<script setup lang="ts">
  import { ref } from 'vue'
  import { useHaptics } from '@/composables/useHaptics'

  const props = defineProps({
    disabled: {
      type: Boolean,
      default: false
    },
    horizontal: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['update:currentSpeed', 'stop'])
  const { vibrate } = useHaptics()
  const pressedButton = ref<string | null>(null)

  async function handleUp() {
    emit('update:currentSpeed', 1)
  }

  async function handleUp5() {
    emit('update:currentSpeed', 5)
  }

  async function handleDown() {
    emit('update:currentSpeed', -1)
  }

  async function handleDown5() {
    emit('update:currentSpeed', -5)
  }

  async function handleStop() {
    emit('stop')
  }

  function handlePointerDown(e: PointerEvent, buttonId: string) {
    e.preventDefault()
    if (typeof e.pointerId === 'number') {
      (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId)
    }
    pressedButton.value = buttonId
    vibrate(buttonId === 'stop' ? 'heavy' : 'light')
  }

  function handlePointerUp(e: PointerEvent) {
    if (typeof e.pointerId === 'number') {
      (e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId)
    }
    pressedButton.value = null
  }

  function handlePointerLeave() {
    pressedButton.value = null
  }

  function getBtnClasses(buttonId: string) {
    const isActive = pressedButton.value === buttonId
    return [
      'btn btn-accent relative h-auto mx-auto',
      '@[960px]:w-24 p-3 @[400px]:p-3 @[640px]:p-4 @[1024px]:py-3 @[1024px]:px-8',
      'min-h-[48px] min-w-[48px]',
      'transition-all duration-deja-fast ease-deja-standard',
      'select-none',
      isActive
        ? 'scale-95 ring-2 ring-green-300/60 shadow-[0_0_12px_2px_rgba(74,222,128,0.3)]'
        : 'scale-100',
      props.horizontal ? '' : 'px-4'
    ].join(' ')
  }

  function getStopBtnClasses() {
    const isActive = pressedButton.value === 'stop'
    return [
      'rounded-3xl min-w-[48px] min-h-[48px] @[960px]:py-4 @[960px]:min-w-16',
      'h-auto mx-auto relative z-10',
      'transition-all duration-deja-fast ease-deja-standard',
      'select-none',
      isActive
        ? 'scale-95 ring-2 ring-red-300/60 shadow-[0_0_16px_4px_rgba(239,68,68,0.4)]'
        : 'scale-100',
    ].join(' ')
  }

  const iconClasses = 'h-5 w-10 @[400px]:h-6 @[400px]:w-6 @[960px]:h-8 @[960px]:w-14 relative'

</script>
<template>
  <div class="p-2 @[400px]:py-2 @[400px]:px-4 @[640px]:py-2 @[640px]:px-12 flex justify-stretch items-center flex-grow relative z-20"
    :class="`${horizontal ? 'flex-row px-1' : 'flex-col '}`">
    <v-btn
      class="flex-grow"
      :class="`${getBtnClasses('up5')} ${horizontal ? 'rounded-r-none rounded-l-3xl py-3' : 'rounded-b-none rounded-t-3xl'}`"
      color="green"
      @click="handleUp5"
      @pointerdown="(e) => handlePointerDown(e, 'up5')"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerLeave"
      @pointercancel="handlePointerLeave">
        <template v-if="horizontal">
          <v-icon icon="mdi-plus-thick" :class="iconClasses" />
          <v-icon icon="mdi-plus-thick" :class="iconClasses" />
        </template>
        <v-icon v-else icon="mdi-chevron-double-up" :class="iconClasses" />
    </v-btn>
    <hr class="border-black" />
    <v-btn
      class="rounded-none flex-grow"
      :class="`${getBtnClasses('up')} ${horizontal ? 'py-3' : ''}`"
      color="green"
      @click="handleUp"
      @pointerdown="(e) => handlePointerDown(e, 'up')"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerLeave"
      @pointercancel="handlePointerLeave">
      <v-icon
        :icon="horizontal ? 'mdi-plus' : 'mdi-chevron-up'"
        :class="iconClasses"
      />
    </v-btn>
    <v-btn
      :class="`${getStopBtnClasses()} ${horizontal ? '@[960px]:h-36 rounded-none py-3 px-4' : 'w-28 py-6 @[960px]:w-36 rounded-3xl'}`"
      color="red"
      @click="handleStop"
      @pointerdown="(e) => handlePointerDown(e, 'stop')"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerLeave"
      @pointercancel="handlePointerLeave">
      <v-icon icon="mdi-stop" />
    </v-btn>
    <v-btn
      class="rounded-none flex-grow"
      :class="`${getBtnClasses('down')} ${horizontal ? 'py-3' : ''}`"
      color="green"
      @click="handleDown"
      @pointerdown="(e) => handlePointerDown(e, 'down')"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerLeave"
      @pointercancel="handlePointerLeave">
      <v-icon
        :icon="horizontal ? 'mdi-minus' : 'mdi-chevron-down'"
        :class="iconClasses"
      />
    </v-btn>
    <hr class="border-black" />
    <v-btn
      class="flex-grow items-center justify-center"
      :class="`${getBtnClasses('down5')} ${horizontal ? 'rounded-l-none rounded-r-3xl py-3' : 'rounded-t-none rounded-b-3xl'}`"
      color="green"
      @click="handleDown5"
      @pointerdown="(e) => handlePointerDown(e, 'down5')"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerLeave"
      @pointercancel="handlePointerLeave">
        <template v-if="horizontal">
          <v-icon icon="mdi-minus-thick" :class="iconClasses" />
          <v-icon icon="mdi-minus-thick" :class="iconClasses" />
        </template>
        <v-icon v-else icon="mdi-chevron-double-down" :class="iconClasses" />
    </v-btn>
  </div>
</template>
