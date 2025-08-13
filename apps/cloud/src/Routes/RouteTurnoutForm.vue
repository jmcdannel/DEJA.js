<script setup lang="ts">
import { ref } from 'vue'
import { useTurnouts, useEfx, type Turnout, type Effect, type MacroItem } from '@repo/modules'
import TurnoutAdd from '@/Routes/TurnoutAdd.vue'

const emit = defineEmits(['change'])
const props = defineProps<{
  on: Array<any>
}>()

const ondialog = ref(false)
const onChips = ref(props.on || [])

const { setTurnout } = useTurnouts()
const { runEffect } = useEfx()

function handleOnUpdate(e: Array<string> | undefined) {
  console.log('handleOnUpdate', onChips.value)
  // remove e from onChips
  onChips.value = onChips.value.filter((c: MacroItem) => c.id !== e?.[0])
  emitChanges()  
}

function handleAddOn(effects: Effect[], turnouts: Turnout[]) {
  console.log('handleAddOn', effects, turnouts)
  onChips.value = onChips.value.concat(effects.map((e) => ({
    id: e.id,
    name: e.name,
    device: e.device,
    type: 'effect',
    state: true,
  })))
  onChips.value = onChips.value.concat(turnouts.map((t) => ({
    id: t.id,
    name: t.name,
    device: t.device,
    type: 'turnout',
    state: true,
  })))
  emitChanges()
  ondialog.value = false
}


function emitChanges() {
  emit('change', {
    on: onChips.value
  })
}

function handleChipClick(chip: MacroItem) {
  if (chip.type === 'turnout') {
    // Create a proper Turnout object from the MacroItem
    const turnout: Turnout = {
      id: chip.id?.toString() || '',
      name: chip.name || '',
      device: chip.device || '',
      type: chip.type || '',
      state: chip.state || false
    }
    setTurnout(turnout.id, { ...turnout, state: chip.state || false })
  }
}

async function handleRoute(state: boolean) {
  console.log('handleRoute', state)

  for (let i = 0; i < onChips.value.length; i++) {
    const chip = onChips.value[i] as MacroItem;
    if (chip.type === 'turnout') {
      const turnout: Turnout = {
        id: chip.id?.toString() || '',
        name: chip.name || '',
        device: chip.device || '',
        type: chip.type || '',
        state: state ? (chip.state || false) : !(chip.state || false)
      }
      setTurnout(turnout.id, { ...turnout, state: chip.state || false })
    }
  }
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
        :model-value="onChips" >
        <v-chip v-for="chip in onChips" :key="chip.id" :value="chip.id"          
          size="small"
          @click="handleChipClick(chip)"
          color="primary"
          variant="outlined"
          selected
        >        
          <template #prepend>
            <v-icon 
              @click="chip.state = !chip.state"
              class="mr-2"
              :icon="chip.type === 'effect' ? 'mdi-rocket-launch' : 'mdi-directions-fork'" 
              :color="chip.state ? 'green' : 'red'">
            </v-icon>
            {{ chip.state }}
          </template>  
          <template #append>
            <v-icon 
              @click="handleOnUpdate([chip.id])"
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

<v-sheet>
  <v-btn text="Turn Route ON" @click="handleRoute(true)">
    <v-icon left>mdi-rocket-launch</v-icon>
    Turn Route ON
  </v-btn>
</v-sheet>

  <v-dialog
    v-model="ondialog"
    width="auto"
  >
   <TurnoutAdd @close="ondialog = false" @add="handleAddOn" defaultState="on" />
  </v-dialog>


</template>
