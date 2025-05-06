<script setup lang="ts">
import { ref } from 'vue'
import type { Loco } from '@/throttle/types'
import RosterViewMenu from '@/throttle/RosterViewMenu.vue'
import router from '@/router'
import { useLocos } from '@/api/useLocos'
import { useThrottle } from '@/throttle/useThrottle'
import { useStorage } from '@vueuse/core'
import AddLoco from '@/roster/AddLoco.vue'
import LocoAvatar from '@/core/LocoAvatar/LocoAvatar.vue'
import RosterListItem from '@/roster/RosterListItem.vue'

const viewAs = useStorage('@DEJA/prefs/rosterView', 'Array')

defineProps({
  allowAdd: {
    type: Boolean,
    default: true
  }
})

async function handleThrottle(address: number) {
  const throttle = await acquireThrottle(address)
  router.push({ name: 'cloud-throttle', params: { address } })
}

const emit = defineEmits(['selected'])
const { getLocos } = useLocos()
const { acquireThrottle } = useThrottle()
const locos = getLocos()
const showAdd = ref(false)

</script>
<template>
   <main class="py-4">
    <RosterViewMenu />
    <v-spacer class="my-4"></v-spacer>
    <template v-if="viewAs == 'grid'">
      <div class="flex flex-wrap gap-2 sm:gap-4 md:gap-10">
        <LocoAvatar
          v-for="loco in locos" 
          :key="loco.locoId" 
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
      <RosterListItem v-for="loco in locos" :key="loco.locoId" :loco="loco" @selected="handleThrottle" />
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
      <AddLoco v-if="showAdd" @added="showAdd = false" />
    </v-expand-transition>
  </main>
</template>