<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFirestore, collection, query, where } from 'firebase/firestore'
import { useCollection, useCurrentUser } from 'vuefire'
import { db } from '../firebase'

const user = useCurrentUser()
const layoutsRef = collection(db, 'layouts')
const layoutsQuery = query(layoutsRef, where('owner', '==', user.value?.email))
const layouts = useCollection(user.value ? layoutsQuery : null)
</script>

<template>
  <main class="" v-if="user && layouts?.length > 0">
    <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" v-if="Array.isArray(layouts) && layouts.length > 0">
      <li class="mb-2" v-for="layout in layouts" :key="layout.layoutId">
        <button 
          class="block w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
          @click="$emit('selected', layout)" >{{ layout.layoutId }}
        </button>
      </li>
    </ul>
  </main>
  <main v-else>
    Login to view your layouts
  </main>
</template>
