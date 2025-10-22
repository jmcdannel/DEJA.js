<script setup lang="ts">
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useTurnouts, type Turnout } from '@repo/modules'
import { ListMenu } from '@repo/ui'
import TurnoutItem from './TurnoutItem.vue'
import CTCSwitch from './CTCSwitch.vue'
import TurnoutTable from './TurnoutTable.vue'

const viewAs = useStorage<string[]>('@DEJA/prefs/turnouts/View', ['switch'])
const sortBy = useStorage<string[]>('@DEJA/prefs/turnouts/Sort', ['default'])

const {  getTurnouts, setTurnout } = useTurnouts()
const turnouts = getTurnouts()

async function handleTurnout(turnout: Turnout) {
  await setTurnout(turnout.id, turnout)
}

const cols = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 4,
    xl: 3,
    xxl: 2,
  }


</script>

<template>
  <v-toolbar color="blue-darken-4" :elevation="8">
    <template #prepend>
      <v-icon icon="mdi-call-split" class="text-xl md:text-3xl"></v-icon>
    </template>
    <template #append>
      <ListMenu :module-name="'turnouts'" />
    </template>
    <v-toolbar-title class="text-xl md:text-3xl">Turnouts</v-toolbar-title>
  </v-toolbar>
  <v-spacer class="my-4"></v-spacer>
  <TurnoutTable 
    v-if="viewAs?.[0] === 'table'"
    :turnouts="turnouts as Turnout[]" 
    :sort-by="sortBy?.[0]" 
    @turnout-change="handleTurnout" 
  />
  <div v-else-if="viewAs?.[0] === 'ctc'" :class="`w-full p-4`">
    <v-row>
      <v-col 
        class="flex justify-center items-start align-top justify-items-start"
        v-for="item in turnouts as Turnout[]"
        :key="item.id">        
        <CTCSwitch 
          :turnout="item as Turnout" 
          :turnout-id="item?.id" 
          :state="item.state"
          class="w-36"
        />
      </v-col>
    </v-row>
  </div>
  <div v-else :class="`w-full p-4`">
    <v-row>
      <v-col :cols="cols.xs" :sm="cols.sm" :md="cols.md" :lg="cols.lg" :xl="cols.xl" :xxl="cols.xxl"
        v-for="item in turnouts as Turnout[]"
        :key="item.id">
        <TurnoutItem          
          :turnout="item as Turnout" 
          :turnoutId="item?.id"
          :viewAs="viewAs?.[0]"
        />
      </v-col>
    </v-row>
  </div>
</template>