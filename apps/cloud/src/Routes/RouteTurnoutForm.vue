<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTurnouts, type Turnout, type RouteTurnoutConfig } from '@repo/modules'
import TurnoutAdd from '@/Routes/TurnoutAdd.vue'

const emit = defineEmits(['change'])
const props = defineProps<{
  turnouts: RouteTurnoutConfig[]
}>()

const ondialog = ref(false)
const turnoutChips = ref<RouteTurnoutConfig[]>(props.turnouts || [])

watch(() => props.turnouts, (newTurnouts) => {
  turnoutChips.value = [...(newTurnouts || [])]
}, { deep: true })

const { setTurnout } = useTurnouts()

function handleRemove(ids: Array<string> | undefined) {
  turnoutChips.value = turnoutChips.value.filter((chip) => !ids?.includes(String(chip.id ?? '')))
  emitChanges()
}

function handleAddTurnouts(_effects: unknown[], turnouts: Turnout[]) {
  const merged = turnoutChips.value.concat(
    turnouts.map((t) => ({
      id: t.id,
      name: t.name,
      device: t.device,
      type: 'turnout',
      state: t.state ?? true,
    }))
  )
  const deduped = new Map<string, RouteTurnoutConfig>()
  merged.forEach((chip, index) => {
    const key = chip.id ? String(chip.id) : `generated-${index}`
    deduped.set(key, { ...chip })
  })
  turnoutChips.value = Array.from(deduped.values())
  emitChanges()
  ondialog.value = false
}

function emitChanges() {
  emit('change', [...turnoutChips.value])
}

function handleChipClick(chip: RouteTurnoutConfig) {
  if (chip.type === 'turnout') {
    const turnout: Partial<Turnout> = {
      id: chip.id?.toString(),
      name: chip.name,
      device: chip.device,
      state: chip.state,
    }
    if (turnout.id) {
      setTurnout(turnout.id, { ...turnout, state: chip.state ?? true })
    }
  }
}

function toggleChipState(chip: RouteTurnoutConfig) {
  chip.state = !(chip.state ?? true)
  emitChanges()
}

</script>
<template>
  <v-card title="TURNOUTS" color="green" variant="tonal">
    <template #prepend>
      <v-icon icon="mdi-rocket-launch" color="green-lighten-1"></v-icon>
    </template>
    <template #append>
      <v-btn @click="ondialog = true" icon="mdi-plus" color="purple"></v-btn>
    </template>
    <v-card-text>
      <v-chip-group column multiple
        color="purple"
        variant="flat"
        :model-value="turnoutChips" >
        <v-chip v-for="chip in turnoutChips" :key="chip.id" :value="chip.id"
          size="small"
          @click="handleChipClick(chip)"
          color="primary"
          variant="outlined"
          selected
        >
          <template #prepend>
            <v-icon
              @click.stop="toggleChipState(chip)"
              class="mr-2"
              :icon="chip.type === 'turnout' ? 'mdi-directions-fork' : 'mdi-rocket-launch'"
              :color="(chip.state ?? true) ? 'green' : 'red'">
            </v-icon>
            {{ (chip.state ?? true) ? 'Straight' : 'Divergent' }}
          </template>
          <template #append>
            <v-icon
              @click.stop="handleRemove([chip.id?.toString() || ''])"
              class="ml-2"
              icon="mdi-delete"
              color="grey">
            </v-icon>
          </template>
        {{ chip.name }}
        </v-chip>
      </v-chip-group>
    </v-card-text>
  </v-card>

  <v-dialog
    v-model="ondialog"
    width="auto"
  >
   <TurnoutAdd @close="ondialog = false" @add="handleAddTurnouts" defaultState="on" />
  </v-dialog>
</template>
