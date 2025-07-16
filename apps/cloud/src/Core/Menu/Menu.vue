<script setup lang="ts">
import { useMenu } from '@/Core/Menu/useMenu'
import {  useRouter } from 'vue-router'

defineEmits(['change'])
const { menu, handleMenu } = useMenu()
const router = useRouter()

</script>
<template>
</template>