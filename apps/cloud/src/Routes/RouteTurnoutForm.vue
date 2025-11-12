<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCollection } from 'vuefire'
import { useTurnouts, type Turnout, type RouteTurnoutConfig } from '@repo/modules/index.ts'
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

const { setTurnout, getTurnoutsByIds } = useTurnouts()
const turnouts = useCollection(props?.turnouts ? getTurnoutsByIds(props.turnouts.map(t => t.id?.toString() || '')) : null)

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

function handleTurnoutToggle(tId: string) {
  if (!turnouts.value) return
  if (!tId) return
  const turnout = turnouts.value.find(t => t.id === tId)
  if (!turnout) return
  setTurnout(turnout.id, { ...turnout, state: !turnout.state })

}

function toggleChipState(chip: RouteTurnoutConfig) {
  chip.state = !(chip.state ?? true)
  emitChanges()
}

function getTurnoutState(tId: string) {
  if (!turnouts.value) return true
  const turnout = turnouts.value.find(t => t.id === tId)
  return turnout?.state ?? true
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
        <template v-for="chip in turnoutChips" :key="chip.id" :value="chip.id">
          <v-chip 
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
          <v-icon v-if="chip.id" @click="handleTurnoutToggle(chip.id?.toString() || '')" class="ml-1 mr-3" :color="(getTurnoutState(chip?.id?.toString()) ?? true) ? 'green' : 'red'" icon="mdi-circle-slice-8" size="20" />
        </template>
    </v-card-text>
  </v-card>

  <v-dialog
    v-model="ondialog"
    width="auto"
  >
   <TurnoutAdd @close="ondialog = false" @add="handleAddTurnouts" defaultState="on" />
  </v-dialog>
</template>
