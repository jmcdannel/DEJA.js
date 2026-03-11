<script setup lang="ts">
import { BackgroundSettings } from '@repo/ui'
import { useLayout } from '@repo/modules'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import LayoutTags from '@/Layout/LayoutTags.vue'
import PortList from '@/Layout/PortList.vue'

const { getLayout } = useLayout()

const layout = getLayout()
</script>

<template>
  <div class="animate-fade-in-up space-y-6">
    <ModuleTitle menu="Settings" />

    <BackgroundSettings
      app-name="cloud"
      :pages="[
        { path: '/', label: 'Home', icon: 'mdi-home' },
        { path: '/locos', label: 'Roster', icon: 'mdi-train' },
        { path: '/effects', label: 'Effects', icon: 'mdi-auto-fix' },
        { path: '/routes', label: 'Routes', icon: 'mdi-map-marker-path' },
        { path: '/signals', label: 'Signals', icon: 'mdi-traffic-light' },
        { path: '/sensors', label: 'Sensors', icon: 'mdi-motion-sensor' },
        { path: '/turnouts', label: 'Turnouts', icon: 'mdi-directions-fork' },
        { path: '/dccex', label: 'DCC-EX', icon: 'mdi-console' },
        { path: '/layout', label: 'Layout', icon: 'mdi-floor-plan' },
      ]"
      class="mb-4"
    />

    <div class="glass-dark rounded-2xl shadow-soft-dark p-6 bg-gradient-to-r from-brand-blue/20 to-brand-cyan/20 border border-white/5">
      <h2 class="text-white text-3xl font-bold tracking-tight">
        {{ layout?.name }}
      </h2>
      <p class="text-white/60 mt-1 text-sm">Layout configuration and system settings</p>
    </div>

    <h3 class="flex items-center text-brand-cyan mt-8 mb-4">
      <v-icon icon="mdi-tag-multiple" class="w-8 h-8 mr-2"></v-icon>
      <span class="text-2xl font-semibold">Tags</span>
    </h3>
    <LayoutTags />

    <h3 class="flex items-center text-brand-cyan mt-8 mb-4">
      <v-icon icon="mdi-usb" class="w-8 h-8 mr-2"></v-icon>
      <span class="text-2xl font-semibold">USB Ports</span>
    </h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PortList :ports="layout?.ports || []" />

      <v-card
        class="mx-auto w-full h-full justify-between flex flex-col glass border border-white/10"
        prepend-icon="mdi-view-module"
        title="Modules"
        color="transparent"
        variant="flat"
        density="compact"
      >
        <v-card-text>
          <v-list lines="one" bg-color="transparent">
            <v-list-item
              v-for="module in layout?.modules"
              :key="module"
              :title="module"
              class="text-white/80"
            ></v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
