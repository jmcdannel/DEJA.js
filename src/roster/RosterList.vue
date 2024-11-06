<script setup lang="ts">
import { ref } from 'vue'
import RosterViewMenu from '@/throttle/RosterViewMenu.vue'
import router from '@/router'
import { useLocos } from '@/api/useLocos'
import { useThrottle } from '@/throttle/useThrottle'
import { useStorage } from '@vueuse/core'
import AddLoco from '@/roster/AddLoco.vue'
import RosterGridItem from '@/roster/RosterGridItem.vue'
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
const { getLocos, createLoco } = useLocos()
const { acquireThrottle } = useThrottle()
const address = ref(null)
const name = ref(null)
const locos = getLocos()
const showAdd = ref(false)

</script>
<template>
   <main class="py-4">
    <article class="">
      <RosterViewMenu />
      <v-spacer class="my-4"></v-spacer>
      <template v-if="viewAs == 'grid'">
        <RosterGridItem v-for="loco in locos" :key="loco.locoId" :loco="loco" @selected="handleThrottle" />
        <button 
          v-if="allowAdd"
          class="m-2"
          @click="showAdd = !showAdd" 
          role="link"><v-avatar color="pink" :size="96" class="mr-2"><v-icon icon="mdi-plus"></v-icon></v-avatar>
        </button>
      </template>
      <template v-else>
        <RosterListItem v-for="loco in locos" :key="loco.locoId" :loco="loco" @selected="handleThrottle" />
        <button 
          v-if="allowAdd"
          class="
            btn 
            btn-md 
            btn-outline 
            flex
            justify-between
            bg-indigo-950 
            bg-opacity-30 
            border-primary 
            text-primary 
            w-full 
            my-1
            hover:bg-indigo-950 
            hover:border-cyan-900
            hover:bg-opacity-60 
            hover:text-primary 
          "
          @click="showAdd = !showAdd" 
          role="link">          
          <span><v-avatar color="pink" :size="24" class="mr-2"><v-icon icon="mdi-plus"></v-icon></v-avatar>
            Add New Locomotive
          </span>
        </button>
      </template>
    </article>
    <v-expand-transition>
      <AddLoco v-if="showAdd" @added="showAdd = false" />
    </v-expand-transition>
  </main>
</template>