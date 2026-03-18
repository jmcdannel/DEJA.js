<script setup lang="ts">
import Logo from './Logo.vue'
import BackgroundStarfield from './BackgroundStarfield.vue'
import BackgroundAurora from './BackgroundAurora.vue'
import { backgroundUrls } from './backgrounds/blob-urls'
import { computed } from 'vue'

export type SplashBackground = 'starfield' | 'nebula' | 'milkyway' | 'neon' | 'aurora' | 'railroad-night' | 'dark-tracks' | 'steam-locomotive' | 'train-station'

interface AppLink {
  label: string
  icon: string
  color: string
}

interface Props {
  background?: SplashBackground
  apps?: AppLink[]
}

const props = withDefaults(defineProps<Props>(), {
  background: 'starfield',
  apps: () => [
    { label: 'Server', icon: 'mdi-server', color: '#FF0000' },
    { label: 'Throttle', icon: 'mdi-gamepad-variant', color: '#84CC16' },
    { label: 'Cloud', icon: 'mdi-cloud', color: '#D946EF' },
    { label: 'Monitor', icon: 'mdi-monitor', color: '#EF4444' },
    { label: 'Tour', icon: 'mdi-account-tie-hat', color: '#8B5CF6' },
  ],
})

const bgImageMap: Record<string, string> = {
  nebula: backgroundUrls.nebula,
  milkyway: backgroundUrls.milkyway,
  neon: backgroundUrls['neon-lines'],
  'railroad-night': backgroundUrls['railroad-night'],
  'dark-tracks': backgroundUrls['dark-tracks'],
  'steam-locomotive': backgroundUrls['steam-locomotive'],
  'train-station': backgroundUrls['train-station-night'],
}

const bgImageUrl = computed(() => bgImageMap[props.background] ?? null)
</script>

<template>
  <div class="splash-page">
    <!-- Effect backgrounds -->
    <BackgroundStarfield v-if="background === 'starfield'" class="bg-layer" />
    <BackgroundAurora v-if="background === 'aurora'" class="bg-layer" />

    <!-- Photo backgrounds -->
    <div
      v-if="bgImageUrl"
      class="bg-layer bg-photo"
      :style="{ backgroundImage: `url(${bgImageUrl})` }"
    />
    <div v-if="bgImageUrl" class="bg-layer bg-overlay" />

    <!-- Content -->
    <div class="splash-content">
      <div class="logo-entrance">
        <Logo size="3xl" />
      </div>

      <div class="app-row">
        <div
          v-for="(app, i) in apps"
          :key="app.label"
          class="app-item"
          :style="{ animationDelay: `${0.4 + i * 0.1}s` }"
        >
          <v-icon :color="app.color" size="32">{{ app.icon }}</v-icon>
          <span class="app-label">{{ app.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.splash-page {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
  background: #03010a;
}

.bg-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-photo {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.35;
}

.bg-overlay {
  background: linear-gradient(
    to bottom,
    rgba(3, 1, 10, 0.7) 0%,
    rgba(3, 1, 10, 0.5) 40%,
    rgba(3, 1, 10, 0.8) 100%
  );
}

/* --- Content --- */
.splash-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
}

/* --- Entrance animations --- */
.logo-entrance {
  animation: fade-up 0.8s ease-out both;
}

.app-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 36px;
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: default;
  animation: fade-up 0.6s ease-out both;
  transition: transform 0.3s ease;
}

.app-item:hover {
  transform: translateY(-4px);
}

.app-label {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: rgba(148, 163, 184, 1);
  transition: color 0.3s ease;
}

.app-item:hover .app-label {
  color: rgba(226, 232, 240, 1);
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
