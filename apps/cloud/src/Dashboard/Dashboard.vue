<script setup lang="ts">
import { useCurrentUser } from 'vuefire';
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import DejaConnect from '@/DejaDirectConnect/DejaConnect.vue'
import DejaLogin from '@/DejaDirectConnect/DejaLogin.vue'
import SignOut from '@/User/SignOut/SignOut.vue';

const user = useCurrentUser()

</script>
<template>
  <ModuleTitle menu="Dashboard" />
  <template v-if="user">
    <DejaConnect />
    <SignOut />
  </template>
  <template v-else>
    <v-container>
      <DejaLogin />
    </v-container>
  </template> 
</template>