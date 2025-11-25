<script setup lang="ts">
import { type PropType } from 'vue'
import type { DocumentData } from 'firebase/firestore'

interface Props {
  list?: DocumentData[]
  sortBy?: string
}

interface Emits {
  (e: 'update:state', item: DocumentData, newState: boolean): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleChange = (item: DocumentData, newState: boolean) => {
  emit('update:state', item, newState)
}
</script>

<template>
  <v-table :items="list" :sort-by="sortBy" class="w-full p-4">
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
      <tr v-for="item in list" :key="item.id">
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
            @change="handleChange(item, item.state)"
            :color="item.color || 'primary'" 
            hide-details 
          />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>