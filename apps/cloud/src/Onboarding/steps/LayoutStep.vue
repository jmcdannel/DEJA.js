<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'

const user = useCurrentUser()
const layoutId = useStorage('@DEJA/layoutId', '')
</script>

<template>
  <v-card flat class="bg-transparent">
    <v-card-title class="text-h6">Your Layout</v-card-title>
    <v-card-text>
      <v-alert v-if="layoutId" type="success" variant="tonal" class="mb-4">
        <p class="text-body-1 font-weight-bold mb-1">Layout ID: {{ layoutId }}</p>
        <p class="text-body-2">
          Your layout was created when you signed up. You can manage devices, locos, effects, and more from the dashboard.
        </p>
      </v-alert>

      <v-alert v-else type="warning" variant="tonal" class="mb-4">
        <p class="text-body-2">
          No layout found. Please contact support or sign up again to create a layout.
        </p>
      </v-alert>

      <v-list class="bg-transparent" v-if="layoutId">
        <v-list-item prepend-icon="mdi-account">
          <v-list-item-title>Owner</v-list-item-title>
          <v-list-item-subtitle>{{ user?.displayName || user?.email }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item prepend-icon="mdi-train">
          <v-list-item-title>Layout ID</v-list-item-title>
          <v-list-item-subtitle>{{ layoutId }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
