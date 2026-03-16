<script setup lang="ts">
import Logo from './Logo.vue'

interface AppLink {
  label: string
  icon: string
  color: string
}

interface Props {
  apps?: AppLink[]
}

withDefaults(defineProps<Props>(), {
  apps: () => [
    { label: 'Cloud', icon: 'mdi-cloud', color: 'text-cyan-400' },
    { label: 'Throttle', icon: 'mdi-gamepad-variant', color: 'text-fuchsia-500' },
    { label: 'Monitor', icon: 'mdi-monitor', color: 'text-sky-400' },
    { label: 'Tour', icon: 'mdi-account-tie-hat', color: 'text-amber-400' },
    { label: 'DEJA.js', icon: 'mdi-chip', color: 'text-lime-400' },
  ],
})
</script>

<template>
  <div class="splash-page relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#020617]">
    <!-- Ambient gradient orbs -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.07] blur-[120px]" />
      <div class="absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full bg-fuchsia-600/[0.08] blur-[100px]" />
      <div class="absolute bottom-1/4 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/[0.06] blur-[100px]" />
    </div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col items-center gap-12">
      <!-- Logo -->
      <Logo size="3xl" />

      <!-- App icons row -->
      <div class="flex items-center gap-8">
        <div
          v-for="app in apps"
          :key="app.label"
          class="group flex flex-col items-center gap-2"
        >
          <div
            class="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-slate-600/60 group-hover:shadow-lg group-hover:shadow-cyan-500/10"
          >
            <v-icon :class="app.color" size="28">{{ app.icon }}</v-icon>
          </div>
          <span class="text-xs font-medium tracking-wide text-slate-400 transition-colors duration-300 group-hover:text-slate-200">
            {{ app.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
