<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'

import DCCLogger from '@/DCCEX/Log/DCCLogger.vue'

// Pages
import Login from '@/User/Login/Login.vue'
import Dashboard from './Dashboard/Dashboard.vue'
import DCCEX from './DCCEX/DCCEX.vue'
import Layout from './Layout/Layout.vue'
import Roster from './Roster/Roster.vue'
import Effects from './Effects/Effects.vue'
import Turnouts from './Turnouts/Turnouts.vue'
import RoutesList from './Routes/RoutesList.vue'
import SignalsList from './Signals/SignalList.vue'
import Settings from './Settings/Settings.vue'
import UserProfile from './User/Profile/UserProfile.vue'

// Components
import Header from './Core/Header/Header.vue'
import AppMenu from './Core/Header/AppMenu.vue';
import UserProfileMenu from './Core/Header/UserProfile.vue';
import Sidebar from './Core/Sidebar/Sidebar.vue'
import Search from './Core/Search/Search.vue'
import Menu from '@/Core/Menu/Menu.vue'
import DeviceStatus from '@/Layout/Devices/DeviceStatus.vue'
import DCCLogStatus from '@/DCCEX/Log/DCCLogStatus.vue'
import LayoutStatus from '@/Layout/LayoutStatus.vue'

const layoutId = useStorage('@DEJA/cloud/layoutId', 'betatrack')
const enableLogging = useStorage('@DEJA/pref/ws-logging', false)

const user = useCurrentUser()

const view = useStorage('@DEJA/cloud/view', 'Effects')

const theme = ref('dark')
const drawer = ref(null)
const mobile = ref(null)

function handleMenu(item:string) {
  console.log('handleMenu', item)
  view.value = item
}

function handleLayoutSelect(_layoutId) {
  layoutId.value = _layoutId
}

</script>
<template>
  <v-responsive class="border rounded">
    <v-app v-if="user" :theme="theme">
      <DCCLogger v-if="enableLogging" />
      <Header :layoutId="layoutId" @toggle="drawer = !drawer">
        <template #search>
          <Search class="hidden md:block mx-2" />
          <!-- <SelectLayout v-if="!!user" class="hidden md:flex" :layoutId="layoutId" @selected="handleLayoutSelect" /> -->
        </template>
        <template #menu>
          <DCCLogStatus />          
          <LayoutStatus />          
          <DeviceStatus v-if="!!user" />
          <AppMenu @menu="handleMenu" />
          <UserProfileMenu />
        </template>
      </Header>

      <v-navigation-drawer v-model="drawer" :mobile="mobile" mobile-breakpoint="md">       
        <Search class="md:hidden p-2" />
        <!-- <SelectLayout class="md:hidden p-2" v-if="!!user" class="my-1" :layoutId="layoutId" @selected="handleLayoutSelect" /> -->
        <v-spacer class="sm:hidden"></v-spacer>
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
            <RoutesList v-if="view == 'Routes'" :layoutId="layoutId" />
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
