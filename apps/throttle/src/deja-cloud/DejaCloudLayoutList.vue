<script setup lang="ts">
import { collection, query, where } from 'firebase/firestore'
import { useCollection, useCurrentUser } from 'vuefire'
  import { 
    BsCloud,
    BsCloudFill,
  } from 'vue3-icons/bs'
import { db } from '@repo/firebase-config/firebase'

const user = useCurrentUser()
const layoutsRef = collection(db, 'layouts')
const layoutsQuery = query(layoutsRef, where('owner', '==', user.value?.email))
const layouts = useCollection(layoutsQuery)
</script>

<template>
  <h4 class="text-sm uppercase text-indigo-500">
   Your Layouts
  </h4>   
  <main class="px-8 py-4 grid grid-cols-1 gap-4 md:grid-cols-2" v-if="user && layouts?.length > 0">
    <!-- <pre>{{ user }}</pre> -->   
    <nav class="flex flex-col items-center min-w-48">
      <button v-for="layout in layouts" 
        :key="layout.layoutId" 
        class="btn btn-lg btn-outline border-primary text-primary w-full my-1"
        @click="$emit('selectLayout', layout)">
        <BsCloudFill />
        {{ layout.layoutId }}
      </button>
    </nav>
  </main>
  <main v-else>
    Login to view your layouts
  </main>
</template>
