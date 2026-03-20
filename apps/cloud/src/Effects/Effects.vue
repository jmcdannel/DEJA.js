<script setup lang="ts">
import type { Effect } from '@repo/modules'
import { useRouter } from 'vue-router'
import PageHeader from '@/Core/UI/PageHeader.vue'
import EffectsList from '@/Effects/EffectsList.vue'
import AddTile from '@/Core/UI/AddTile.vue'
import { ListMenu } from '@repo/ui'

const router = useRouter()

function handleEdit(effect: Effect) {
  router.push({ name: 'Edit Effect', params: { effectId: effect.id } })
}

function handleAdd() {
  router.push({ name: 'Add Effect' })
}

</script>
<template>
  <PageHeader menu="Effects">
    <ListMenu :disabledMenus="['view']" :module-name="'effects'" />
  </PageHeader>

  <EffectsList @edit="handleEdit">
    <template #prepend>
      <AddTile @click="handleAdd" color="purple" />
    </template>
  </EffectsList>
</template>
