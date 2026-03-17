<script setup lang="ts">
import { useRouter } from 'vue-router'
import PageHeader from '@/Core/UI/PageHeader.vue'
import SoundForm from '@/Sounds/SoundForm.vue'

const router = useRouter()

function handleClose() {
  router.push({ name: 'Sounds' })
}
</script>
<template>
  <PageHeader menu="Sounds" />
  <SoundForm @close="handleClose" />
</template>
