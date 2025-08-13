<script setup lang="ts">
import type { Effect } from '@repo/modules/effects'

interface Props {
  effects: Effect[]
  sortBy?: string
}

interface Emits {
  (e: 'effect-change', effect: Effect): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleEffect = (effect: Effect) => {
  emit('effect-change', effect)
}
</script>

<template>
  <v-table :items="effects" :sort-by="sortBy" class="w-full p-4">
    <thead>
      <tr>
        <th>Name</th>
        <th>Device</th>
        <th>Type</th>
        <th>Guest Access</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in effects" :key="item.id">
        <td>{{ item.name }}</td>
        <td>{{ item.device }}</td>
        <td>{{ item.type }}</td>
        <td>
          <v-chip 
            :color="item.allowGuest ? 'success' : 'default'"
            size="small"
            variant="outlined"
          >
            {{ item.allowGuest ? 'Yes' : 'No' }}
          </v-chip>
        </td>
        <td>
          <v-switch 
            v-model="item.state" 
            @change="handleEffect(item)" 
            :color="item.color || 'primary'" 
            hide-details 
          />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>