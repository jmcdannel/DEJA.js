<script setup lang="ts">
// @ts-nocheck
import { ref, watch }  from 'vue'
import { useLayoutRoutes } from './useLayoutRoutes'
import TamarackJunction from './maps/tam/TamarackJunction.vue'
import PayetteSub from './maps/tam/PayetteSub.vue'
import './route-styles.css'

const activeMap = ref('PayetteSub')

const { getMapClasses, isRunning, percentComplete, p1, p2, routes, handleMapClick } = useLayoutRoutes()

</script>
<template>
  <div class="relative">
    
    <div class="mb-4">
      <v-btn 
        v-for="map in ['TamarackJunction', 'PayetteSub']" 
        :key="map"
        :variant="activeMap === map ? 'flat' : 'outlined'"
        class="mr-2"
        @click="activeMap = map"
      >
      {{ map }}
      </v-btn>
    </div>
    <v-progress-linear v-model="percentComplete" :opacity="isRunning ? 1 : 0" 
      color="primary" />
    <TamarackJunction v-if="activeMap === 'TamarackJunction'" @click="handleMapClick" />
    <PayetteSub 
      v-if="activeMap === 'PayetteSub'" 
      @click="handleMapClick" 
      :class="getMapClasses()"
    />
    <pre>p1: {{ p1 }}</pre>
    <pre>p2: {{ p2 }}</pre>
    <pre v-for="r in routes">
      {{ r.id }}, {{ r.state }}, {{ r.timestamp }}, 
    </pre>
    <p>{{  getMapClasses() }}</p>
  </div>
</template>