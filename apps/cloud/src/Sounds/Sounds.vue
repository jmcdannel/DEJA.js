<script setup lang="ts">
import { useRouter } from 'vue-router'
import PageHeader from '@/Core/UI/PageHeader.vue'
import SoundList from '@/Sounds/SoundList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()

function handleAdd() {
  router.push({ name: 'Add Sound' })
}
</script>
<template>
  <PageHeader menu="Sounds" />

  <SoundList>
    <template #prepend>
      <AddTile @click="handleAdd" color="sky" />
    </template>
  </SoundList>
</template>
