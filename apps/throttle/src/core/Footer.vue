<script setup lang="ts">
import { useCurrentUser } from 'vuefire'
import { useStorage } from '@vueuse/core'
import FooterMenu from '@/core/Menu/FooterMenu.vue'

const user = useCurrentUser()
const layoutId = useStorage('@DEJA/layoutId', 'betatrack')
</script>
<template>
  <v-footer app class="bg-transparent" style="padding-bottom: var(--safe-area-bottom)">
    <v-container fluid class="p-0">
      <v-row class="pt-2 pb-3 px-0">
        <v-spacer />
        <FooterMenu v-if="Boolean(user) && Boolean(layoutId)" />
        <v-spacer />
      </v-row>
    </v-container>
  </v-footer>
</template>