<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import TurnoutForm from '@/Turnouts/TurnoutForm.vue'
import { useTurnouts, type Turnout } from '@repo/modules'

const route = useRoute()
const router = useRouter()
const { getTurnout } = useTurnouts()
const turnout = ref<Turnout | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function loadTurnout() {
  loading.value = true
  error.value = null
  const turnoutId = route.params.turnoutId as string
  try {
    turnout.value = await getTurnout(turnoutId)
  } catch (err) {
    console.error(err)
    error.value = 'Unable to load turnout.'
  } finally {
    loading.value = false
  }
}

function handleClose() {
  router.push({ name: 'Turnouts' })
}

onMounted(loadTurnout)
</script>
<template>
  <ModuleTitle menu="Turnouts" />
  <div v-if="loading" class="p-6 flex justify-center">
    <v-progress-circular indeterminate color="yellow" />
  </div>
  <v-alert v-else-if="error" type="error" class="ma-4" :text="error" closable @click:close="handleClose" />
  <TurnoutForm v-else :turnout="turnout" @close="handleClose" />
</template>
