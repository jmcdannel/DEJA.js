<script setup lang="ts">
import { useCurrentUser } from 'vuefire'
const user = useCurrentUser()
</script>

<template>
  <v-card flat class="bg-transparent">
    <v-card-title class="text-h5">
      Welcome to DEJA Cloud{{ user?.displayName ? `, ${user.displayName}` : '' }}!
    </v-card-title>
    <v-card-text>
      <p class="text-body-1 mb-4">
        Let's get your model railroad control system set up. This will only take a couple of minutes.
      </p>
      <p class="text-body-2 text-medium-emphasis">
        We'll walk you through creating a layout, configuring your environment, and getting ready to control your trains.
      </p>
    </v-card-text>
  </v-card>
</template>
