<script setup lang="ts">
import { useLayout } from '@repo/modules/layouts'

defineEmits(['select', 'cancel'])
defineProps({
  color: String
})
const model = defineModel<string>()
const { getDevices } = useLayout()
const devices = getDevices()

</script>
<template>
  <v-card class="mx-auto w-full h-full justify-between flex flex-col bg-zinc-500  bg-opacity-20"
    variant="tonal"
    density="compact"
    :color="color">
    <v-card-item class="font-weight-black">
      <v-card-title class="font-weight-black">
        Turnout Type
      </v-card-title>
    </v-card-item>
    <v-card-text>
      <v-btn-toggle v-model="model" divided class="flex-wrap h-auto" size="x-large">
        <v-btn v-for="device in devices" :value="device.id" :key="device.id"
          class="min-h-48 min-w-48 border"
          variant="flat"
          :color="color">
          <div class="flex flex-col justify-center items-center">
            <v-icon color="white" size="64">mdi-memory</v-icon>
            <div class="mt-4">{{ device.id }}</div>
          </div> 
        </v-btn>
      </v-btn-toggle>
    </v-card-text>
    <v-card-actions>
      <v-btn
        prepend-icon="mdi-cancel"
        variant="outlined"
        @click="$emit('cancel')">
        Cacnel
      </v-btn>
      <v-btn
        prepend-icon="mdi-check"
        :color="model"
        variant="flat"
        @click="$emit('select')">
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>