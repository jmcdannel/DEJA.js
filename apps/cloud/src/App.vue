<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'

// Pages
import Login from '@/User/Login/Login.vue'
import Dashboard from './Dashboard/Dashboard.vue'
import DCCEX from './DCCEX/DCCEX.vue'
import Layout from './Layout/Layout.vue'
import SelectLayout from './Layout/SelectLayout.vue'
import Roster from './Roster/Roster.vue'
import Effects from './Effects/Effects.vue'
import Turnouts from './Turnouts/Turnouts.vue'
import Routes from './Routes/Routes.vue'
import SignalsList from './Signals/SignalList.vue'
import Settings from './Settings/Settings.vue'
import UserProfile from './User/Profile/UserProfile.vue'

// Components
import Header from './Core/Header/Header.vue'
import AppMenu from './Core/Header/AppMenu.vue';
import UserProfileMenu from './Core/Header/UserProfile.vue';
import Menu from '@/Core/Menu/Menu.vue'
import DeviceStatus from '@/Layout/Devices/DeviceStatus.vue'
import DCCLogStatus from '@/DCCEX/Log/DCCLogStatus.vue'
import LayoutStatus from '@/Layout/LayoutStatus.vue'

// import { useDccLog } from '@/DCCEX/Log/useDccLog'

const layoutId = useStorage('@DEJA/layoutId', '')
const enableLogging = useStorage('@DEJA/pref/ws-logging', false)

const user = useCurrentUser()
// const dccLog = useDccLog(enableLogging.value)

const savedView = useStorage('@DEJA/cloud/view', 'Layout')

const view = ref(savedView.value)
const theme = ref('dark')
const drawer = ref(true)
const mobile = ref(null)

function handleMenu(item:string) {
  view.value = item
}

function handleLayoutSelect(newLayout: string) {
  layoutId.value = newLayout
  savedView.value = 'Layout'
  view.value = 'Layout'
}

</script>
<template>
  <v-responsive class="border rounded">
    <v-app v-if="user" :theme="theme">
      <!-- <DCCLogger v-if="enableLogging" /> -->
      <Header @toggle="drawer = !drawer">
        <template #menu>
          <DCCLogStatus />
          <LayoutStatus />
          <!-- <DeviceStatus v-if="!!user" /> -->
          <AppMenu @menu="handleMenu" />
          <UserProfileMenu />
        </template>
      </Header>

      <v-navigation-drawer v-model="drawer" :mobile="mobile" mobile-breakpoint="md">
        <v-spacer class="h-8"></v-spacer>
        <Menu @change="handleMenu" :view="view" />
      </v-navigation-drawer>

      <v-main>
        <v-container v-if="layoutId">
          <Dashboard v-if="view == 'Dashboard'" />
          <DCCEX v-if="view == 'DCC-EX'" />
          <Layout v-if="view == 'Layout'" />
          <Roster v-if="view == 'Roster'" />
          <Effects v-if="view == 'Effects'" />
          <Turnouts v-if="view == 'Turnouts'" />
          <SignalsList v-if="view == 'Signals'" />
          <Routes v-if="view == 'Routes'" />
          <Settings v-if="view == 'Settings'" />
          <UserProfile v-if="view == 'Profile'" />
          <Settings v-if="view == 'Emulator'" />
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
      <!-- <Login /> -->
    </v-app>
  </v-responsive>
</template>
