<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import { useDisplay } from 'vuetify'
  import { useDcc } from '@repo/dccex'
  import { useFunctionIcon } from '@repo/modules/locos'

  const props = defineProps({
    func: {
        type: Object
    },
    address: {
        type: Number
    },
    showLabel: {
        type: Boolean,
        default: false
    },
    showDefaultIcon: {
        type: Boolean,
        default: false
    }
  })
  
  const { setFunction } = useDcc()
  const { getIconComponent } = useFunctionIcon()
  const func1State = ref(!!props.func?.state)
  const isPressed = ref(false)
  const icon = computed(() => getIconComponent(props.func?.icon))
  const isMomentary = computed(() => !!props.func?.isMomentary)
  const { mobile } = useDisplay()
  const keyActive = ref(false)

  watch(
    () => props.func?.state,
    (value) => {
      if (isMomentary.value && isPressed.value) {
        return
      }
      func1State.value = !!value
    }
  )

  function sendFunctionState(state: boolean) {
    if (props.address == null || props.func?.id == null) {
      return
    }
    setFunction(props.address, props.func.id, state)
  }

  function activateMomentary() {
    if (isPressed.value) {
      return
    }
    isPressed.value = true
    func1State.value = true
    sendFunctionState(true)
  }

  function releaseMomentary() {
    if (!isPressed.value) {
      return
    }
    isPressed.value = false
    func1State.value = false
    sendFunctionState(false)
  }

  function handlePointerDown(event: PointerEvent) {
    if (!props.func) {
      return
    }
    event.preventDefault()
    if (typeof event.pointerId === 'number') {
      (event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId)
    }
    if (isMomentary.value) {
      activateMomentary()
    } else {
      func1State.value = !func1State.value
      sendFunctionState(func1State.value)
    }
  }

  function handlePointerUp(event: PointerEvent) {
    if (typeof event.pointerId === 'number') {
      (event.currentTarget as HTMLElement)?.releasePointerCapture?.(event.pointerId)
    }
    if (isMomentary.value) {
      releaseMomentary()
    }
  }

  function handlePointerLeave() {
    if (isMomentary.value) {
      releaseMomentary()
    }
  }

  function handlePointerCancel() {
    if (isMomentary.value) {
      releaseMomentary()
    }
  }

  function handleKeyDown() {
    if (keyActive.value) {
      return
    }
    keyActive.value = true
    if (isMomentary.value) {
      activateMomentary()
    } else {
      func1State.value = !func1State.value
      sendFunctionState(func1State.value)
    }
  }

  function handleKeyUp() {
    if (!keyActive.value) {
      return
    }
    keyActive.value = false
    if (isMomentary.value) {
      releaseMomentary()
    }
  }

  const buttonClasses = computed(() => {
    const classes = [
      'rounded-full',
      'border',
      'border-cyan-400/60',
      'bg-slate-900/80',
      'relative',
      'p-2',
      'transition-all',
      'duration-deja-fast',
      'ease-deja-standard',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-cyan-300',
    ]
    if (isMomentary.value) {
      classes.push(
        'bg-blue-900/80',
        'text-cyan-100',
        'shadow-[inset_0_3px_6px_rgba(14,165,233,0.25)]'
      )
      if (func1State.value) {
        classes.push('ring-2', 'ring-cyan-300', 'shadow-inner', 'scale-95')
      }
    } else {
      classes.push('bg-gradient-to-br', 'from-cyan-600', 'to-indigo-600', 'rounded-full')
      if (func1State.value) {
        classes.push('ring-2', 'ring-cyan-200', 'shadow-lg')
      }
    }
    return classes.join(' ')
  })

  onBeforeUnmount(() => {
    if (isMomentary.value) {
      releaseMomentary()
    }
  })

  const sharedListeners = {
    onPointerdown: handlePointerDown,
    onPointerup: handlePointerUp,
    onPointerleave: handlePointerLeave,
    onPointercancel: handlePointerCancel,
    onKeydown: (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault()
        handleKeyDown()
      }
    },
    onKeyup: (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault()
        handleKeyUp()
      }
    },
  }
</script>
<template>
  <v-btn 
    v-if="func && showLabel && !mobile" 
    v-bind="sharedListeners"
    :prepend-icon="icon"
    :class="[buttonClasses, 'px-4 gap-2 justify-start text-sm font-semibold tracking-wide']"
  >
    {{ func?.label }}
  </v-btn>
  <v-btn 
    v-else-if="func && showLabel" 
    v-bind="sharedListeners"
    :prepend-icon="icon"
    :class="[buttonClasses, 'px-3 gap-2 text-sm font-semibold tracking-wide']"
  >
    {{ func?.label }}
  </v-btn>
  <v-btn 
    v-else-if="func" 
    v-bind="sharedListeners"
    :icon="icon"
    :class="[buttonClasses, 'w-12 h-12']"
  />
    
</template>