<script setup lang="ts">

import { collection, query, where } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { useCollection, useCurrentUser } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { db } from '@repo/firebase-config'

const user = useCurrentUser()
const router = useRouter()
console.log('Loading LayoutsList.vue', user.value)
const layoutsRef = collection(db, 'layouts')
const layoutsQuery = query(layoutsRef, where('owner', '==', user.value?.email))
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
  <v-card
    class="mx-auto"
    max-width="400"
  >
    <v-card-text>
      <h2 class="text-h6 mb-2">Your Layouts</h2>
      <v-chip-group column >
        <v-chip v-for="layout in layouts" 
          @click="handleLayoutSelect(layout.layoutId)"
          :key="layout.layoutId" 
          variant="outlined"
          color="primary"
        >
          {{ layout.layoutId }}
        </v-chip>
      </v-chip-group>
    </v-card-text>
  </v-card>
</template>
