<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { BsCpu } from 'vue3-icons/bs'
  import { useCurrentUser } from 'vuefire'
  import { useConnectionStore } from '@/connections/connectionStore'
  import Roster from '@/core/Roster.vue'
  import DejaCloudRoster from '@/deja-cloud/DejaCloudRoster.vue'
  import LayoutChip from '@/core/LayoutChip.vue'
  import ConnectionChip from '@/core/ConnectionChip.vue'

  const user = useCurrentUser()
  const connStore = useConnectionStore()
  const { 
    layoutId,
    isDejaJS,
    isDejaServer,
    isSerial,
    isEmulated
  } = storeToRefs(connStore)

</script>
<template>
  <main class="flex flex-col flex-grow p-8 w-full viaduct-background bg-opacity-50 bg-fixed overflow-auto">
    <template v-if="isDejaJS || isEmulated || isSerial || isDejaServer">
      <header class="flex justify-between items-center">
        <h2 class="text-transparent text-xl bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-600 my-4">
            Welcome to <br>
            <span class="text-4xl font-bold uppercase">DEJA Throttle</span>
        </h2>
        <aside>
          <LayoutChip />
          <v-divider class="m-4" />
          <ConnectionChip />
        </aside>
    </header>

    <div>
      <v-btn
        class="w-16 !h-16"
        color="primary"
        rounded="circle">
      12
      </v-btn>
    </div>
      <!-- <h2 class="mt-4 text-transparent text-4xl bg-clip-text bg-gradient-to-r from-purple-300 to-pink-600">
        Select
        Your<br>
        <strong class="text-7xl uppercase">Loco</strong>
      </h2>
      <template v-if="!!user && layoutId">
        <DejaCloudRoster />
      </template>
      <template v-else>
        <Roster />
      </template> -->
    </template>
    <template v-else>
      <h2 class="text-transparent text-xl bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-600 my-4">
        Welcome to <strong class="font-extralight uppercase">Deja</strong> Throttle
      </h2>  
      <section class="mt-12">
        <button @click="$router.push({ name: 'connect' })" class="btn btn-lg btn-primary btn-outline w-full">
          View Connection Options <BsCpu class="h-8 w-8 stroke-none" />
        </button>
      </section>
    </template>
    <!-- <pre>{{ connStore }}</pre> -->
  </main>
</template>