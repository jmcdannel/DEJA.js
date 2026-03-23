<script setup lang="ts">
import { useRouter } from 'vue-router'
import { PageHeader } from '@repo/ui'
import SoundForm from '@/Sounds/SoundForm.vue'

const router = useRouter()

function handleClose() {
  router.push({ name: 'Sounds' })
}
</script>
<template>
  <PageHeader title="Sounds" icon="mdi-volume-high" color="sky" />
  <SoundForm @close="handleClose" />
</template>
