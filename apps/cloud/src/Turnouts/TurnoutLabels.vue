<script setup lang="ts">
import { computed } from 'vue'
import { useCollection } from 'vuefire'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'
import { TurnoutLabels } from '@repo/ui'

const { getTurnouts } = useTurnouts()
const turnoutsData = getTurnouts()
const turnouts = computed(() => 
  turnoutsData.value?.map(doc => ({ ...doc, id: doc.id } as Turnout)) || []
)
</script>
<template>
  <main class="p-4">
    <h1 class="text-xl font-semibold mb-3">Turnout Labels (Printable)</h1>
    <p class="text-sm opacity-70 mb-2">Use your browser's Print dialog (Cmd+P / Ctrl+P). Labels are 0.3in high with turnout color backgrounds.</p>
    <TurnoutLabels :turnouts="turnouts" />
  </main>
</template>


