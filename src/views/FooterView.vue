<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ThrottleNav from '@/throttle/ThrottleNav.vue'
defineProps({
  layoutId: {
    type: String,
    required: true
  },
})
const $router = useRouter()
const active = ref($router.currentRoute.value.path)
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
          <v-btn 
            class="sm:px-12 'opacity-65"
            :class="active === '/locos' ? '' : 'text-pink-500'"
            @click="$router.push('/locos')"
            color="pink"
            icon="mdi-train"
            value="/locos"
          />
          <v-btn 
            class="sm:px-12"
            :class="active === '/throttle-list' ? '' : 'text-green-500'"
            @click="$router.push('/throttle-list')"
            color="green"
            icon="mdi-view-list"
            value="/throttle-list"
          />
          <v-btn 
            class="sm:px-12"
            :class="active === '/effects' ? '' : 'text-purple-500'"
            @click="$router.push('/effects')"
            color="purple"
            icon="mdi-rocket"
            value="/effects"
          />
          <v-btn 
            class="sm:px-12"
            :class="active === '/turnouts' ? '' : 'text-yellow-500'"
            @click="$router.push('/turnouts')"
            color="yellow"
            icon="mdi-call-split"
            value="/turnouts"
          />
          <v-btn 
            class="sm:px-12"
            :class="active === '/routes' ? '' : 'text-blue-500'"
            @click="$router.push('/routes')"
            color="blue"
            icon="mdi-tournament"
            value="/routes"
          />
        </v-btn-toggle>
        <v-spacer />
      </v-row>
      <v-row class="p-2 bg-gradient-to-r from-zinc-950 to-gray-950">
        <ThrottleNav v-if="!!layoutId" />
      </v-row>
    </v-container>
  </v-footer>
</template>