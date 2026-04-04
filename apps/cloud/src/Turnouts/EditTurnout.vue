<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createLogger } from '@repo/utils'
import TurnoutForm from '@/Turnouts/TurnoutForm.vue'
import FormPageHeader from '@/Common/FormPageHeader.vue'
import { useTurnouts, type Turnout } from '@repo/modules'

const log = createLogger('EditTurnout')

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
    log.error(err)
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
  <div class="animate-fade-in-up space-y-4 max-w-[800px] px-4">
    <FormPageHeader
      icon="mdi-call-split"
      :title="turnout?.name || 'Edit Turnout'"
      color="#f59e0b"
      back-label="Turnouts"
      :back-route="{ name: 'Turnouts' }"
    >
      <template #subtitle>
        <span v-if="turnout?.turnoutIdx !== undefined" class="text-xs text-white/45 bg-white/6 px-2 py-0.5 rounded font-mono">
          Index #{{ turnout.turnoutIdx }}
        </span>
        <span v-if="turnout?.device" class="text-xs text-white/45">{{ turnout.device }}</span>
      </template>
    </FormPageHeader>

    <div v-if="loading" class="p-6 flex justify-center">
      <v-progress-circular indeterminate color="amber" />
    </div>
    <v-alert v-else-if="error" type="error" class="ma-4" :text="error" closable @click:close="handleClose" />
    <TurnoutForm v-else :turnout="turnout" @close="handleClose" />
  </div>
</template>
