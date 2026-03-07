<script setup lang="ts">
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { useEfx, type Effect } from '@repo/modules'
import { createLogger } from '@repo/utils'
import EffectListItem from '@/Effects/EffectListItem.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

const log = createLogger('EffectsList')

const emit = defineEmits(['edit'])

log.debug('EffectsList.vue loaded')
const { getEffects } = useEfx()
const list = getEffects()

function handleEdit(item: Effect) {
  log.debug('handleEdit', item)
  emit('edit', item)
}

</script>
<template>
  <v-container v-if="list?.length">
    <v-row v-auto-animate>
      <v-col
        cols="12"
        xs="12"
        sm="6"
        lg="4"
      >
      <slot name="prepend"></slot>
    </v-col>
      <v-col
        v-for="item in list"
        :key="item.id"
        cols="12"
        xs="12"
        sm="6"
        lg="4"
      >
        <EffectListItem :efx="item" :efxId="item.id" @edit="handleEdit"></EffectListItem>
    </v-col>
    </v-row>
  </v-container>
  <EmptyState
    v-if="!list?.length"
    icon="mdi-rocket-launch"
    color="indigo"
    title="No Effects Yet"
    description="Create lighting, sound, and animation effects to bring your layout to life with immersive scenery and interactive elements."
    :use-cases="[{ icon: 'mdi-volume-high', text: 'Ambient sounds & audio' }, { icon: 'mdi-led-on', text: 'LED animations & lighting' }, { icon: 'mdi-play-circle', text: 'Triggered sequences' }]"
    action-label="Create Your First Effect"
    action-to="/effects/new"
  />
</template>