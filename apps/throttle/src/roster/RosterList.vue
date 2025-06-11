<script setup lang="ts">
import { ref } from 'vue'
import router from '@/router'
import type { Loco } from '@repo/modules/locos'
import { useStorage } from '@vueuse/core'
import { useLocos } from '@repo/modules/locos'
import { useRoster } from '@/roster/useRoster'
import RosterViewMenu from '@/roster/RosterViewMenu.vue'
import AddLoco from '@/roster/AddLoco.vue'
import LocoAvatar from '@/core/LocoAvatar/LocoAvatar.vue'
import RosterListItem from '@/roster/RosterListItem.vue'

const viewAs = useStorage('@DEJA/prefs/rosterView', 'grid')

defineProps({
  allowAdd: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['selected'])
const { getLocos } = useLocos()
const { acquireThrottle } = useRoster()
const locos = getLocos()
const showAdd = ref(false)

async function handleThrottle(address: number) {
  await acquireThrottle(address)
  router.push({ name: 'throttle', params: { address } })
}

</script>
<template>
  <v-toolbar 
    class="bg-clip-text bg-gradient-to-r from-purple-300 to-pink-600"  
    color="purple" 
    variant="tonal"
  >
    <v-toolbar-title class="text-3xl text-purple-400">Roster</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items color="purple">
      <v-btn icon="mdi-eye"></v-btn>
      <v-btn icon="mdi-filter"></v-btn>
    </v-toolbar-items>
  </v-toolbar>
  <main>
    <!-- <RosterViewMenu /> -->
    <v-spacer class="my-4"></v-spacer>
    <template v-if="viewAs == 'grid'">
      <div class="flex flex-wrap gap-2 sm:gap-4 md:gap-10">
        <LocoAvatar
          v-for="loco in locos" 
          :key="loco.address" 
          :loco="loco as Loco"
          @selected="handleThrottle"
          :showMenu="false" 
          variant="flat"
        />
        <v-btn v-if="allowAdd"
          @click="showAdd = !showAdd" 
          color="pink"
          icon="mdi-plus"
          role="link"
          size="72"
          variant="tonal">
        </v-btn>
      </div>
    </template>
    <template v-else>
      <RosterListItem v-for="loco in locos" :key="((loco as unknown) as Loco).address" :loco="(loco as unknown) as Loco" @selected="handleThrottle" />
      <v-btn v-if="allowAdd"
        @click="showAdd = !showAdd" 
        color="pink"
        prepend-icon="mdi-plus"
        role="link"
        text="Add New Locomotive"
        variant="tonal">
      </v-btn>
    </template>
    <v-expand-transition>
      <AddLoco v-if="showAdd" @added="showAdd = false" class="mt-8" />
    </v-expand-transition>
  </main>
</template>