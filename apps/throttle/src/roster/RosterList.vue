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
import { ListMenu } from '@repo/ui'


defineProps({
  allowAdd: {
    type: Boolean,
    default: true
  }
})

const viewAs = useStorage<string[]>('@DEJA/prefs/locos/View', ['button'])

const viewOptions = [
  { title: 'Avatar', value: 'avatar' },
  { title: 'Card', value: 'card' },
  { title: 'Table', value: 'table' },
  { title: 'Raw', value: 'raw' }
]
const sortOptions = [
  { title: 'Default', value: 'order' },
  { title: 'Name', value: 'name' },
  { title: 'Address', value: 'address' }
]
const disabledMenus = ['filter']

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
  <v-toolbar color="blue-darken-4" :elevation="8">
    <template #prepend>
      <v-icon icon="mdi-train" class="text-xl md:text-3xl"></v-icon>
    </template>
    <template #append>
      <ListMenu :disabled-menus="disabledMenus" :module-name="'locos'" :sort-options="sortOptions" :view-options="viewOptions" />
    </template>
    <v-toolbar-title class="text-xl md:text-3xl">Roster</v-toolbar-title>
  </v-toolbar>
  <main>
    <v-spacer class="my-4"></v-spacer>
    <!--
    VIEW: Avatar
    -->
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
    <!--
    VIEW: Card
    -->
    <template v-else-if="viewAs.includes('card')">
      <div class="grid grid-cols-2 @[960px]:grid-cols-3 xlg:grid-cols-4 gap-2 w-full p-4">
        <RosterListItem v-for="loco in locos" :key="((loco as unknown) as Loco).address" :loco="(loco as unknown) as Loco" @selected="handleThrottle" />
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
    <!--
    VIEW: Table
    -->
    <template v-else-if="viewAs.includes('table')">
      <v-data-table
        :headers="[
          { text: 'Name', value: 'name' },
          { text: 'Address', value: 'address' },
          { text: 'Device', value: 'device' },
          { text: 'Actions', value: 'actions', sortable: false }
        ]"
        :items="locos"
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
    <!--
    VIEW: Raw
    -->
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