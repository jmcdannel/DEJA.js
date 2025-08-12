<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { RouterView, useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { Login } from '@repo/auth'
import { LayoutChip } from '@repo/ui'

// import { useDccLog } from '@/DCCEX/Log/useDccLog'

const layoutId = useStorage('@DEJA/layoutId', '')
const enableLogging = useStorage('@DEJA/pref/ws-logging', false)

const user = useCurrentUser()
const router = useRouter()
// const dccLog = useDccLog(enableLogging.value)

const theme = ref('dark')
const mobile = ref(null)

function handleMenu(item:string) {
  router.push({ name: item })
}

function handleLayoutSelect(newLayout: string) {
  layoutId.value = newLayout
  
  window.location.reload()
}

</script>
<template>
  <v-responsive class="border rounded">
    <v-app v-if="user" :theme="theme">
      <!-- <DCCLogger v-if="enableLogging" /> -->
      <v-app-bar title="DEJA JS Monitor" class="px-2">
        <LayoutChip />
      </v-app-bar>

      <v-navigation-drawer expand-on-hover
        rail>
        <v-list>
          <v-list-item @click="handleMenu('Dashboard')" prepend-icon="mdi-view-dashboard">
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleMenu('Settings')" prepend-icon="mdi-cog">
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleMenu('Logs')" prepend-icon="mdi-file-document">
            <v-list-item-title>Logs</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleMenu('Device Monitor Demo')" prepend-icon="mdi-monitor-dashboard">
            <v-list-item-title>Device Monitor Demo</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleMenu('About')" prepend-icon="mdi-information">
            <v-list-item-title>About</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-divider />
        <v-list>
          <v-list-item @click="handleLayoutSelect('betatrack')">
            <template #prepend>
              <v-avatar size="32" color="primary">BT</v-avatar>
            </template>
            <v-list-item-title>Betatrack</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleLayoutSelect('tam')">
            <template #prepend>
              <v-avatar size="32" color="primary">TJ</v-avatar>
            </template>
            <v-list-item-title>Tamarack Junction</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleLayoutSelect('shef')">
            <template #prepend>
              <v-avatar size="32" color="primary">HO</v-avatar>
            </template>
            <v-list-item-title>HO Clockwork Shelf</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-divider />
        <v-list>
          <v-list-item @click="handleMenu('Logout')" prepend-icon="mdi-logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main v-if="layoutId">
        <RouterView />
      </v-main>
      <v-main v-else>
        <v-alert type="error" class="text-center mb-4">
          No Layout Selected. Please select a layout to continue.
        </v-alert>
        <!-- <SelectLayout @selected="handleLayoutSelect" /> -->
      </v-main>
    </v-app>
    <v-app v-else :theme="theme">
      <Login />
    </v-app>
  </v-responsive>
</template>
