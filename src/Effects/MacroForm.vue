<script setup lang="ts">
import { ref } from 'vue'
import MacroAdd from '@/Effects/MacroAdd.vue'

const emit = defineEmits(['change'])
const props = defineProps<{
  on: Array<any>,
  off: Array<any>
}>()

const ondialog = ref(false)
const offdialog = ref(false)
const onChips = ref(props.on || [])
const offChips = ref(props.off || [])

function handleOnUpdate(e) {
  console.log('handleOnUpdate', e, onChips.value)
  // remove e from onChips
  onChips.value = onChips.value.filter((c) => c.id !== e?.[0])
  emitChanges()  
}

function handleOffUpdate(e) {
  console.log('handleOffUpdate', e, offChips.value)
  // remove e from onChips
  offChips.value = offChips.value.filter((c) => c.id !== e?.[0])
  emitChanges()  
}

function handleAddOn(effects, turnouts) {
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

function handleAddOff(effects, turnouts) {
  console.log('handleAddOff', effects, turnouts)
  offChips.value = offChips.value.concat(effects.map((e) => ({
    id: e.id,
    name: e.name,
    device: e.device,
    type: 'effect',
    state: false,
  })))
  offChips.value = offChips.value.concat(turnouts.map((t) => ({
    id: t.id,
    name: t.name,
    device: t.device,
    type: 'turnout',
    state: false,
  })))
  emitChanges()
  offdialog.value = false
}

function emitChanges() {
  emit('change', {
    on: onChips.value,
    off: offChips.value
  })
}

</script>
<template>

  <v-card title="ON" color="green" variant="tonal">
    <template #prepend>
      <v-btn icon="mdi-rocket-launch" color="green-lighten-1"></v-btn>
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

<v-card title="OFF" color="red" variant="tonal">
  <template #prepend>
    <v-btn icon="mdi-rocket-launch" color="red-lighten-1"></v-btn>
  </template>
  <template #append>
    <v-btn @click="offdialog = true" icon="mdi-plus" color="purple"></v-btn>
  </template>
  <v-card-text>     
    <v-chip-group column multiple 
      color="purple" 
      variant="flat"
      :model-value="offChips" >
      <v-chip v-for="chip in offChips" :key="chip.id" :value="chip.id"          
        size="small"
        color="primary"
        variant="outlined"
        :prepend-icon="chip.type === 'effect' ? 'mdi-rocket-launch' : 'mdi-directions-fork'"
        selected
      >
        <template #prepend>
          <v-icon 
            @click="chip.state = !chip.state"
            class="mr-2"
            :icon="chip.type === 'effect' ? 'mdi-rocket-launch' : 'mdi-directions-fork'" 
            :color="chip.state ? 'green' : 'red'">
          </v-icon>
        </template>  
        <template #append>
          <v-icon 
            @click="handleOffUpdate([chip.id])"
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
   <MacroAdd @close="ondialog = false" @add="handleAddOn" defaultState="on" />
  </v-dialog>
  <v-dialog
    v-model="offdialog"
    width="auto"
  >
   <MacroAdd @close="offdialog = false" @add="handleAddOff" defaultState="off" />
  </v-dialog>


</template>
