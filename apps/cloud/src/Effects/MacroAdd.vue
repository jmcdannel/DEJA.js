<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEfx, type Effect } from '@repo/modules/effects'
import { useLocos, type Loco } from '@repo/modules/locos'
import { useTurnouts, type Turnout, efxTypes } from '@repo/modules'

const emit = defineEmits(['add', 'close'])

interface MacroLoco extends Loco {
  speed: number
  direction: 'forward' | 'reverse'
}

const { getEffects } = useEfx()
const { getLocos } = useLocos()
const { getTurnouts } = useTurnouts()

const effects = getEffects()
const turnouts = getTurnouts()
const locos = getLocos()

// --- search state ---
const effectSearch = ref('')
const turnoutSearch = ref('')

// --- selection state ---
const selectedEffects = ref<Effect[]>([])
const selectedTurnouts = ref<Turnout[]>([])
const selectedLocos = ref<MacroLoco[]>([])

// --- filtered lists ---
const filteredEffects = computed(() => {
  const q = effectSearch.value.trim().toLowerCase()
  if (!q) return effects.value ?? []
  return (effects.value ?? []).filter((e) =>
    e.name?.toLowerCase().includes(q) ||
    e.type?.toLowerCase().includes(q) ||
    e.id?.toLowerCase().includes(q),
  )
})

const filteredTurnouts = computed(() => {
  const q = turnoutSearch.value.trim().toLowerCase()
  if (!q) return turnouts.value ?? []
  return (turnouts.value ?? []).filter((t) =>
    t.name?.toLowerCase().includes(q) ||
    t.device?.toLowerCase().includes(q) ||
    t.id?.toLowerCase().includes(q),
  )
})

function effectIcon(type: string) {
  return efxTypes.find((t) => t.value === type)?.icon ?? 'mdi-lightning-bolt'
}

function toggleEffect(efx: Effect) {
  const idx = selectedEffects.value.findIndex((e) => e.id === efx.id)
  if (idx === -1) selectedEffects.value.push(efx)
  else selectedEffects.value.splice(idx, 1)
}

function toggleTurnout(t: Turnout) {
  const idx = selectedTurnouts.value.findIndex((s) => s.id === t.id)
  if (idx === -1) selectedTurnouts.value.push(t)
  else selectedTurnouts.value.splice(idx, 1)
}

function toggleLoco(loco: Loco) {
  const idx = selectedLocos.value.findIndex((l) => l.id === loco.id)
  if (idx === -1) {
    selectedLocos.value.push({ ...loco, speed: 0, direction: 'forward' } as MacroLoco)
  } else {
    selectedLocos.value.splice(idx, 1)
  }
}

function isEffectSelected(efx: Effect) {
  return selectedEffects.value.some((e) => e.id === efx.id)
}

function isTurnoutSelected(t: Turnout) {
  return selectedTurnouts.value.some((s) => s.id === t.id)
}

function isLocoSelected(loco: Loco) {
  return selectedLocos.value.some((l) => l.id === loco.id)
}

function selectedLoco(loco: Loco): MacroLoco | undefined {
  return selectedLocos.value.find((l) => l.id === loco.id)
}

function handleOk() {
  emit('add', selectedEffects.value, selectedTurnouts.value, selectedLocos.value)
}
</script>

<template>
  <v-card min-width="480" max-width="640" color="surface">
    <v-card-item>
      <template #prepend>
        <v-icon icon="mdi-plus" />
      </template>
      <v-card-title>Add to Macro</v-card-title>
    </v-card-item>

    <v-card-text class="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">

      <!-- Effects -->
      <div>
        <div class="text-sm font-semibold opacity-60 mb-2 uppercase tracking-wide">Effects</div>
        <v-text-field
          v-model="effectSearch"
          placeholder="Search effects…"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          class="mb-2"
        />
        <div v-if="filteredEffects.length === 0" class="text-sm opacity-40 py-1">
          No effects match "{{ effectSearch }}"
        </div>
        <div class="flex flex-wrap gap-1">
          <v-btn
            v-for="efx in filteredEffects"
            :key="efx.id"
            :prepend-icon="effectIcon(efx.type)"
            :color="isEffectSelected(efx) ? 'deep-purple' : undefined"
            :variant="isEffectSelected(efx) ? 'flat' : 'tonal'"
            size="small"
            class="m-0.5"
            @click="toggleEffect(efx)"
          >
            {{ efx.name }}
          </v-btn>
        </div>
      </div>

      <v-divider />

      <!-- Turnouts -->
      <div>
        <div class="text-sm font-semibold opacity-60 mb-2 uppercase tracking-wide">Turnouts</div>
        <v-text-field
          v-model="turnoutSearch"
          placeholder="Search turnouts…"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          class="mb-2"
        />
        <div v-if="filteredTurnouts.length === 0" class="text-sm opacity-40 py-1">
          No turnouts match "{{ turnoutSearch }}"
        </div>
        <div class="flex flex-wrap gap-1">
          <v-btn
            v-for="t in filteredTurnouts"
            :key="t.id"
            prepend-icon="mdi-directions-fork"
            :color="isTurnoutSelected(t) ? 'yellow' : undefined"
            :variant="isTurnoutSelected(t) ? 'flat' : 'tonal'"
            size="small"
            class="m-0.5"
            @click="toggleTurnout(t)"
          >
            {{ t.name }}
          </v-btn>
        </div>
      </div>

      <v-divider />

      <!-- Locos / Throttles -->
      <div>
        <div class="text-sm font-semibold opacity-60 mb-2 uppercase tracking-wide">Locos</div>
        <div class="flex flex-wrap gap-1 mb-3">
          <v-btn
            v-for="loco in locos"
            :key="loco.id"
            prepend-icon="mdi-train"
            :color="isLocoSelected(loco) ? 'blue' : undefined"
            :variant="isLocoSelected(loco) ? 'flat' : 'tonal'"
            size="small"
            class="m-0.5"
            @click="toggleLoco(loco)"
          >
            {{ loco.name || loco.address }}
          </v-btn>
        </div>

        <!-- Speed + direction controls for selected locos -->
        <div v-if="selectedLocos.length > 0" class="flex flex-col gap-2">
          <div class="text-xs opacity-50 uppercase tracking-wide mb-1">Throttle Settings</div>
          <div
            v-for="loco in selectedLocos"
            :key="loco.id"
            class="flex items-center gap-3 p-2 rounded-lg"
            style="background: rgba(var(--v-theme-on-surface), 0.04)"
          >
            <v-avatar color="blue" variant="tonal" size="32">{{ loco.address }}</v-avatar>
            <span class="text-sm font-medium flex-1">{{ loco.name || loco.address }}</span>
            <v-text-field
              v-model="loco.speed"
              type="number"
              min="0"
              max="128"
              label="Speed"
              hide-details
              single-line
              variant="outlined"
              density="compact"
              append-inner-icon="mdi-speedometer"
              style="max-width: 110px"
            />
            <v-btn
              :append-icon="loco.direction === 'forward' ? 'mdi-arrow-right' : 'mdi-arrow-left'"
              :color="loco.direction === 'forward' ? 'blue' : 'orange'"
              variant="tonal"
              size="small"
              @click="loco.direction = loco.direction === 'forward' ? 'reverse' : 'forward'"
            >
              {{ loco.direction === 'forward' ? 'Fwd' : 'Rev' }}
            </v-btn>
          </div>
        </div>
      </div>

    </v-card-text>

    <v-card-actions>
      <v-btn variant="outlined" @click="$emit('close')">Cancel</v-btn>
      <v-spacer />
      <v-btn color="primary" variant="flat" @click="handleOk">
        Add {{ selectedEffects.length + selectedTurnouts.length + selectedLocos.length > 0
          ? `(${selectedEffects.length + selectedTurnouts.length + selectedLocos.length})`
          : '' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
