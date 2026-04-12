<script setup lang="ts">
export interface EmptyStateUseCase {
  icon: string
  text: string
}

interface Props {
  /** MDI icon name (e.g. `mdi-train`). */
  icon?: string
  /** Heading text. Defaults to "No items found". */
  title?: string
  /** Body copy below the title. */
  description?: string
  /**
   * Accent color. Used for the icon halo, title tint, chip outlines, and action button.
   * Accepts any Vuetify color token (e.g. `primary`, `pink`, `indigo`).
   * When omitted, the component renders a neutral (muted) variant.
   */
  color?: string
  /** Optional chips rendered below the description. */
  useCases?: EmptyStateUseCase[]
  /** Label for the primary action button. When provided, the button renders. */
  actionLabel?: string
  /** Optional router target for the action button. */
  actionTo?: string
}

withDefaults(defineProps<Props>(), {
  useCases: () => [],
})

defineEmits<{ (e: 'action'): void }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4">
    <!-- ═══════ Rich variant (with color accent) ═══════ -->
    <template v-if="color">
      <div v-if="icon" class="relative mb-8">
        <div
          class="absolute inset-0 rounded-full blur-[40px] opacity-30 animate-pulse"
          :class="`bg-${color}-500`"
        />
        <div
          class="relative flex items-center justify-center w-28 h-28 rounded-full border-2 border-dashed"
          :class="`border-${color}-500/40 bg-${color}-500/10`"
        >
          <v-icon
            size="56"
            :class="`text-${color}-500 dark:text-${color}-400`"
          >
            {{ icon }}
          </v-icon>
        </div>
      </div>

      <h3
        class="text-2xl font-bold mb-3 tracking-wide"
        :class="`text-${color}-500 dark:text-${color}-400`"
      >
        {{ title ?? 'No items found' }}
      </h3>

      <p v-if="description" class="opacity-60 text-center max-w-md mb-8 text-sm leading-relaxed">
        {{ description }}
      </p>

      <div v-if="useCases.length" class="flex flex-wrap justify-center gap-3 mb-10">
        <v-chip
          v-for="useCase in useCases"
          :key="useCase.text"
          :prepend-icon="useCase.icon"
          variant="outlined"
          :color="color"
          size="small"
          class="tracking-wide"
        >
          {{ useCase.text }}
        </v-chip>
      </div>

      <v-btn
        v-if="actionLabel"
        :color="color"
        size="large"
        variant="flat"
        :prepend-icon="icon"
        rounded="lg"
        class="font-semibold tracking-wide shadow-lg"
        :to="actionTo"
        @click="$emit('action')"
      >
        {{ actionLabel }}
      </v-btn>
    </template>

    <!-- ═══════ Simple variant (no color — backwards compat) ═══════ -->
    <template v-else>
      <v-icon
        v-if="icon"
        :icon="icon"
        size="64"
        class="mb-4 opacity-40"
      />
      <h3 class="text-xl font-semibold mb-2 opacity-70">
        {{ title ?? 'No items found' }}
      </h3>
      <p v-if="description" class="text-sm opacity-50 text-center max-w-md">
        {{ description }}
      </p>
    </template>
  </div>
</template>
