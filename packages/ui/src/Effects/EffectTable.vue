<script setup lang="ts">
import { useEfx, type Effect } from '@repo/modules/effects'

const { getEffects, runEffect } = useEfx()

interface Props {
  items?: Effect[]
  sortBy?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  sortBy: () => ['device']
})

const effectItems = props.items || getEffects()

function handleEffect(efx: Effect) {
  runEffect(efx)
}
</script>

<template>
  <v-table :items="effectItems" :sort-by="sortBy" class="w-full p-4">
    <thead>
      <tr>
        <th>Name</th>
        <th>Device</th>
        <th>Type</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in effectItems" :key="item.id">
        <td>{{ item.name }}</td>
        <td>{{ item.device }}</td>
        <td>{{ item.type }}</td>
        <td>
          <v-switch 
            v-model="item.state" 
            @change="handleEffect(item as Effect)" 
            :color="item.color || 'primary'" 
            hide-details 
          />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>