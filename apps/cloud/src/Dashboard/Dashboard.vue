<script setup lang="ts">
import { useCurrentUser } from 'vuefire';
import { useRouter } from 'vue-router'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import DeviceStatusList from '@repo/ui/src/DeviceStatus/DeviceStatusList.vue'
// import DejaConnect from '@/DejaDirectConnect/DejaConnect.vue'
// import DejaLogin from '@/DejaDirectConnect/DejaLogin.vue'
// import SignOut from '@/User/SignOut/SignOut.vue';

const user = useCurrentUser()
const router = useRouter()

function handleDisconnect() {
  router.push('/')
}

</script>
<template>
  <ModuleTitle menu="Dashboard" />
  <template v-if="user">
    <DeviceStatusList @disconnect="handleDisconnect" />
    <!-- <DejaConnect /> -->
    <!-- <SignOut /> -->
  </template>
  <template v-else>
    <v-container>
      <!-- <DejaLogin /> -->
    </v-container>
  </template> 
</template>