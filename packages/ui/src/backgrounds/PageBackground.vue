<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useUserPreferences } from '@repo/modules'
import { getBackgroundById } from './registry'
import type { AppBackgroundPrefs } from '@repo/modules'

const props = withDefaults(
  defineProps<{
    appName: string
    backgroundId?: string
    opacity?: number
    defaults?: AppBackgroundPrefs
  }>(),
  {
    backgroundId: undefined,
    opacity: 0.5,
    defaults: undefined,
  },
)

const route = useRoute()
const { getBackground } = useUserPreferences()

const resolvedId = computed(() => {
  // Explicit prop override takes priority
  if (props.backgroundId) return props.backgroundId

  // User preference
  const userPref = getBackground(props.appName, route.path)
  if (userPref.value !== 'none') return userPref.value

  // Migration defaults
  if (props.defaults) {
    const pageBg = props.defaults.pages[route.path]
    if (pageBg) return pageBg
    if (props.defaults.default !== 'none') return props.defaults.default
  }

  return 'none'
})

const bgDef = computed(() => {
  if (resolvedId.value === 'none') return null
  return getBackgroundById(resolvedId.value) ?? null
})

const effectComponent = computed(() => {
  if (bgDef.value?.type === 'effect' && bgDef.value.component) {
    return defineAsyncComponent(bgDef.value.component)
  }
  return null
})

const imageStyle = computed(() => {
  if (bgDef.value?.type !== 'image' || !bgDef.value.asset) return {}
  return {
    backgroundImage: `url(${bgDef.value.asset})`,
    backgroundSize: 'cover',
    backgroundPosition: 'bottom center',
    backgroundRepeat: 'no-repeat',
  }
})
</script>

<template>
  <div class="relative min-h-screen">
    <!-- Image background layer -->
    <div
      v-if="bgDef?.type === 'image'"
      class="fixed inset-0 z-0"
      :style="imageStyle"
    />

    <!-- Effect background layer -->
    <component
      :is="effectComponent"
      v-if="bgDef?.type === 'effect' && effectComponent"
      class="fixed inset-0 z-0"
    />

    <!-- Dark overlay -->
    <div
      v-if="bgDef"
      class="fixed inset-0 z-[1] bg-black"
      :style="{ opacity }"
    />

    <!-- Content -->
    <div class="relative z-[2]">
      <slot />
    </div>
  </div>
</template>
