<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useLayout } from '@repo/modules'

const router = useRouter()
const { getLayouts } = useLayout()
const layouts = getLayouts()
const layoutId = useStorage('@DEJA/layoutId', '')

async function handleLayoutSelect(newLayoutId: string) {
  layoutId.value = newLayoutId
  // Redirect to home page after selection
  router.push('/')
}

// Clear any empty string values on mount
if (layoutId.value === '') {
  layoutId.value = null
}

function handleCreateNew() {
  // TODO: Implement create new layout functionality
  console.log('Create new layout')
}
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-sky-500 mb-8 text-center">
        Choose Your Layout
      </h1>
      
      <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">
        Select an existing layout or create a new one to get started with your model railroad control system.
      </p>

      <!-- Existing Layouts -->
      <div v-if="layouts && layouts.length > 0" class="mb-12">
        <h2 class="text-2xl font-semibold text-sky-400 mb-6">Your Layouts</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="layout in layouts" 
            :key="layout.id" 
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 dark:border-gray-700"
            @click="handleLayoutSelect(layout.id)"
          >
            <div class="p-6">
              <h3 class="text-lg font-semibold text-sky-600 mb-3">
                {{ layout.name || 'Unnamed Layout' }}
              </h3>
              <div class="space-y-2 mb-4">
                <span class="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {{ layout.id }}
                </span>
                <p v-if="layout.description" class="text-gray-600 dark:text-gray-300 text-sm">
                  {{ layout.description }}
                </p>
                <p v-else class="text-gray-500 dark:text-gray-400 text-sm italic">
                  No description available
                </p>
              </div>
              <button 
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                @click="handleLayoutSelect(layout.id)"
              >
                Select Layout
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Layouts Message -->
      <div v-else-if="layouts && layouts.length === 0" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
          No Layouts Found
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          You don't have any layouts yet. Create your first layout to get started!
        </p>
      </div>

      <!-- Create New Layout -->
      <div class="text-center">
        <button 
          class="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 inline-flex items-center"
          @click="handleCreateNew"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Create New Layout
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="!layouts" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-500 dark:text-gray-400">Loading layouts...</p>
      </div>
    </div>
  </div>
</template>
