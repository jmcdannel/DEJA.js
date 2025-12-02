<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { computed } from 'vue'
import type { MenuItem } from './types'

const props = defineProps<{
  drawer: boolean,
  menu?: MenuItem[]
}>();

const emit = defineEmits<{
  (e: 'update:drawer', value: boolean): void
  (e: 'handleMenu', item: MenuItem): void
}>()

const boundDrawer = computed({
  get: () => props.drawer,
  set: (val: boolean) => emit('update:drawer', val)
})

const { mobile } = useDisplay()

function onHandleMenu(item: MenuItem) {
  emit('handleMenu', item)
}

const DEJA_SUITE_MENU = [
  {
    label: 'Cloud',
    icon: 'mdi-cloud',
    name: 'cloud',
    color: 'pink',
    href: 'https://cloud.dejajs.com/'
  },
  {
    label: 'Throttle',
    icon: 'mdi-gamepad-variant',
    name: 'throttle',
    color: 'green',
    href: 'https://throttle.dejajs.com/'
  },
  {
    label: 'Monitor',
    icon: 'mdi-monitor',
    name: 'monitor',
    color: 'red',
    href: 'http://localhost:4014/'
  },
  {
    label: 'Tour',
    icon: 'mdi-account-tie-hat',
    name: 'tour',
    color: 'purple',
    href: 'https://www.dejajs.com/'
  },
  {
    label: 'Deja.js',
    icon: 'mdi-chip',
    name: 'deja.js',
    color: 'cyan',
    href: 'https://www.dejajs.com/'
  }
]

</script>
<template>
  <v-navigation-drawer v-model="boundDrawer" :mobile="mobile" mobile-breakpoint="md">
    <v-list>
        <v-list-item v-for="item in menu" 
        :key="item.label" 
        :title="item.label"
        :color="item.color || 'primary'"
        :active="$router.currentRoute.value.name === item.name"
        @click="onHandleMenu(item)"
        link
        >
        <template #prepend>
            <v-icon size="24" :class="`text-${item.color}-500 dark:text-${item.color}-400`"
            class="stroke-none" >{{item.icon}}</v-icon>
        </template>
        </v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-list-item v-for="item in DEJA_SUITE_MENU" 
            :key="item.label" 
            :title="item.label"
            :base-color="item.color || 'primary'"
            :href="item.href"
            :prepend-icon="item.icon"
            link
        >
        </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>