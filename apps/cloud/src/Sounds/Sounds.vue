<script setup lang="ts">
import { useRouter } from 'vue-router'
import { PageHeader } from '@repo/ui'
import SoundList from '@/Sounds/SoundList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()

function handleAdd() {
  router.push({ name: 'Add Sound' })
}
</script>
<template>
  <PageHeader title="Sounds" icon="mdi-volume-high" color="sky" />

  <SoundList>
    <template #prepend>
      <AddTile @click="handleAdd" color="sky" />
    </template>
  </SoundList>
</template>
