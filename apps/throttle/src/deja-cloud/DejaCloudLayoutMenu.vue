<script setup lang="ts">
import { collection, query, where } from 'firebase/firestore'
import { useCollection, useCurrentUser } from 'vuefire'
import { db } from '@/firebase'

const user = useCurrentUser()
const layoutsRef = collection(db, 'layouts')
const layoutsQuery = query(layoutsRef, where('owner', '==', user.value?.email))
const layouts = useCollection(layoutsQuery)
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
            @click="$emit('selectLayout', layout)"
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
