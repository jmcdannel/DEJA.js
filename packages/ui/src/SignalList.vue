<script setup lang="ts">
import { useCollection } from 'vuefire'
import { useEfx, type Effect } from '@repo/modules/effects'

defineEmits(['edit'])

const { getEffectsByType, runEffect, getEffect } = useEfx()
const list = useCollection<Effect>(() => getEffectsByType('signal'), { ssrKey: 'signals' })

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

  const current = await getSignalActiveColor(signal)
  if (current === color) {
    await setPinEffect((signal as any).red, false)
    await setPinEffect((signal as any).yellow, false)
    await setPinEffect((signal as any).green, false)
    return
  }

  await setPinEffect((signal as any).red, redOn)
  await setPinEffect((signal as any).yellow, yellowOn)
  await setPinEffect((signal as any).green, greenOn)
}

async function getSignalActiveColor(signal: Effect): Promise<'red' | 'yellow' | 'green' | undefined> {
  const [r,y,g] = await Promise.all([
    (signal as any).red ? getEffect((signal as any).red) : undefined,
    (signal as any).yellow ? getEffect((signal as any).yellow) : undefined,
    (signal as any).green ? getEffect((signal as any).green) : undefined,
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
      <v-col v-for="item in list" :key="item.id" cols="12" xs="12" sm="12" lg="12">
        <v-card class="w-full">
          <v-card-title class="flex items-center justify-between">
            <span>{{ item.name || item.id }}</span>
            <slot name="actions" :item="item">
              <v-btn icon="mdi-pencil" variant="text" size="small" @click="$emit('edit', item as any)" />
            </slot>
          </v-card-title>
          <v-card-text>
            <div class="flex items-center gap-4">
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


