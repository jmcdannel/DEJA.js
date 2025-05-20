<script setup lang="ts">
import { useCurrentUser } from 'vuefire'
const user = useCurrentUser()


</script>
<template>
  <template v-if="!!user">
    <h3 class="text-transparent text-xl bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-600">
      <v-avatar :size="48">
        <v-img :src="user?.photoURL" />
      </v-avatar>
      {{ user?.displayName }}
    </h3>
  </template>
</template>