<script setup lang="ts">
defineProps<{
  throttles: any[]
}>()
</script>

<template>
  <v-card color="purple-lighten-1" >
    <v-card-title>Throttles</v-card-title>
    <v-card-text>
      <v-table>
        <thead>
          <tr>
            <th>Loco Address</th>
            <th>Speed</th>
            <th>Direction</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="throttle in throttles" :key="throttle.address">
            <td>
              <v-avatar color="primary" size="64">{{ throttle.address }}</v-avatar>
            </td>
            <td>
              <v-avatar color="secondary" tile size="64">{{ throttle.speed }}</v-avatar>
            </td>
            <td>{{ throttle.direction ? 'Forward' : 'Reverse' }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
    <v-card-actions class="flex justify-end">
      <v-btn class="btn btn-md btn-outline" color="primary" @click="$emit('clear-throttles')">
        Clear Throttles
      </v-btn>
    </v-card-actions>
  </v-card>
</template>