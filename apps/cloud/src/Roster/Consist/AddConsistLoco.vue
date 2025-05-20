<script setup lang="ts">
import { ref } from 'vue'
defineEmits(['add'])
const props = defineProps({
  alocos: Array,
  loco: Object,
  color: Object,
  open: Boolean
})
const show = ref(props.open)
</script>
<template>
  <v-list-item title="Add Loco to Consist">
    <template #prepend>
        <v-btn
          color="pink"
          icon="mdi-plus-circle"
          variant="tonal"
          class="mr-8"
          @click="show = !show"
        ></v-btn>
    </template>
  </v-list-item>
  <v-divider></v-divider>
  <v-list v-if="show || open" class="bg-red-960">
    <template  v-for="aloco in alocos" :key="aloco.locoId">
      <v-list-item :subtitle="aloco.name">
        <template #prepend>
          <v-icon icon="mdi-train" class="w-8 h-8"></v-icon>
        </template>
        <template #title>            
          <v-btn
            class="ma-2"
            icon="mdi-arrow-left-circle"
            variant="tonal"
            @click="$emit('add', aloco?.locoId, true)"
            :disabled="!!(aloco?.locoId === loco?.locoId || loco?.consist?.find((l) => l.address === aloco?.locoId))"
          ></v-btn>
          <v-avatar :color="color.value">{{ aloco?.locoId }}</v-avatar>
          <v-btn
            class="ma-2"
            icon="mdi-arrow-right-circle"
            variant="tonal"
            @click="$emit('add', aloco?.locoId, false)"
            :disabled="!!(aloco?.locoId === loco?.locoId || loco?.consist?.find((l) => l.address === aloco?.locoId))"
          ></v-btn>
        </template>
      </v-list-item>
    </template>
  </v-list>
</template>