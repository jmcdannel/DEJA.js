<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLocos } from '@repo/modules/locos'

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
        <v-btn-toggle 
          class="border-2 border-primary"
          divided 
          rounded="pill" 
          variant="flat" 
          v-model="active">
          <!-- <v-btn 
            class="sm:px-12"
            :class="$route.path === '/locos' ? 'bg-pink-500' : 'text-pink-500'"
            @click="$router.push('/locos')"
            color="pink"
            icon="mdi-train"
            value="/locos"
          /> -->
          <v-btn 
            class="sm:px-12"
            :class="$route.path === '/throttle-list' ? 'bg-green-500' : 'text-green-500'"
            @click="$router.push('/throttle-list')"
            color="green"
            icon="mdi-view-list"
            value="/throttle-list"
          />
          <v-btn
            :disabled="!throttles.length"
            class="sm:px-12"
            :class="$route.path === '/throttle' ? 'bg-lime-500' : 'text-lime-500'"
            @click="$router.push({ name: 'throttle', params: { address: throttles[0]?.address } })"
            color="lime"
            icon="mdi-speedometer"
            value="/throttle"
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
            class="sm:px-12 hidden md:inline"
            :class="$route.path === '/routes' ? 'bg-teal-500' : 'text-teal-500'"
            @click="$router.push('/routes')"
            color="teal"
            icon="mdi-tournament"
            value="/routes"
          />
          <v-btn 
            class="sm:px-12"
            :class="$route.path === '/turnouts' ? 'bg-blue-500' : 'text-blue-500'"
            @click="$router.push('/turnouts')"
            color="blue"
            icon="mdi-call-split"
            value="/turnouts"
          />
          <!-- <v-btn 
            class="sm:px-12"
            :class="$route.path === '/signals' ? 'bg-blue-500' : 'text-blue-500'"
            @click="$router.push('/signals')"
            color="blue"
            icon="mdi-traffic-light"
            value="/signals"
          /> -->
        </v-btn-toggle>
        <v-spacer />
      </v-row>
    </v-container>
  </v-footer>
</template>