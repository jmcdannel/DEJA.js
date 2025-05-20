<script setup lang="ts">
  import Title from '@/core/Title.component.vue';
  import Power from '@/core/Power.vue';
  import TrackPower from '@/core/TrackPower.vue';
  import EvergencyStop from '@/core/EmergencyStop.vue';
  import StatusMenu from '@/core/StatusMenu/StatusMenu.component.vue';

</script>

<template>
  <v-app-bar color="indigo-darken-4" dark>
    <template #title>
      <Title />
    </template>
    <template #append>
      <StatusMenu /> 
      <TrackPower />
      <Power />
      <EvergencyStop />
    </template>
  </v-app-bar>
</template>
