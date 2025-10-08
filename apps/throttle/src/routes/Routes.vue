<script setup lang="ts">
// @ts-nocheck
import { ref, watch }  from 'vue'
import { useLayoutRoutes } from '@repo/modules'
import { useLayoutRoutesMap } from './useLayoutRoutesMap'
import TamarackJunction from './maps/tam/TamarackJunction.vue'
import PayetteSub from './maps/tam/PayetteSub.vue'
import './route-styles.css'

const activeMap = ref('PayetteSub')

const { runRoute, isRunning, percentComplete } = useLayoutRoutes()
const { 
  clearP1,
  clearP2,
  getMapClasses,
  handleMapClick,
  p1,
  p2,
  routes,
  routeTurnouts
} = useLayoutRoutesMap()

</script>
<template>
  <div class="relative">
    <header class="m-2 flex items-center justify-between">
      <hgroup class="flex items-center space-x-8">
        <h1 class="text-3xl font-bold text-blue-400">Routes</h1>
      </hgroup>
      <nav class="flex items-center space-x-2">
        <v-btn 
          v-for="map in ['TamarackJunction', 'PayetteSub']" 
          :key="map"
          :variant="activeMap === map ? 'flat' : 'outlined'"
          color="primary"
          prepend-icon="mdi-map"
          size="small"
          @click="activeMap = map"
        >
        {{ map }}
        </v-btn>
        <v-btn
          :variant="activeMap === 'RoutesList' ? 'flat' : 'outlined'"
          prepend-icon="mdi-format-list-bulleted"
          color="primary"
          size="small"
          @click="activeMap = 'RoutesList'"
        >Routes List</v-btn>
      </nav>
    </header>
    <main>
      <v-progress-linear v-model="percentComplete" :opacity="isRunning ? 1 : 0" color="primary" />
      <v-timeline class="my-2" direction="horizontal" side="start" size="small" truncate-line="both">
        <v-timeline-item dot-color="blue-lighten-1" icon="mdi-map-marker" size="small" fill-dot>
          <template #opposite>
            <v-chip 
              v-if="p1"
              @click="p1 = undefined"
              color="primary" 
              prepend-icon="mdi-map-marker"
              append-icon="mdi-close"
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
          </template>
        </v-timeline-item>
        <template v-if="p1 && p2">
          <v-timeline-item 
            
            v-for="(t, idx) in routeTurnouts" 
            :key="idx"
            dot-color="purple-darken-1"
            fill-dot
            icon="mdi-call-split"
            size="small"
          >
            <template #opposite>
              <!-- <span class="text-xs">{{ t.state ? 'Straight' : 'Divergent' }}</span> -->
              <span class="text-xs">{{ t.name }}</span>
            </template>
          </v-timeline-item>
        </template>
        <template  v-else>
          <v-timeline-item
            dot-color="grey-darken-1"
            fill-dot
            icon="mdi-call-split"
            size="small"
          >
          </v-timeline-item>
          <v-timeline-item
            dot-color="grey-darken-1"
            fill-dot
            icon="mdi-call-split"
            size="small"
          >
          </v-timeline-item>
        </template>
        <v-timeline-item dot-color="secondary" icon="mdi-map-marker"  size="small" fill-dot>
          <template #opposite>
            <v-chip 
              v-if="p2"
              @click="p2 = undefined"
              color="secondary" 
              append-icon="mdi-close"
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
          </template>
        </v-timeline-item>
      </v-timeline>
      <!-- <pre>{{ routeTurnouts }}</pre> -->
    </main>
    <TamarackJunction v-if="activeMap === 'TamarackJunction'" @click="handleMapClick" />
    <PayetteSub 
      v-if="activeMap === 'PayetteSub'" 
      @click="handleMapClick" 
      :class="getMapClasses()"
    />
    <v-container v-if="activeMap === 'RoutesList'" class="overflow-y-auto" >
      <v-row>
        <v-col v-for="r in routes" :key="r.id" cols="12" xs="12" sm="6" lg="4">
          <v-card color="cyan" variant="tonal">
            <v-card-title class="text-lg font-bold">{{ r.id }}</v-card-title>
            <v-card-subtitle>State: {{ r.state }}</v-card-subtitle>
            <v-card-text>
              <v-chip-group>
                <v-chip
                  prepend-icon="mdi-map-marker"
                  size="small"
                >{{ r?.point1 }}</v-chip>
                <v-chip v-for="t in r?.on" :key="t.id" size="small" prepend-icon="mdi-call-split">{{ t.name }}</v-chip>
                <v-chip v-for="t in r?.off" :key="t.id" size="small" prepend-icon="mdi-call-split">{{ t.name }}</v-chip>
                <v-chip
                  append-icon="mdi-map-marker"
                  :color="color"
                  size="small"
                >{{ r?.point2 }}</v-chip>
              </v-chip-group>
            </v-card-text>
            <v-card-actions>
              <v-btn 
                @click="runRoute(r)"
                color="primary"
                variant="outlined"
              >Run</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <!-- <pre v-for="r in routes">
{{ r.id }}, {{ r.state }}, {{ r.on?.map(e => e.name) }}, {{ r.off?.map(e => e.name) }}, 
    </pre>
    <p>{{  getMapClasses() }}</p> -->
  </div>
</template>