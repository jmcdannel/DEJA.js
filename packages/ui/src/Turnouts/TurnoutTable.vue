<script setup lang="ts">
import type { Turnout } from '@repo/modules'

interface Props {
  turnouts: Turnout[]
  sortBy?: string
}

interface Emits {
  (e: 'turnout-change', turnout: Turnout): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleTurnout = (turnout: Turnout) => {
  emit('turnout-change', turnout)
}
</script>

<template>
  <v-table :items="turnouts" :sort-by="sortBy" class="w-full p-4">
    <thead>
      <tr>
        <th>Name</th>
        <th>Device</th>
        <th>Type</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in turnouts" :key="item.id">
        <td>{{ item.name }}</td>
        <td>{{ item.device }}</td>
        <td>{{ item.type }}</td>
        <td>
          <v-switch 
            v-model="item.state" 
            @change="handleTurnout(item)" 
            :color="item.color || 'primary'" 
            hide-details 
          />
        </td>
      </tr>
    </tbody>
  </v-table>
</template> 