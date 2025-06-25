<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'
import ThrottleNav from '@/throttle/ThrottleNav.vue'

const router = useRouter()
const route = useRoute()
const active = ref(route.path)

const user = useCurrentUser()
const layoutId = useStorage('@DEJA/layoutId', '')
</script>
<template>
  <v-footer app class="bg-transparent" v-if="!!user && !!layoutId">
    <v-container fluid class="p-0">
      <v-row class="pt-2 pb-3 px-0">
        <v-spacer />
        <v-btn-toggle 
          class="border-2 border-primary"
          divided 
          rounded="pill" 
          variant="flat" 
          v-model="active">
          <v-btn 
            class="sm:px-12"
            :class="$route.path === '/locos' ? 'bg-pink-500' : 'text-pink-500'"
            @click="$router.push('/locos')"
            color="pink"
            icon="mdi-train"
            value="/locos"
          />
          <v-btn 
            class="sm:px-12"
            :class="$route.path === '/throttle-list' ? 'bg-green-500' : 'text-green-500'"
            @click="$router.push('/throttle-list')"
            color="green"
            icon="mdi-view-list"
            value="/throttle-list"
          />
          <v-btn 
            class="sm:px-12"
            :class="$route.path === '/conductor' ? 'bg-red-500' : 'text-red-500'"
            @click="$router.push('/conductor')"
            color="red"
            icon="mdi-account-tie-hat"
            value="/conductor"
          />
          <v-btn 
            class="sm:px-12"
            :class="$route.path === '/effects' ? 'bg-purple-500' : 'text-purple-500'"
            @click="$router.push('/effects')"
            color="purple"
            icon="mdi-rocket"
            value="/effects"
          />
          <v-btn 
            class="sm:px-12"
            :class="$route.path === '/turnouts' ? 'bg-yellow-500' : 'text-yellow-500'"
            @click="$router.push('/turnouts')"
            color="yellow"
            icon="mdi-call-split"
            value="/turnouts"
          />
          <v-btn 
            class="sm:px-12"
            :class="$route.path === '/routes' ? '' : 'text-blue-500'"
            @click="$router.push('/routes')"
            color="blue"
            icon="mdi-tournament"
            value="/routes"
          />
        </v-btn-toggle>
        <v-spacer />
      </v-row>
      <!-- <v-row class="p-2 bg-gradient-to-r from-zinc-950 to-gray-950">
        <ThrottleNav v-if="!!layoutId" />
      </v-row> -->
    </v-container>
  </v-footer>
</template>