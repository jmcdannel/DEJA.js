<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEfx, type Effect } from '@repo/modules/effects'
import { useLocos, type Loco } from '@repo/modules/locos'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'

const emit = defineEmits(['add', 'close'])

interface MacroLoco extends Loco {
  speed: number
  direction: 'forward' | 'reverse'
  isSelected?: boolean
  type: string
}

const { getEffects } = useEfx()
const { getLocos } = useLocos()
const { getTurnouts } = useTurnouts()

const effects = getEffects()
const turnouts = getTurnouts()
const locos = getLocos()

const effectChips = ref([] as Effect[])
const locoChips = ref([] as MacroLoco[])
const turnoutChips = ref([] as Turnout[])
const throttles = computed(() => locoChips.value.map((loco: Loco) => ({
  speed: 0,
  direction: 'forward',
  type: 'throttle',
  ...loco,
} as MacroLoco)) as MacroLoco[])

function handleOk() {
  console.log('handleOk', effectChips.value, turnoutChips.value, locoChips.value, throttles.value)
  emit('add', effectChips.value, turnoutChips.value, throttles.value)
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
        <v-divider class="my-4 border-fuchsia-500"></v-divider>
        <v-sheet class="p-4 mb-4" color="surface">
          <h2 class="text-lg">Locos</h2>
          <v-chip-group column multiple 
            variant="flat"
            v-model="locoChips">
            <v-chip v-for="chip in locos" :key="chip.id" :value="chip"
              size="small"
              color="yellow"
              variant="outlined"
              selected
            >{{ chip.name }}</v-chip>
          </v-chip-group>
        </v-sheet>
        <v-divider class="my-4 border-fuchsia-500"></v-divider>
        <v-sheet class="p-4 mb-4" color="surface">
          <h2 class="text-lg">Throttles</h2>
          <v-item-group 
            v-model="throttles" multiple>
            <v-row>
              <v-col  v-for="item in locoChips" :key="item.locoId" cols="12" md="4" :value="item">
                <v-item 
                  size="large"
                  color="blue"
                  variant="outlined"
                  selected
                  :value="item"
                  v-slot="{ isSelected, toggle }"
                >
                  <v-sheet class="flex items-center justify-start gap-2" color="surface">
                    <v-avatar :color="item?.meta?.color" :variant="isSelected ? 'flat' : 'outlined'" @click="toggle">{{ item.locoId }}</v-avatar>
                    <v-text-field
                      v-model="item.speed"
                      type="number"
                      min="0"
                      max="128"
                      class="w-[7rem] flex-grow-0"
                      label="Speed"
                      hide-details
                      single-line
                      variant="outlined"
                      append-inner-icon="mdi-speedometer"
                      inset
                    ></v-text-field>
                    <v-btn
                      :append-icon="item.direction === 'forward' ? 'mdi-arrow-right' : 'mdi-arrow-left'"
                      variant="outlined"
                      color="blue"
                      @click="item.direction = item.direction === 'forward' ? 'reverse' : 'forward'"
                    >{{item.direction === 'forward' ? 'fwd' : 'rev'}}</v-btn>
                  </v-sheet>  
                  <pre>{{item.direction}}</pre>
                  <pre>{{Boolean(item?.isSelected).toString()}}</pre>
                </v-item>
              </v-col>
            </v-row>
          </v-item-group>
          <pre>{{throttles}}</pre>
          <!-- <v-item-group 
            v-model="locoChips" multiple>
            <v-row>
              <v-col  v-for="item in locoChips" :key="item" :value="item" cols="12"
                md="4">
                <v-item 
                  size="large"
                  color="blue"
                  variant="outlined"
                  selected
                  v-slot="{ isSelected, toggle }"
                >
                  
                </v-item>
              </v-col>
            </v-row>
          </v-item-group> -->
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