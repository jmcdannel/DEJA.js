<script setup lang="ts">
import type { ConsistLoco } from '@repo/modules/locos'

defineProps<{
  cloco: ConsistLoco
  expanded: boolean
}>()

defineEmits<{
  'toggle-expand': []
  flip: [cloco: ConsistLoco]
  trim: [cloco: ConsistLoco, delta: number]
  remove: [cloco: ConsistLoco]
}>()
</script>

<template>
  <div
    class="rounded-xl overflow-hidden cursor-pointer"
    :style="{
      background: cloco.direction ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)',
      border: `1px solid ${cloco.direction ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}`,
    }"
  >
    <!-- Card header — tap to expand -->
    <div
      class="flex items-center gap-3 p-3"
      @click="$emit('toggle-expand')"
    >
      <!-- Forward: arrow left of avatar. Reversed: avatar left of arrow -->
      <template v-if="cloco.direction">
        <span class="text-lg" style="color: #6ee7b7">◀</span>
      </template>
      <v-avatar :color="cloco.direction ? '#059669' : '#dc2626'" size="40">
        <span class="text-white font-bold text-sm">{{ cloco.address }}</span>
      </v-avatar>
      <template v-if="!cloco.direction">
        <span class="text-lg" style="color: #fca5a5">▶</span>
      </template>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold text-slate-200 truncate">{{ cloco.address }}</div>
        <div class="text-xs" :style="{ color: cloco.direction ? '#34d399' : '#f87171' }">
          {{ cloco.direction ? 'Forward' : 'Reversed' }} • Trim: {{ cloco.trim }}
        </div>
      </div>
    </div>

    <!-- Expandable action bar -->
    <div
      v-if="expanded"
      class="flex items-center justify-around py-2 px-3"
      :style="{
        background: 'rgba(0,0,0,0.2)',
        borderTop: `1px solid ${cloco.direction ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}`,
      }"
    >
      <!-- Flip -->
      <button
        class="flex flex-col items-center gap-0.5"
        @click.stop="$emit('flip', cloco)"
      >
        <span class="text-lg">🔄</span>
        <span class="text-[10px] text-gray-400">Flip</span>
      </button>

      <!-- Trim -->
      <div class="flex items-center gap-2">
        <button
          class="w-7 h-7 rounded-lg flex items-center justify-center text-red-400"
          style="background: rgba(255,255,255,0.1)"
          @click.stop="$emit('trim', cloco, -1)"
        >−</button>
        <div class="flex flex-col items-center">
          <span class="text-[10px] text-gray-400">Trim</span>
          <span class="text-base font-bold font-mono text-slate-200">{{ cloco.trim }}</span>
        </div>
        <button
          class="w-7 h-7 rounded-lg flex items-center justify-center text-green-400"
          style="background: rgba(255,255,255,0.1)"
          @click.stop="$emit('trim', cloco, 1)"
        >+</button>
      </div>

      <!-- Remove -->
      <button
        class="flex flex-col items-center gap-0.5"
        @click.stop="$emit('remove', cloco)"
      >
        <span class="text-lg text-red-400">🗑</span>
        <span class="text-[10px] text-red-400">Remove</span>
      </button>
    </div>
  </div>
</template>
