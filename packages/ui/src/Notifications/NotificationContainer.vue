<script setup lang="ts">
import { useNotification } from './useNotification'

const { notifications, dismiss } = useNotification()
</script>

<template>
  <div class="notification-container">
    <v-snackbar
      v-for="(notification, index) in notifications"
      :key="notification.id"
      :model-value="true"
      :timeout="-1"
      :color="notification.type"
      location="bottom end"
      :style="{ transform: `translateY(-${index * 60}px)` }"
    >
      {{ notification.message }}
      <template #actions>
        <v-btn
          variant="text"
          icon="mdi-close"
          size="small"
          @click="dismiss(notification.id)"
        />
      </template>
    </v-snackbar>
  </div>
</template>
