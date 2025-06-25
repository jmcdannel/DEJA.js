<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { RouterView, useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'

// Components
import SelectLayout from './Layout/SelectLayout.vue'
import Header from './Core/Header/Header.vue'
import UserProfileMenu from './Core/Header/UserProfile.vue';
import Menu from '@/Core/Menu/Menu.vue'
import DeviceStatus from '@/Layout/Devices/DeviceStatus.vue'
import DCCLogStatus from '@/DCCEX/Log/DCCLogStatus.vue'
import LayoutStatus from '@/Layout/LayoutStatus.vue'
import Login from '@/auth/Login.vue'

// import { useDccLog } from '@/DCCEX/Log/useDccLog'

const layoutId = useStorage('@DEJA/layoutId', '')
const enableLogging = useStorage('@DEJA/pref/ws-logging', false)

const user = useCurrentUser()
const router = useRouter()
// const dccLog = useDccLog(enableLogging.value)

const theme = ref('dark')
const drawer = ref(true)
const mobile = ref(null)

function handleMenu(item:string) {
  router.push({ name: item })
}

function handleLayoutSelect(newLayout: string) {
  layoutId.value = newLayout
  router.push({ name: 'Layout' })
}

</script>
<template>
  <v-responsive class="border rounded">
    <v-app v-if="user" :theme="theme">
      <!-- <DCCLogger v-if="enableLogging" /> -->
      <Header @toggle="drawer = !drawer">
        <template  v-if="layoutId" #menu>
          <DCCLogStatus />
          <LayoutStatus />
          <DeviceStatus v-if="!!user" />
          <!-- <AppMenu @menu="handleMenu" /> -->
          <UserProfileMenu />
        </template>
      </Header>

      <v-navigation-drawer v-model="drawer" :mobile="mobile" mobile-breakpoint="md">
        <v-spacer class="h-8"></v-spacer>
        <Menu @change="handleMenu" />
      </v-navigation-drawer>

      <v-main>
        <v-container v-if="layoutId">
          <RouterView />
        </v-container>
        <v-container v-else>
          <v-alert type="error" class="text-center mb-4">
            No Layout Selected. Please select a layout to continue.
          </v-alert>
          <SelectLayout @selected="handleLayoutSelect" />
        </v-container>
      </v-main>
    </v-app>
    <v-app v-else :theme="theme">
      <Login />
    </v-app>
  </v-responsive>
</template>
