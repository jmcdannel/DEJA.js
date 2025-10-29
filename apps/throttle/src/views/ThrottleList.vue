<script async setup lang="ts">
import { ref } from 'vue'
import type { Throttle } from '@repo/modules/locos'
import ThrottleTile from '@/throttle/ThrottleTile.vue'
import { useLocos, type Loco } from '@repo/modules/locos'
import { useRoster } from '@/roster/useRoster'
import { LocoAvatar, ListMenu } from '@repo/ui'

const { getLocos, getThrottles } = useLocos()
const locos = getLocos()
const { acquireThrottle } = useRoster()
const throttles = getThrottles()

const isRosterOpen = ref(false)

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
    <div v-if="throttles" class="flex-grow flex pb-16 flex-row flex-wrap relative overflow-auto items-end content-end justify-end">
      <!-- <div class="basis-full @[960px]:basis-1/2 flex-grow"></div> -->
      <div 
        class="basis-full md:basis-1/2 p-1"  
        v-for="item in throttles"
        :key="((item as unknown) as Throttle).id">
          <ThrottleTile 
            :address="((item as unknown) as Throttle).address" 
          />
      </div>
      <v-fab icon="mdi-plus" color="primary" size="56" @click="isRosterOpen = true"  app />
    </div>
  </main>
  <v-dialog v-model="isRosterOpen" max-width="800px">
    <template v-slot:default>
      <v-sheet class="p-4">
        <v-row class="flex justify-center">
          <v-col cols="auto"
            v-for="loco in locos" 
            :key="loco.address" 
            >
            <LocoAvatar 
              :loco="loco as Loco"
              @select="async () => { await acquireThrottle(loco.address); isRosterOpen = false }"
              :showMenu="false" 
              variant="flat"
              class="m-2"
            />
          </v-col>
        </v-row>
      </v-sheet>
    </template>    
  </v-dialog>
</template>
