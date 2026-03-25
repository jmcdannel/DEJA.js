<script setup lang="ts">
import { ref } from 'vue'
import type { Promotion } from '@repo/modules'
import { VARIANT_COLORS } from '@repo/modules'

defineProps<{
  promotion: Promotion
}>()

const dismissed = ref(false)
</script>

<template>
  <v-banner
    v-if="!dismissed"
    lines="one"
    :color="VARIANT_COLORS[promotion.variant] ?? 'info'"
    density="compact"
    :sticky="false"
    class="text-body-2"
  >
    <template #prepend>
      <span v-if="promotion.icon" class="text-lg">{{ promotion.icon }}</span>
    </template>
    <template #text>
      <strong>{{ promotion.title }}</strong> — {{ promotion.body }}
    </template>
    <template #actions>
      <v-btn
        v-for="cta in promotion.ctas"
        :key="cta.url"
        :variant="cta.style === 'primary' ? 'tonal' : 'text'"
        size="small"
        :href="cta.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ cta.label }}
      </v-btn>
      <v-btn
        icon="mdi-close"
        size="x-small"
        variant="text"
        @click="dismissed = true"
      />
    </template>
  </v-banner>
</template>
