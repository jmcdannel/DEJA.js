<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { RouterView, useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { useTheme } from 'vuetify'

// Components
import SelectLayout from './Layout/SelectLayout.vue'
import UserProfileMenu from './Core/Header/UserProfile.vue';
import DeviceStatus from '@/Layout/Devices/DeviceStatus.vue'
import LayoutStatus from '@/Layout/LayoutStatus.vue'
import { Login } from '@repo/auth'

import { useMenu } from '@/Core/Menu/useMenu'
const layoutId = useStorage('@DEJA/layoutId', 'betatrack')

const user = useCurrentUser()
const router = useRouter()
const theme = useTheme()
const { menu, handleMenu } = useMenu()

const drawer = ref(true)
const mobile = ref(null)

function handleLayoutSelect(newLayout: string) {
  layoutId.value = newLayout
  router.push({ name: 'Layout' })
}

</script>
<template>
  <v-responsive class="border rounded">
    <v-app v-if="user" :theme="theme.name.value">
      <v-app-bar color="primary">
        <template v-slot:prepend>
          <v-app-bar-nav-icon @click="drawer = !drawer"
            aria-controls="drawer-navigation"
            class="lg:hidden p-2 mr-2" 
          ></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title>
          <v-icon class="mr-2">mdi-cloud</v-icon>
          DEJA Cloud
        </v-app-bar-title>
          <v-btn
            @click="theme.change('light')"
            text="Light"
          ></v-btn>
          <v-btn
            @click="theme.change('dark')"
            text="Dark"
          ></v-btn>
          <LayoutStatus />
          <DeviceStatus v-if="!!user" />
          <UserProfileMenu v-if="!!user" />

      </v-app-bar>
      <v-navigation-drawer v-model="drawer" :mobile="mobile" mobile-breakpoint="md">
        <v-spacer class="h-8"></v-spacer>
        <v-list-item v-for="item in menu" 
          :key="item.label" 
          :title="item.label"
          :color="item.color || 'primary'"
          :active="router.currentRoute.value.name === item.label"
          @click="handleMenu(item)"
          link
        >
          <template #prepend>
            <v-icon size="24" :class="`text-${item.color}-500 dark:text-${item.color}-400`"
              class="stroke-none" >{{item.icon}}</v-icon>
          </template>
        </v-list-item>
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
    <v-app v-else :theme="theme.name.value">
      <Login />
    </v-app>
  </v-responsive>
</template>
