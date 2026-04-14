<script setup lang="ts">
import type { SensorAutomation } from '@repo/modules/sensors'
import { useRouter } from 'vue-router'
import AutomationList from '@/Sensors/AutomationList.vue'
import ListPage from '@/Core/UI/ListPage.vue'

const router = useRouter()

function handleEdit(automation: SensorAutomation) {
  router.push({ name: 'Edit Automation', params: { automationId: automation.id } })
}

</script>
<template>
  <ListPage
    title="Automations"
    icon="mdi-access-point"
    color="teal"
    :add-to="{ name: 'Add Automation' }"
    add-label="New Automation"
  >
    <AutomationList @edit="handleEdit" />
  </ListPage>
</template>
