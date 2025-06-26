<script setup lang="ts">
import { ref } from 'vue'
import router from '@/router'
import type { Loco } from '@repo/modules/locos'
import { useStorage } from '@vueuse/core'
import { useLocos } from '@repo/modules/locos'
import { useRoster } from '@/roster/useRoster'
import AddLoco from '@/roster/AddLoco.vue'
import { LocoAvatar } from '@repo/ui'
import RosterListItem from '@/roster/RosterListItem.vue'
import ViewMenu from '@/core/ViewMenu.vue'
import SortMenu from '@/core/SortMenu.vue'


defineProps({
  allowAdd: {
    type: Boolean,
    default: true
  }
})

const viewAs = useStorage<string[]>('@DEJA/prefs/locos/View', ['button'])
const sortBy = useStorage<string[]>('@DEJA/prefs/locos/Sort', ['device'])
const viewOptions = [
  { title: 'Avatar', value: 'avatar' },
  { title: 'Card', value: 'card' },
  { title: 'Table', value: 'table' },
  { title: 'Raw', value: 'raw' }
]
const sortOptions = [
  { title: 'Name', value: 'name' },
  { title: 'Address', value: 'address' }
]

const emit = defineEmits(['selected'])
const { getLocos } = useLocos()
const { acquireThrottle } = useRoster()
const locos = getLocos()
const showAdd = ref(false)

async function handleThrottle(address: number) {
  await acquireThrottle(address)
  router.push({ name: 'throttle', params: { address } })
}

function sort(locos: Loco[]): Loco[] {
  console.log('sort', sortBy.value)
  return locos.sort((a, b) => {
    if (sortBy.value?.[0] === 'name') {
      return a.name.localeCompare(b.name)
    } else if (sortBy.value?.[0] === 'address') {
      return a.address - b.address
    }
    return 0
  })
}

</script>
<template>
  <v-toolbar color="blue-darken-4" :elevation="8">
    <template #prepend>
      <v-icon icon="mdi-call-split" class="text-3xl"></v-icon>
    </template>
    <v-toolbar-title class="text-3xl">Roster</v-toolbar-title>
    <v-spacer></v-spacer>
    <template #append>
      <nav class="flex gap-4">
        <ViewMenu v-model="viewAs" :view-options="viewOptions" />
        <SortMenu v-model="sortBy" :sortOptions="sortOptions" />
      </nav>
    </template>
    <template #extension>
        <v-chip-group class="p-4"
          color="purple-darken-4" 
          column
          multiple
          v-model="selectedDevices"
        >
          <v-chip 
            v-for="device in selectedDevices" 
            filter
            :key="device"
            :text="device" 
            :value="device" 
            prepend-icon="mdi-memory"
            closable
            color="pink" 
            size="small"
            variant="elevated"
          />
        </v-chip-group>
        <v-spacer></v-spacer>
        <v-chip-group class="p-4"
          base-color="blue"
          column
        >
          <v-chip
            :text="viewAs?.join(', ') || 'View as...'"
            color="blue"
            prepend-icon="mdi-eye"            
            size="small"
            variant="elevated"
          />
          <v-chip
            :text="sortBy?.join(', ') || 'Sort by...'"
            color="green"
            prepend-icon="mdi-sort"
            size="small"
            variant="elevated"
          />
        </v-chip-group>
    </template>
  </v-toolbar>
  <main>
    <!-- <RosterViewMenu /> -->
    <v-spacer class="my-4"></v-spacer>
    <template v-if="viewAs.includes('avatar')">
      <div class="flex flex-wrap gap-2 sm:gap-4 md:gap-10">
        <LocoAvatar
          v-for="loco in locos" 
          :key="loco.address" 
          :loco="loco as Loco"
          @select="handleThrottle"
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
    <template v-else-if="viewAs.includes('card')">
      <div class="grid grid-cols-2 @[960px]:grid-cols-3 xlg:grid-cols-4 gap-2 w-full p-4">
        <RosterListItem v-for="loco in sort(locos)" :key="((loco as unknown) as Loco).address" :loco="(loco as unknown) as Loco" @selected="handleThrottle" />
      </div>
      <v-btn v-if="allowAdd"
        @click="showAdd = !showAdd" 
        color="pink"
        prepend-icon="mdi-plus"
        role="link"
        text="Add New Locomotive"
        variant="tonal">
      </v-btn>
    </template>
    <template v-else-if="viewAs.includes('table')">
      <v-data-table
        :headers="[
          { text: 'Name', value: 'name' },
          { text: 'Address', value: 'address' },
          { text: 'Device', value: 'device' },
          { text: 'Actions', value: 'actions', sortable: false }
        ]"
        :items="sort(locos)"
        item-value="address"
        class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn @click="handleThrottle(item.address)" color="primary" variant="text">Select</v-btn>
        </template>
      </v-data-table>
      <v-btn v-if="allowAdd"
        @click="showAdd = !showAdd" 
        color="pink"
        prepend-icon="mdi-plus"
        role="link"
        text="Add New Locomotive"
        variant="tonal">
      </v-btn>
    </template>
    <template v-else-if="viewAs.includes('raw')">
      <pre class="p-4">
{{ locos }}
      </pre>
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