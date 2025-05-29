<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'

// Pages
import Login from '@/User/Login/Login.vue'
import Dashboard from './Dashboard/Dashboard.vue'
import DCCEX from './DCCEX/DCCEX.vue'
import Layout from './Layout/Layout.vue'
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

import { useDccLog } from '@/DCCEX/Log/useDccLog'

const layoutId = useStorage('@DEJA/layoutId', 'betatrack')
const enableLogging = useStorage('@DEJA/pref/ws-logging', false)

const user = useCurrentUser()
const dccLog = useDccLog(enableLogging.value)

const view = useStorage('@DEJA/cloud/view', 'Effects')

const theme = ref('dark')
const drawer = ref(true)
const mobile = ref(null)

function handleMenu(item:string) {
  view.value = item
}

</script>
<template>
  <v-responsive class="border rounded">
    <v-app v-if="user" :theme="theme">
      <!-- <DCCLogger v-if="enableLogging" /> -->
      <Header :layoutId="layoutId" @toggle="drawer = !drawer">
        <template #menu>
          <DCCLogStatus />          
          <LayoutStatus />          
          <DeviceStatus v-if="!!user" />
          <AppMenu @menu="handleMenu" />
          <UserProfileMenu />
        </template>
      </Header>

      <v-navigation-drawer v-model="drawer" :mobile="mobile" mobile-breakpoint="md">
        <v-spacer class="h-8"></v-spacer>
        <Menu @change="handleMenu" :view="view" />
      </v-navigation-drawer>

      <v-main>
        <v-container>
          <template v-if="layoutId">        
            <Dashboard v-if="view == 'Dashboard'" />
            <DCCEX v-if="view == 'DCC-EX'" />
            <Layout v-if="view == 'Layout'" />
            <Roster v-if="view == 'Roster'" />
            <Effects v-if="view == 'Effects'" />
            <Turnouts v-if="view == 'Turnouts'" />
            <SignalsList v-if="view == 'Signals'" :layoutId="layoutId" />
            <Routes v-if="view == 'Routes'" />
            <Settings v-if="view == 'Settings'" />
            <UserProfile v-if="view == 'Profile'" />
            <Settings v-if="view == 'Emulator'" />
          </template>
          <template v-else>
            Select a layout
          </template>
        </v-container>
      </v-main>
    </v-app>
    <v-app v-else :theme="theme">
      <Login />
    </v-app>
  </v-responsive>
</template>
