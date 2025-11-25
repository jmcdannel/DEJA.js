<script setup lang="ts">
import { computed } from 'vue'
import { collection, query, where } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { useCollection, useCurrentUser } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { db } from '@repo/firebase-config'

const user = useCurrentUser()
const router = useRouter()
console.log('Loading LayoutsList.vue', user.value)

// Create a computed property for the layouts query that only runs when user is available
const layoutsQuery = computed(() => {
  if (!user.value?.email) {
    // Return null if no user email, which will prevent the query from running
    return null
  }
  
  const layoutsRef = collection(db, 'layouts')
  return query(layoutsRef, where('owner', '==', user.value.email))
})

// Use the computed query, but only when it's not null
const layouts = useCollection(layoutsQuery)

const layoutId = useStorage('@DEJA/layoutId', '')

function handleLayoutSelect(selectedLayoutId: string) {
  console.log('Selected layout ID:', selectedLayoutId)
  if (selectedLayoutId) {
    layoutId.value = selectedLayoutId
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <main class="flex flex-col flex-grow p-8 w-full viaduct-background bg-opacity-50 bg-fixed overflow-auto">
    <v-card
      class="mx-auto my-8"
      max-width="400"
    >
      <v-card-text>
        <h2 class="text-h6 mb-2">Your Layouts</h2>
        <div v-for="layout in layouts" :key="layout.id" 
          class="p-4 rounded-lg border cursor-pointer transition-all hover:bg-gray-800 my-2"
          :class="{ 'border-green-500 bg-green-800': layout.id === layoutId, 'border-gray-200 bg-gray-900': layout.id !== layoutId }"
          @click="handleLayoutSelect(layout.id)">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <v-icon :color="layout.id === layoutId ? 'green' : 'grey'">mdi-home</v-icon>
              <div>
                <h4 class="font-medium">{{ layout.name }}</h4>
                <p v-if="layout.description" class="text-sm text-gray-600">{{ layout.description }}</p>
              </div>
            </div>
            <v-icon v-if="layout.id === layoutId" color="green">mdi-check-circle</v-icon>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </main>
</template>
