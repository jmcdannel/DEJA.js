<script setup lang="ts">
import { useCollection } from 'vuefire'
import { useEfx, type Effect } from '@repo/modules/effects'
import { SignalList } from '@repo/ui'

const { getEffectsByType } = useEfx()
const signals = useCollection<Effect>(() => getEffectsByType('signal'), { ssrKey: 'signals' })
</script>
<template>
  <main class="p-3">
    <h1 class="text-2xl font-bold mb-3">Signals</h1>
    <SignalList />
  </main>
  
</template>

