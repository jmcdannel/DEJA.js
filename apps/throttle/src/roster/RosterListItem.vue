<script setup lang="ts">
import type { PropType } from 'vue'
import type { Loco } from '@repo/modules/locos'

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
  >
  <v-card-title>{{ loco?.name || loco?.address }}</v-card-title>
  <v-card-subtitle>{{ loco?.address }}</v-card-subtitle>
  <template #prepend>
    <v-avatar color="primary" :size="48" class="mr-2">{{ loco.address }}</v-avatar>
  </template>
  <v-card-text class="text-sm">
    <div class="flex flex-wrap gap-2">
      <span v-for="(value, key) in loco.meta" :key="key" class="badge badge-secondary">
        {{ key }}: {{ value }}
      </span>
    </div>
    <!-- <div class="mt-2">
      <span v-if="loco?.consist.length > 0" class="text-sm text-gray-500">
        Consist:
      </span>
      <v-avatar v-if="loco?.consist.length > 0" v-for="cloco in loco.consist" :key="cloco.address" :size="24" color="secondary" class="opacity-70 ml-1">
        {{ cloco.address }}
      </v-avatar>
    </div> -->
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
  <!-- <button 
    class="
      btn 
      btn-md 
      btn-outline 
      flex
      justify-between
      bg-opacity-30 
      border-primary 
      text-primary 
      w-full 
      my-1
      hover:bg-opacity-60 
    "
    @click="$emit('selected', loco.address)" 
    :color="loco?.meta?.color || 'primary'"
    role="link">        
    <span><v-avatar color="primary" :size="24" class="mr-2">{{  loco.address }}</v-avatar>
      {{ loco?.name || loco?.address }}
    </span>
    <span><v-avatar v-for="cloco in loco.consist" :key="cloco.address" :size="18" color="secondary" class="opacity-70">{{  cloco.address }}</v-avatar></span>
  </button> -->
</template>