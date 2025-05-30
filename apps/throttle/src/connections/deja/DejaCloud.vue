<script setup lang="ts">
  import {  useCurrentUser } from 'vuefire'
  import tttButton from '@/shared/ui/tttButton.component.vue'
  // import DejaLogin from '@/deja-cloud/DejaLogin.vue'
  import DejaSignout from '@/auth/Signout.vue'
  import DejaUser from '@/deja-cloud/DejaUser.vue'
  
  const user = useCurrentUser()

</script>

<template>
  <main class="p-4 flex flex-col justify-between w-full overflow-auto forest-background">
    <main class="my-1 pt-2 flex-grow flex flex-col">  
      <DejaUser />
      <!-- <DejaLogin v-on:auth="$router.push({ name: 'connect' })" :is-authenticated="!!user" /> -->
      <div class="flex-grow flex justify-between items-end">
        <tttButton variant="warning" size="lg" @click="$router.push({ name: 'connect' })">Cancel</tttButton>
        <DejaSignout v-if="!!user" />
      </div>
    </main>
  </main>
</template>