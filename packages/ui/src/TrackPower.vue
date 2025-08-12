<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { doc } from 'firebase/firestore'
import { useDocument } from 'vuefire'
import { db } from '@repo/firebase-config/firebase'
import { useDcc } from '@repo/dccex'

const DEFAULT_ON = '1 MAIN'
const DEFAULT_OFF = '0'

const layoutId = useStorage('@DEJA/layoutId', '')
const layoutDocRef = computed(() => layoutId.value ? doc(db, 'layouts', layoutId.value) : null)
const { data: layout } = useDocument<any>(() => layoutDocRef.value)

// Actual state reported by Firebase (authoritative)
const actualOn = computed<boolean | undefined>(() => layout.value?.dccEx?.power)

// Optimistic UI state (assume success on click)
const optimisticOn = ref<boolean>(false)

// Initialize/keep optimistic state in sync when actual changes (first load or external changes)
watch(actualOn, (val) => {
  if (typeof val === 'boolean') {
    optimisticOn.value = val
  }
}, { immediate: true })

const isDisabled = computed<boolean>(() => !layoutId.value)
const { setPower } = useDcc()

async function togglePower() {
  // Flip immediately for optimistic UX
  optimisticOn.value = !optimisticOn.value
  // Fire and forget; server will broadcast and Firebase will reconcile actual status
  await setPower(optimisticOn.value ? DEFAULT_ON : DEFAULT_OFF)
}

const actualDotColor = computed(() => {
  if (actualOn.value === true) return 'success'
  if (actualOn.value === false) return 'error'
  return 'grey'
})

const titleText = computed(() => {
  const optimistic = optimisticOn.value ? 'On' : 'Off'
  const actual = actualOn.value === true ? 'On' : actualOn.value === false ? 'Off' : 'Unknown'
  return `Track Power — Requested: ${optimistic}, Actual: ${actual}`
})
</script>

<template>
  <v-badge
    :color="actualDotColor"
    dot
    location="top end"
    offset-x="2"
    offset-y="2"
  >
    <v-btn
      class="mx-2"
      :color="optimisticOn ? 'success' : 'error'"
      icon="mdi-fence-electric"
      variant="flat"
      :disabled="isDisabled"
      @click="togglePower"
      :title="titleText"
      aria-label="Toggle track power"
    />
  </v-badge>
</template>
