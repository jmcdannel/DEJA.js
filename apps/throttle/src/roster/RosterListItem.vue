<script setup lang="ts">
import type { PropType } from 'vue'
import type { Loco } from '@repo/modules/locos'
import { LocoAvatar } from '@repo/ui'
import RoadnameLogo from '@/throttle/RoadnameLogo.vue'

defineEmits(['selected'])
defineProps({
  loco: {
    type: Object as PropType<Loco>,
    required: true
  }
})
</script>
<template>
  <v-card v-if="loco"
    class="m-1 shadow-xl"
    :color="loco?.meta?.color || 'primary'"
    variant="tonal"
    :subtitle="loco?.meta?.roadname"
    :title="loco.name"
  >
    <template v-slot:prepend>
      <LocoAvatar v-if="loco" :loco="loco as Loco" :size="48" @park="clearLoco" @stop="handleStop" :variant="'flat'" /> 
    </template>
    <v-card-text>
      <RoadnameLogo :roadname="loco?.meta.roadname" size="lg" />
    </v-card-text>
    <v-card-actions class="flex justify-end">
      <v-btn 
        class="btn btn-md btn-outline"
        @click="$emit('selected', loco.address)"
        :color="loco?.meta?.color || 'primary'"
        role="link"
      >
        Select
      </v-btn>
    </v-card-actions>
  </v-card>
</template>