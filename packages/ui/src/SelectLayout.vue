<script setup lang="ts">
import { useCurrentUser } from 'vuefire'
import { useLayout } from '@repo/modules'

const props = withDefaults(
  defineProps<{
    /** Currently selected layoutId (to show active indicator) */
    layoutId?: string | null
    /** 'page' for fullscreen gate, 'compact' for dialog/inline use */
    variant?: 'page' | 'compact'
  }>(),
  {
    layoutId: null,
    variant: 'page',
  },
)

const emit = defineEmits<{
  selected: [layoutId: string]
}>()

const user = useCurrentUser()
const { getLayouts } = useLayout()
const layouts = getLayouts(user.value?.email)
</script>

<template>
  <div
    class="flex flex-col items-center w-full"
    :class="variant === 'page' ? 'min-h-[60vh] justify-center py-12 px-4' : 'py-2 px-2'"
  >
    <!-- 🏠 Hero section (page variant only) -->
    <template v-if="variant === 'page'">
      <v-icon size="48" color="primary" class="mb-4 animate-fade-in-up">mdi-home-city</v-icon>
      <h1 class="text-h4 font-weight-bold text-white mb-2 animate-fade-in-up">
        Choose Your Layout
      </h1>
      <p class="text-body-1 text-medium-emphasis mb-8 animate-fade-in-up">
        Select a layout to get started
      </p>
    </template>

    <!-- ⏳ Loading state -->
    <template v-if="!layouts">
      <v-row class="w-full max-w-2xl" justify="center">
        <v-col v-for="n in 2" :key="n" cols="12" md="6">
          <v-skeleton-loader type="card" class="rounded-2xl" />
        </v-col>
      </v-row>
    </template>

    <!-- 📋 Layout cards -->
    <v-row v-else-if="layouts.length > 0" class="w-full max-w-2xl" justify="center">
      <v-col
        v-for="layout in layouts"
        :key="layout.id"
        cols="12"
        md="6"
      >
        <v-card
          class="glass-dark hover:glass-cyan hover:scale-[1.02] transition-all duration-300 rounded-2xl cursor-pointer"
          :class="{ 'border-l-4 border-l-cyan-400': layoutId === layout.id }"
          @click="emit('selected', layout.id)"
        >
          <v-card-text class="pa-5">
            <div class="flex items-center gap-3 mb-3">
              <v-icon v-if="layoutId === layout.id" color="cyan" size="20">mdi-check-circle</v-icon>
              <span class="text-h6 font-weight-bold text-white">
                {{ layout.name || 'Unnamed Layout' }}
              </span>
            </div>
            <v-chip
              size="small"
              color="primary"
              variant="outlined"
              class="mb-2"
            >
              {{ layout.id }}
            </v-chip>
            <p v-if="layout.description" class="text-body-2 text-medium-emphasis mt-2 mb-0">
              {{ layout.description }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 🚫 Empty state (defensive — guard should redirect to onboarding) -->
    <div v-else class="text-center py-8">
      <v-icon size="48" color="grey" class="mb-4">mdi-home-off-outline</v-icon>
      <p class="text-body-1 text-medium-emphasis">
        No layouts found. Please create a layout first.
      </p>
    </div>
  </div>
</template>
