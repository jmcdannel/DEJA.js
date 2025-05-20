<script setup lang="ts">
import { ref } from 'vue'
import { useEfx } from '@/Effects/useEfx'
import { useTurnouts } from '@/Turnouts/useTurnouts'

const emit = defineEmits(['add', 'close'])
const props = defineProps({
  defaultState: String
})

const { getEffects } = useEfx()
const { getTurnouts } = useTurnouts()

const effects = getEffects()
const turnouts = getTurnouts()

const effectChips = ref([])
const turnoutChips = ref([])

function handleOk() {
  console.log('handleOk', effectChips.value, turnoutChips.value)
  emit('add', effectChips.value, turnoutChips.value)
}

</script>
<template>
  <v-card
      min-width="400"
      prepend-icon="mdi-plus"
      title="Add to Macro"
       color="deep-purple"
    >
      <template #text>
        <v-sheet class="p-4 mb-4" color="surface">
          <h2 class="text-lg">Effects</h2>
          <v-chip-group column multiple 
            variant="flat"
            v-model="effectChips">
            <v-chip v-for="chip in effects" :key="chip.id" :value="chip"
              size="small"
              color="deep-purple"
              variant="outlined"
              selected
            >
            {{ chip.name }}
          </v-chip>
          </v-chip-group>
        </v-sheet>
        <v-divider class="my-4 border-fuchsia-500"></v-divider>
        <v-sheet class="p-4 mb-4" color="surface">
          <h2 class="text-lg">Turnouts</h2>
          <v-chip-group column multiple 
            variant="flat"
            v-model="turnoutChips">
            <v-chip v-for="chip in turnouts" :key="chip.id" :value="chip"          
              size="small"
              color="yellow"
              variant="outlined"
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
          color="surface"
          @click="$emit('close')"
        ></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          class="ms-auto"
          text="Ok"
          variant="flat"
          color="surface"
          @click="handleOk"
        ></v-btn>
      </template>
    </v-card>
</template>