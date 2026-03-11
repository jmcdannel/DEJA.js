<script setup lang="ts">
import { computed } from 'vue'
import { collection, query } from 'firebase/firestore'
import { useStorage } from '@vueuse/core'
import { useCollection } from 'vuefire'
import { db } from '@repo/firebase-config'

const layoutId = useStorage<string | null>('@DEJA/layoutId', null)

const sensorsCol = computed(() => {
  if (!layoutId.value) return null
  return query(collection(db, `layouts/${layoutId.value}/sensors`))
})

const sensors = useCollection(sensorsCol, { ssrKey: 'sensors' })

const total = computed(() => sensors.value?.length ?? 0)
const active = computed(() => sensors.value?.filter(s => s.state)?.length ?? 0)
const enabled = computed(() => sensors.value?.filter(s => s.enabled)?.length ?? 0)
</script>

<template>
  <v-card color="teal" variant="tonal" class="pa-4">
    <v-card-title class="flex items-center gap-2">
      <v-icon>mdi-access-point</v-icon>
      Sensors
    </v-card-title>
    <v-card-text>
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-3xl font-bold">{{ total }}</div>
          <div class="text-xs opacity-70">Total</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-green-400">{{ active }}</div>
          <div class="text-xs opacity-70">Active</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-blue-400">{{ enabled }}</div>
          <div class="text-xs opacity-70">Enabled</div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
