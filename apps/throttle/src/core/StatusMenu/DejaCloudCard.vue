<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCurrentUser } from 'vuefire'
import { useConnectionStore } from '@/connections/connectionStore.jsx'
import DejaSignout from '@/deja-cloud/DejaSignout.vue'
import DejaUser from '@/deja-cloud/DejaUser.vue'
import DejaCloudLayoutMenu from '@/deja-cloud/DejaCloudLayoutMenu.vue'

const user = useCurrentUser()
const connStore = useConnectionStore()
const { layoutId } = storeToRefs(connStore)

async function handleLayoutClick({ layoutId: selectedLayoutId }: { layoutId: string }) {
  console.log('handleLayoutClick', selectedLayoutId, layoutId.value)
  if (selectedLayoutId && selectedLayoutId !== layoutId.value) {
    connStore.connect('dejaJS', selectedLayoutId)
  } else {
    connStore.disconnect()
  }
}

</script>
<template>
  <v-card
    class="bg-blue-950 rounded-3xl p-2 pb-5"
    color="purple"
    variant="text"
  >
    <template #title>
      <h3 class="font-bold text-purple-400 text-2xl">DEJA Cloud</h3>
    </template>
    <template #actions>
      <DejaSignout v-if="!!user" />
      <template v-else>
        <v-btn @click="$router.push({ name: 'deja-cloud' })" >
          Login
        </v-btn>
        <v-btn @click="$router.push({ name: 'deja-cloud' })" >
          Sign Up
        </v-btn>
      </template>
    </template>
    <template #append>
      <v-icon icon="mdi-cloud" :color="!!user ? 'success' : 'error'" size="96" />
    </template>
    <template #item>
      <DejaUser v-if="!!user" class="text-sm my-2" />
    </template>
    <template #text>
      <DejaCloudLayoutMenu 
        color="purple-lighten-2"
        @selectLayout="handleLayoutClick"
        variant="tonal" 
      />
    </template>
  </v-card>
</template>