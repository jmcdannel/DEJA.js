<script setup lang="ts">
import { BsCloudFill } from 'vue3-icons/bs'
import { useCurrentUser } from 'vuefire'

const user = useCurrentUser()
  
</script>
<template>  
  <v-chip 
    v-if="user" 
    color="success" 
    class="cursor-pointer"
    @click="$router.push({ name: 'deja-cloud'})"
    closable>
    <BsCloudFill class="mr-2" />
    DEJA Cloud
  </v-chip>
</template>