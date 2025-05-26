<script setup lang="ts">
import { useDcc } from '@repo/dccex/useDcc'

const { sendDccCommand } = useDcc()

defineProps({
  ports: Array
})

function handleRefresh() {
  sendDccCommand({ action: 'listPorts', payload: {} })
}
</script>
<template>

  <v-card 
    class="mx-auto w-full h-full justify-between flex flex-col border-t-4 border-b-4"
    :prepend-icon="'mdi-usb'"
    title="Ports"
    :color="'purple'"
    variant="tonal"
    density="compact">
    <v-card-text>
      <v-list lines="one">
        <v-list-item
          v-for="port in ports"
          :key="port"
          :title="port"
        ></v-list-item>
      </v-list>
    </v-card-text>
    <v-card-actions>
      <v-btn @click="handleRefresh" variant="elevated" color="green">Refresh</v-btn>
    </v-card-actions>
  </v-card>
</template>