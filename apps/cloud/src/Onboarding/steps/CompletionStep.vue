<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'

const user = useCurrentUser()
const layoutId = useStorage('@DEJA/layoutId', '')
</script>

<template>
  <v-card flat class="bg-transparent">
    <v-card-title class="text-h5">You're all set!</v-card-title>
    <v-card-text>
      <p class="text-body-1 mb-4">
        Your DEJA Cloud account is ready. Here's a summary of your configuration:
      </p>

      <v-list class="bg-transparent">
        <v-list-item prepend-icon="mdi-account">
          <v-list-item-title>Account</v-list-item-title>
          <v-list-item-subtitle>{{ user?.displayName || user?.email }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item prepend-icon="mdi-train">
          <v-list-item-title>Layout ID</v-list-item-title>
          <v-list-item-subtitle>{{ layoutId }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-alert type="success" variant="tonal" class="mt-4">
        Click "Go to Dashboard" to start managing your model railroad layout.
      </v-alert>
    </v-card-text>
  </v-card>
</template>
