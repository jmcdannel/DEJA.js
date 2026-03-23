<script setup lang="ts">
import type { SensorAutomation } from '@repo/modules/sensors'
import { useRouter } from 'vue-router'
import { PageHeader } from '@repo/ui'
import AutomationList from '@/Sensors/AutomationList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()

function handleEdit(automation: SensorAutomation) {
  router.push({ name: 'Edit Automation', params: { automationId: automation.id } })
}

function handleAdd() {
  router.push({ name: 'Add Automation' })
}

</script>
<template>
  <PageHeader title="Sensors" icon="mdi-access-point" color="teal" />
  <AutomationList @edit="handleEdit">
    <template #prepend>
      <AddTile @click="handleAdd" color="teal" />
    </template>
  </AutomationList>
</template>
