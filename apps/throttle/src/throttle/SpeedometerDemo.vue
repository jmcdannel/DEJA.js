<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-8 text-center">
        🚂 Speedometer Showcase - Choo Choo Choose Your Speed!
      </h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <!-- Static examples -->
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h3 class="text-lg font-semibold text-gray-700 mb-4 text-center">Low Speed</h3>
          <Speedometer :speed="25" :address="1234" />
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h3 class="text-lg font-semibold text-gray-700 mb-4 text-center">Medium Speed</h3>
          <Speedometer :speed="75" :address="5678" />
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h3 class="text-lg font-semibold text-gray-700 mb-4 text-center">High Speed</h3>
          <Speedometer :speed="120" :address="9999" />
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h3 class="text-lg font-semibold text-gray-700 mb-4 text-center">Full Speed</h3>
          <Speedometer :speed="126" :address="4321" />
        </div>
      </div>
      
      <!-- Interactive demo -->
      <div class="mt-12 bg-white p-8 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
          🎮 Interactive Demo - All Aboard the Speed Train!
        </h2>
        
        <div class="flex flex-col md:flex-row items-center justify-center gap-8">
          <div class="flex flex-col items-center gap-4">
            <label class="text-sm font-medium text-gray-700">Speed: {{ demoSpeed }}</label>
            <input
              v-model="demoSpeed"
              type="range"
              min="0"
              max="126"
              class="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div class="flex gap-2 text-xs text-gray-500">
              <span>0</span>
              <span class="ml-auto">126</span>
            </div>
          </div>
          
          <div class="flex flex-col items-center gap-4">
            <label class="text-sm font-medium text-gray-700">Address: {{ demoAddress }}</label>
            <input
              v-model="demoAddress"
              type="number"
              min="1"
              max="9999"
              class="w-24 px-3 py-2 border border-gray-300 rounded-md text-center"
            />
          </div>
        </div>
        
        <div class="flex justify-center mt-6">
          <Speedometer :speed="demoSpeed" :address="demoAddress" :size="160" />
        </div>
      </div>
      
      <!-- Features showcase -->
      <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
          <div class="text-4xl mb-4">🎯</div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Precise Ticks</h3>
          <p class="text-gray-600 text-sm">
            Major and minor tick marks with value labels for accurate speed reading
          </p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
          <div class="text-4xl mb-4">🎨</div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Dynamic Colors</h3>
          <p class="text-gray-600 text-sm">
            Needle color changes based on speed: green (low), amber (medium), red (high)
          </p>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
          <div class="text-4xl mb-4">📱</div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Responsive Design</h3>
          <p class="text-gray-600 text-sm">
            SVG-based with smooth animations and customizable sizing
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Speedometer from './Speedometer.vue'

const demoSpeed = ref(50)
const demoAddress = ref(1234)
</script>
