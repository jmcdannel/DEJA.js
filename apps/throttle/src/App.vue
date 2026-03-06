<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { AppHeader } from '@repo/ui'
import Footer from '@/core/Footer.vue'
import useMenu from '@/core/Menu/useMenu'
import Menu from '@repo/ui/src/Menu/Menu.vue'

const drawer = ref(false)
const { handleMenu, menuConfig } = useMenu()

</script>

<template>
  <v-responsive>
    <v-app theme="dark">
      <AppHeader 
        app-name="Throttle"
        app-icon="mdi-gamepad-variant"
        variant="throttle"
        color="blue"
        :drawer="drawer"
        :dark="true"
        :show-layout-power="true"
        :show-emergency-stop="true"
        :show-device-status="true"
        :show-device-status-label="true"
        :show-user-profile="true"
        @drawer-toggle="drawer = !drawer"
      />
      <Menu v-model:drawer="drawer" :menu="menuConfig" @handle-menu="handleMenu" />
      <v-main>
        <v-container class="p-0 min-h-full flex flex-col" fluid>
          <RouterView />
        </v-container>
      </v-main>
      <Footer />
    </v-app>
  </v-responsive>
</template>