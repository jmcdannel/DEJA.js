<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useEfx, type Effect } from '@repo/modules/effects'
import { ListMenu } from '@repo/ui'
import EffectItem from './EffectItem.vue'
import EffectTable from './EffectTable.vue'

const viewAs = useStorage<string[]>('@DEJA/prefs/effects/View', ['button'])
const sortBy = useStorage<string[]>('@DEJA/prefs/effects/Sort', ['device'])

const { getEffects, runEffect } = useEfx()
const effects = getEffects()

async function handleEffect(effect: Effect) {
  await runEffect(effect)
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
  <v-toolbar color="amber-darken-4" :elevation="8">
    <template #prepend>
      <v-icon icon="mdi-lightning-bolt" class="text-xl md:text-3xl"></v-icon>
    </template>
    <template #append>
      <ListMenu :module-name="'effects'" />
    </template>
    <v-toolbar-title class="text-xl md:text-3xl">Effects</v-toolbar-title>
  </v-toolbar>
  <v-spacer class="my-4"></v-spacer>
  <EffectTable 
    v-if="viewAs?.[0] === 'table'"
    :effects="effects as Effect[]" 
    :sort-by="sortBy?.[0]" 
    @effect-change="handleEffect" 
  />
  <div v-else class="w-full p-4">
    <v-row>
      <v-col :cols="cols.xs" :sm="cols.sm" :md="cols.md" :lg="cols.lg" :xl="cols.xl" :xxl="cols.xxl"
        v-for="item in effects as Effect[]"
        :key="item.id">
          <EffectItem 
            :effect="item as Effect" 
            :viewAs="viewAs?.[0]"
          />
        </v-col>
      </v-row>
    />
    </div>
</template>