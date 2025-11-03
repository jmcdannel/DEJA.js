<script setup lang="ts">
import { ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { useLocos } from '@repo/modules'
import FooterMenu from '@/core/Menu/FooterMenu.vue'

const user = useCurrentUser()
const layoutId = useStorage('@DEJA/layoutId', 'betatrack')
const route = useRoute()
const { getThrottles } = useLocos()
const active = ref(route.path)
const throttles = getThrottles()
</script>
<template>
  <v-footer app class="bg-transparent">
    <v-container fluid class="p-0">
      <v-row class="pt-2 pb-3 px-0">
        <v-spacer />
        <FooterMenu v-if="Boolean(user) && Boolean(layoutId)" />
        <v-spacer />
      </v-row>
    </v-container>
  </v-footer>
</template>