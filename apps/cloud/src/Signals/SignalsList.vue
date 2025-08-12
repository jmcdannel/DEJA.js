<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCollection } from 'vuefire'
import { useEfx, type Effect } from '@repo/modules/effects'

const emit = defineEmits(['edit'])
const { getEffectsByType, runEffect, getEffect } = useEfx()
const list = useCollection<Effect>(() => getEffectsByType('signal'), { ssrKey: 'signals' })

// Helpers to toggle signal lights
async function setPinEffect(id?: string, state?: boolean) {
  if (!id) return
  const efx = await getEffect(id)
  if (!efx) return
  await runEffect({ ...efx, state: Boolean(state), id })
}

async function setSignal(signal: Effect, color: 'red' | 'yellow' | 'green') {
  const redOn = color === 'red'
  const yellowOn = color === 'yellow'
  const greenOn = color === 'green'

  // If clicking the already lit color, turn entire signal off
  const current = await getSignalActiveColor(signal)
  if (current === color) {
    await setPinEffect(signal.red, false)
    await setPinEffect(signal.yellow, false)
    await setPinEffect(signal.green, false)
    return
  }

  // Otherwise, set selected on and others off
  await setPinEffect(signal.red, redOn)
  await setPinEffect(signal.yellow, yellowOn)
  await setPinEffect(signal.green, greenOn)
}

async function getSignalActiveColor(signal: Effect): Promise<'red' | 'yellow' | 'green' | undefined> {
  const [r,y,g] = await Promise.all([
    signal.red ? getEffect(signal.red) : undefined,
    signal.yellow ? getEffect(signal.yellow) : undefined,
    signal.green ? getEffect(signal.green) : undefined,
  ])
  if (r?.state) return 'red'
  if (y?.state) return 'yellow'
  if (g?.state) return 'green'
  return undefined
}

</script>
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <slot name="prepend"></slot>
      </v-col>
      <v-col
        v-for="item in list"
        :key="item.id"
        cols="12" xs="12" sm="12" lg="12"
      >
        <v-card class="w-full">
          <v-card-title class="flex items-center justify-between">
            <span>{{ item.name || item.id }}</span>
            <v-btn icon="mdi-pencil" variant="text" size="small" @click="$emit('edit', item as any)" />
          </v-card-title>
          <v-card-text>
            <div class="flex items-center gap-4">
              <!-- Traffic light UI -->
              <div class="flex flex-col items-center p-3 rounded-lg bg-neutral-900 border border-neutral-700" style="width: 64px;">
                <v-btn :color="'red'" variant="flat" icon size="small" @click="setSignal(item as any, 'red')"/>
                <v-btn :color="'amber'" class="my-2" variant="flat" icon size="small" @click="setSignal(item as any, 'yellow')"/>
                <v-btn :color="'green'" variant="flat" icon size="small" @click="setSignal(item as any, 'green')"/>
              </div>
              <div>
                <div class="text-xs opacity-70">Pins</div>
                <div class="text-sm">R: {{ (item as any).red || '-' }} • Y: {{ (item as any).yellow || '-' }} • G: {{ (item as any).green || '-' }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  
</template>


