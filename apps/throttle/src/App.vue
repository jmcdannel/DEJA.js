<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'
import { AppHeader } from '@repo/ui'
import Footer from '@/core/Footer.vue'
import Menu from '@/core/Menu.vue'

const drawer = ref(false)
const layoutId = useStorage('@DEJA/layoutId', 'betatrack')
const user = useCurrentUser()

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
      <Menu v-model:drawer="drawer" />
      <v-main>
        <v-container class="p-0 min-h-full flex flex-col" fluid>
          <RouterView />
        </v-container>
      </v-main>
      <Footer v-if="Boolean(user) && Boolean(layoutId)" />
    </v-app>
  </v-responsive>
</template>