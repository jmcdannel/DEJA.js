<script async setup lang="ts">
import type { Throttle } from '@repo/modules/locos'
import ThrottleTile from '@/throttle/ThrottleTile.vue'
import { useLocos } from '@repo/modules/locos'
import { ListMenu } from '@repo/ui'

const { getThrottles } = useLocos()
const throttles = getThrottles()
</script>

<template>
  <main class="@containerp p-2 md:p-4  flex-grow flex flex-col relative overflow-auto w-full h-full flex-1">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px] -top-[200px] -left-[300px]"></div>
      <div class="absolute w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[80px] -bottom-[100px] -right-[200px]"></div>
      <div class="absolute w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[90px] top-[30%] left-[40%]"></div>
    </div>
    <v-toolbar color="green-darken-2" :elevation="8">
      <template #prepend>
        <v-icon icon="mdi-speedometer" class="text-xl md:text-3xl"></v-icon>
      </template>
      <template #append>
        <ListMenu :module-name="'throttles'" />
      </template>
      <v-toolbar-title class="text-xl md:text-3xl">Throttles</v-toolbar-title>    
    </v-toolbar>
    <div v-if="throttles" class="flex-grow flex flex-row flex-wrap relative overflow-auto items-end content-end justify-end">
      <!-- <div class="basis-full @[960px]:basis-1/2 flex-grow"></div> -->
      <div 
        class="basis-full @[960px]:basis-1/2 p-1"  
        v-for="item in throttles"
        :key="((item as unknown) as Throttle).id">
          <ThrottleTile 
            :address="((item as unknown) as Throttle).address" 
          />
      </div>
    </div>
  </main>
</template>
