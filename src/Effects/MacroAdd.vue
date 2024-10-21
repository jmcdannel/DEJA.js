<script setup lang="ts">
import { ref } from 'vue'
import { useEfx } from '@/Effects/useEfx'
import { useTurnouts } from '@/Turnouts/useTurnouts'

const emit = defineEmits(['add', 'close'])

const { getEffects } = useEfx()
const { getTurnouts } = useTurnouts()

const effects = getEffects()
const turnouts = getTurnouts()

const effectChips = ref([])
const turnoutChips = ref([])

function handleOk() {
  console.log('handleOk', effectChips.value, turnoutChips.value)
  emit('add', effectChips.value, turnoutChips.value)

  // dialog.value = false
}

function handleEffect(e) {
  console.log('handleEffect', e)
  onChips.value = onChips.value.concat({
    id: e.id,
    name: e.name,
    type: 'effect'
  })
  
}
function handleTurnout(e) {
  console.log('handleTurnout', e, arguments)  
  onChips.value = onChips.value.concat({
    id: e.id,
    name: e.name,
    type: 'turnout'
  })
}

</script>
<template>
  <v-card
      min-width="400"
      prepend-icon="mdi-plus"
      title="Add to Macro"
    >
      <template #text>
        <v-sheet class="p-4 mb-4" color="deep-purple">
          <h2 class="text-lg text-purple-200">Effects</h2>
          <v-chip-group column multiple 
            variant="flat"
            v-model="effectChips" >
            <v-chip v-for="chip in effects" :key="chip.id" :value="chip"          
              size="small"
              color="deep-purple-darken-4"
              variant="flat"
              selected
            >{{ chip.id }}</v-chip>
          </v-chip-group>
        </v-sheet>
        <v-divider class="my-4 border-fuchsia-500"></v-divider>
        <v-sheet class="p-4 mb-4" color="yellow-lighten-2">
          <h2 class="text-lg text-yellow-900">Turnouts</h2>
          <v-chip-group column multiple 
            variant="flat"
            v-model="turnoutChips">
            <v-chip v-for="chip in turnouts" :key="chip.id" :value="chip"          
              size="small"
              color="yellow-darken-2"
              variant="flat"
              selected
            >{{ chip.name }}</v-chip>
          </v-chip-group>
        </v-sheet>
        
      </template>
      <template v-slot:actions>
        <v-btn
          class="ms-auto"
          text="Cancel"
          variant="outlined"
          color="purple"
          @click="$emit('close')"
        ></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          class="ms-auto"
          text="Ok"
          variant="flat"
          color="purple"
          @click="handleOk"
        ></v-btn>
      </template>
    </v-card>
</template>