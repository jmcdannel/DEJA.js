<script setup lang="ts">
import type { Sensor } from '@repo/modules/sensors'
import { useRouter } from 'vue-router'
import PageHeader from '@/Core/UI/PageHeader.vue'
import SensorList from '@/Sensors/SensorList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()

function handleEdit(sensor: Sensor) {
  router.push({ name: 'Edit Sensor', params: { sensorId: sensor.id } })
}

function handleAdd() {
  router.push({ name: 'Add Sensor' })
}

</script>
<template>
  <PageHeader menu="Sensors" />
  <SensorList @edit="handleEdit">
    <template #prepend>
      <AddTile @click="handleAdd" color="teal" />
    </template>
  </SensorList>
</template>
