<script setup lang="ts">
interface UseCase {
  icon: string
  text: string
}

defineProps<{
  icon: string
  color: string
  title: string
  description: string
  useCases: UseCase[]
  actionLabel?: string
  actionTo?: string
}>()

defineEmits(['action'])
</script>
<template>
  <div class="flex flex-col items-center justify-center py-16 px-4">
    <div class="relative mb-8">
      <div
        class="absolute inset-0 rounded-full blur-[40px] opacity-30 animate-pulse"
        :class="`bg-${color}-500`"
      ></div>
      <div
        class="relative flex items-center justify-center w-28 h-28 rounded-full border-2 border-dashed"
        :class="`border-${color}-500/40 bg-${color}-500/10`"
      >
        <v-icon
          size="56"
          :class="`text-${color}-500 dark:text-${color}-400`"
        >{{ icon }}</v-icon>
      </div>
    </div>

    <h3
      class="text-2xl font-bold mb-3 tracking-wide"
      :class="`text-${color}-500 dark:text-${color}-400`"
    >{{ title }}</h3>

    <p class="text-slate-400 text-center max-w-md mb-8 text-sm leading-relaxed">
      {{ description }}
    </p>

    <div class="flex flex-wrap justify-center gap-3 mb-10">
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
  </div>
</template>
