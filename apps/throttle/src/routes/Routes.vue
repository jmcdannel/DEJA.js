<script setup lang="ts">
// @ts-nocheck
import { ref, watch }  from 'vue'
import { useLayoutRoutes } from './useLayoutRoutes'
import TamarackJunction from './maps/tam/TamarackJunction.vue'
import PayetteSub from './maps/tam/PayetteSub.vue'
import './route-styles.css'

const activeMap = ref('PayetteSub')

const { 
  clearP1, 
  clearP2,
  getMapClasses, 
  handleMapClick, 
  isRunning, 
  percentComplete, 
  p1, 
  p2, 
  routes, 
  runRoute 
} = useLayoutRoutes()

</script>
<template>
  <div class="relative">
    
    <header class="m-2 flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-800">Routes</h1>
      <nav>
        <v-btn 
          v-for="map in ['TamarackJunction', 'PayetteSub']" 
          :key="map"
          :variant="activeMap === map ? 'flat' : 'outlined'"
          class="mr-2"
          @click="activeMap = map"
        >
        {{ map }}
        </v-btn>
        <v-btn
          :variant="activeMap === 'RoutesList' ? 'flat' : 'outlined'"
          class="mr-2"
          @click="activeMap = 'RoutesList'"
        >Routes List</v-btn>
      </nav>
      <aside class="flex items-center space-x-2">
        <pre>p1: {{ p1 }}</pre>
        <pre>p2: {{ p2 }}</pre>
        <v-chip 
          v-if="p1"
          @click="p1 = undefined"
          color="primary" 
          prepend-icon="mdi-map-marker"
          size="small"
          variant="outlined"
        >{{ p1 }}</v-chip>
        <v-chip
          v-else
          color="primary"
          prepend-icon="mdi-map-marker"
          size="small"
          variant="outlined"
        >No origin selected</v-chip>
        <v-chip 
          v-if="p2"
          @click="p2 = undefined"
          color="secondary" 
          prepend-icon="mdi-map-marker"
          size="small"
          variant="outlined"
        >{{ p2 }}</v-chip>
        <v-chip
          v-else
          color="secondary"
          prepend-icon="mdi-map-marker"
          size="small"
          variant="outlined"
        >No destination selected</v-chip>
      </aside>
    </header>
    <v-progress-linear v-model="percentComplete" :opacity="isRunning ? 1 : 0" 
      color="primary" />
    <TamarackJunction v-if="activeMap === 'TamarackJunction'" @click="handleMapClick" />
    <PayetteSub 
      v-if="activeMap === 'PayetteSub'" 
      @click="handleMapClick" 
      :class="getMapClasses()"
    />
    <div class="flex flex-wrap justify-start items-start"n v-if="activeMap === 'RoutesList'">
      <div v-for="r in routes" :key="r.id" class="p-2 basis-1/4">
        <v-card color="cyan" variant="tonal">
          <v-card-title class="text-lg font-bold">{{ r.id }}</v-card-title>
          <v-card-subtitle>State: {{ r.state }}</v-card-subtitle>
          <v-card-text>
            <div v-if="r.on?.length">On: {{ r.on.map(e => e.name).join(', ') }}</div>
            <div v-if="r.off?.length">Off: {{ r.off.map(e => e.name).join(', ') }}</div>
          </v-card-text>
          <v-card-actions>
            <v-btn 
              @click="runRoute(r)"
              color="primary"
              variant="outlined"
            >Run</v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </div>
    <!-- <pre v-for="r in routes">
{{ r.id }}, {{ r.state }}, {{ r.on?.map(e => e.name) }}, {{ r.off?.map(e => e.name) }}, 
    </pre>
    <p>{{  getMapClasses() }}</p> -->
  </div>
</template>