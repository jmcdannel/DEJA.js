<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    icon?: string
    size?: 'x-small' | 'small' | 'default' | 'large'
    variant?: 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain'
    color?: string
  }>(),
  {
    label: 'Coming Soon',
    icon: 'mdi-rocket-launch-outline',
    size: 'small',
    variant: 'tonal',
    color: 'primary',
  },
)
</script>

<template>
  <v-chip
    :size="size"
    :variant="variant"
    :color="color"
    :prepend-icon="icon"
    class="coming-soon-badge text-none font-weight-medium"
    label
  >
    {{ label }}
  </v-chip>
</template>

<style scoped>
.coming-soon-badge {
  letter-spacing: 0.02em;
}
</style>
