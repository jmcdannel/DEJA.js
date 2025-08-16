<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'

interface Props {
  size?: 'normal' | 'small'
}

withDefaults(defineProps<Props>(), {
  size: 'normal'
})

const theme = useTheme()

const centerFill = computed(() => 
  theme.global.current.value.dark ? '#1E1E1E' : 'white'
)

const centerStroke = computed(() => 
  theme.global.current.value.dark ? '#E0E0E0' : '#333'
)
</script>

<template>
  <div class="tour-logo" :class="{ small: size === 'small' }">
    <svg viewBox="0 0 100 100" class="logo-svg">
      <!-- Yellow quarter -->
      <path d="M 50 50 L 50 10 A 40 40 0 0 1 78.28 21.72 Z" fill="#FFD700" />
      <!-- Red quarter -->
      <path d="M 50 50 L 78.28 21.72 A 40 40 0 0 1 78.28 78.28 Z" fill="#FF4444" />
      <!-- Green quarter -->
      <path d="M 50 50 L 78.28 78.28 A 40 40 0 0 1 21.72 78.28 Z" fill="#4CAF50" />
      <!-- Blue quarter -->
      <path d="M 50 50 L 21.72 78.28 A 40 40 0 0 1 21.72 21.72 Z" fill="#2196F3" />
      <!-- Center circle -->
      <circle cx="50" cy="50" r="15" :fill="centerFill" :stroke="centerStroke" stroke-width="2"/>
      <!-- Train icon in center -->
      <text x="50" y="58" text-anchor="middle" font-size="16" :fill="centerStroke">🚂</text>
    </svg>
  </div>
</template>

<style scoped>
.tour-logo {
  width: 48px;
  height: 48px;
  display: inline-block;
}

.tour-logo.small {
  width: 32px;
  height: 32px;
}

.logo-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  transition: transform 0.3s ease;
}

.tour-logo:hover .logo-svg {
  transform: rotate(15deg) scale(1.05);
}
</style>
