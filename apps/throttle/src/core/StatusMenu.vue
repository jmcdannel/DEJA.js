<script setup lang="ts">
// import { computed } from 'vue'
// import { useCurrentUser } from 'vuefire'
// import { useStorage } from '@vueuse/core'
// import { useLayout, type Device } from '@repo/modules'

// const layoutId = useStorage('@DEJA/layoutId', '')
// const user = useCurrentUser()
// const { getDevices } = useLayout()
// const devices = getDevices()
// const dccExDevice = computed(() =>
//   devices.value.find((device) => device.type === 'dcc-ex')
// )

</script>

<template>
  <main class="flex items-center justify-center">
    <!-- <v-btn variant="tonal" color="light-blue" @click="$router.push({ name: 'connect' })">
      <ul class="flex items-center justify-center">
        <li class="mx-1">
          <v-icon v-if="layoutId" class="stroke-none" color="success">mdi-lightning-bolt</v-icon>
          <v-icon v-else class="stroke-none" color="error">mdi-lightning-bolt</v-icon>
        </li>
        <li class="mx-1">
           <v-icon v-if="dccExDevice?.isConnected" class="stroke-none" color="success">mdi-cpu-64-bit</v-icon>
          <v-icon v-else class="stroke-none" color="error">mdi-cpu-64-bit</v-icon>
        </li>
        <li class="mx-1">
          <v-avatar :size="16" v-if="user" class="w-4 h-4 text-success">
            <v-img v-if="user?.photoURL" :src="user?.photoURL" />
          </v-avatar>
          <v-icon v-else class="stroke-none" size="8" color="grey-500">mdi-cloud</v-icon>
        </li>
      </ul>
    </v-btn> -->
  </main>
</template>
