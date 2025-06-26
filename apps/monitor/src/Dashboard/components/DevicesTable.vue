<script setup lang="ts">
defineProps<{
  devices: any[]
}>()
</script>

<template>
  <v-card color="purple-lighten-1" variant="tonal">
    <v-card-title>Devices</v-card-title>
    <v-card-text>
      <v-table>
        <thead>
          <tr>
            <th>Device</th>
            <th>Type</th>
            <th>Status</th>
            <th>Config</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="device in devices" :key="device.id">
            <td>{{ device.id }}</td>
            <td>{{ device.type }}</td>
            <td>
              <v-chip 
                :text="device.isConnected ? 'Connected' : 'Disconnected'"
                :color="device.isConnected ? 'green' : 'red'"
              >
                {{ device.isConnected ? 'Connected' : 'Disconnected' }}
              </v-chip>
            </td>
            <td>{{ device?.port || device?.topic }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>