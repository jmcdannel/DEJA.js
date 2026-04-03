<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocos, type Loco } from '@repo/modules/locos'
import { LocoRoster } from '@repo/ui'

const router = useRouter()
const { getLocos } = useLocos()
const locos = getLocos()

const locosList = computed(() => (locos.value as Loco[]) ?? [])

function handleLocoSelect(loco: Loco) {
  if (loco.address) {
    router.push({ name: 'throttle', params: { address: loco.address } })
  }
}
</script>

<template>
  <main class="@container min-h-screen overflow-auto p-2 md:p-4">
    <LocoRoster
      :locos="locosList"
      default-view="avatar"
      module-name="throttle-roster"
      @select="handleLocoSelect"
    />
  </main>
</template>
