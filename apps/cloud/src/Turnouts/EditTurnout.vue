<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createLogger } from '@repo/utils'
import TurnoutForm from '@/Turnouts/TurnoutForm.vue'
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
    <!-- ═══ HERO HEADER ═══ -->
    <div
      class="flex items-center gap-4 p-5 rounded-[14px] border"
      style="
        background: linear-gradient(135deg, rgba(245,158,11,0.08), transparent);
        border-color: rgba(245,158,11,0.15);
      "
    >
      <div class="w-14 h-14 rounded-[14px] flex items-center justify-center flex-shrink-0 bg-amber-500/80">
        <v-icon size="28" color="white">mdi-call-split</v-icon>
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-white/95 tracking-tight">{{ turnout?.name || 'Edit Turnout' }}</h1>
        <div class="flex items-center gap-2.5 mt-1">
          <span v-if="turnout?.turnoutIdx !== undefined" class="text-xs text-white/45 bg-white/6 px-2 py-0.5 rounded font-mono">
            Index #{{ turnout.turnoutIdx }}
          </span>
          <span v-if="turnout?.device" class="text-xs text-white/45">{{ turnout.device }}</span>
        </div>
      </div>
      <v-btn variant="outlined" size="small" class="text-none" @click="router.push({ name: 'Turnouts' })">
        <v-icon start size="16">mdi-arrow-left</v-icon>
        Turnouts
      </v-btn>
    </div>

    <div v-if="loading" class="p-6 flex justify-center">
      <v-progress-circular indeterminate color="amber" />
    </div>
    <v-alert v-else-if="error" type="error" class="ma-4" :text="error" closable @click:close="handleClose" />
    <TurnoutForm v-else :turnout="turnout" @close="handleClose" />
  </div>
</template>
