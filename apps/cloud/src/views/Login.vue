<script setup lang="ts">
import { Login } from '@repo/auth'
import { useRouter } from 'vue-router'
const router = useRouter()

function handleAuth() {
    router.push({ name: 'home' })
}
</script>
<template>
    <Login @auth="handleAuth" />
</template> 