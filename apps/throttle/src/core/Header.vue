<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { UserProfile, TrackPower } from '@repo/ui';
import Title from '@/core/Title.component.vue';
import Power from '@/core/Power.vue';
import EvergencyStop from '@/core/EmergencyStop.vue';
import StatusMenu from '@/core/StatusMenu.vue';

const layoutId = useStorage('@DEJA/layoutId', '')
</script>

<template>
  <v-app-bar color="indigo-darken-4" dark>
    <template #title>
      <Title />
    </template>
    <template #append>
      <template v-if="layoutId">
        <StatusMenu /> 
        <TrackPower />
        <Power />
        <EvergencyStop />
      </template>
      <UserProfile />
    </template>
  </v-app-bar>
</template>
