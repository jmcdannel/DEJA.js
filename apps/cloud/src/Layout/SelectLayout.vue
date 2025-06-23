<script setup lang="ts">
import { collection, query, where } from 'firebase/firestore'
import { useCollection, useCurrentUser } from 'vuefire'
import { db } from '@repo/firebase-config/firebase'

const emit = defineEmits(['selected', 'clear'])

defineProps({
  layoutId: String
})

const user = useCurrentUser()
const layoutsRef = collection(db, 'layouts')
const layoutsQuery = query(layoutsRef, where('owner', '==', user.value?.email))
const layouts = useCollection(layoutsQuery)

async function handleLayoutSelect(newLayout: string) {
  emit('selected', newLayout)
}

</script>
<template>
  <div class="flex flex-row flex-wrap gap-2">
    <v-card v-for="layout in layouts" :key="layout.layoutId" 
      :title="layout.name" 
      color="blue" 
      variant="tonal">
      <v-card-text>
        <v-chip size="small" variant="outlined" class="m-1">{{ layout.layoutId }}</v-chip>
      </v-card-text>
      <v-card-actions>
        <v-btn 
          variant="flat" 
          color="primary" 
          @click="handleLayoutSelect(layout.layoutId)">
          Select
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
  <!-- <v-card title="Select Layout" color="blue" variant="tonal">
    <v-card-text>
      <v-btn v-for="layout in layouts" :key="layout.layoutId"
        variant="outlined" 
        color="primary" 
        class="m-1"
        @click="handleLayoutSelect(layout.layoutId)">
        <template #append>
          <v-chip size="small" variant="outlined" class="m-1">{{ layout.layoutId }}</v-chip>
        </template>
        {{ layout.name }}
      </v-btn>
    </v-card-text>
  </v-card> -->
</template>