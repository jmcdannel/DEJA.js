<script setup lang="ts">
import { ref } from 'vue'
import { useLayout } from '@repo/modules/layouts'
const { createLayout } = useLayout()

const showForm = ref(false)
const layoutName = ref('')
const layoutId = ref('')

async function handleAdd() {
  console.log('handleAdd', layoutName, layoutId)
  await createLayout(layoutId.value, { name: layoutName.value, layoutId: layoutId.value })
}
</script>
<template>
  <v-form v-if="showForm">
    <v-card title="New Layout" color="orange" variant="tonal">
      <v-card-text>
        <v-text-field v-model="layoutName" label="Layout Name" variant="outlined" />
        <v-text-field v-model="layoutId" label="Layout ID" variant="outlined" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="showForm = false" color="orange" variant="outlined">Cancel</v-btn>
        <v-spacer />
        <v-btn @click="handleAdd" color="orange" variant="outlined">Add</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
  <v-btn v-else @click="showForm = !showForm" color="orange" variant="outlined" class="m-4">Add Layout</v-btn>
</template>