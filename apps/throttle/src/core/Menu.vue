<script setup lang="ts">
import { useRouter, } from 'vue-router'
import { computed } from 'vue'

interface MenuItem {
  color: string;
  icon: string;
  label: string;
}

const props = defineProps<{
  drawer: boolean
}>();

const emit = defineEmits<{
  (e: 'update:drawer', value: boolean): void
}>()

const boundDrawer = computed({
  get: () => props.drawer,
  set: (val: boolean) => emit('update:drawer', val)
})

const menuConfig: MenuItem[] = [
  {
  label: 'Layouts',
  icon: 'mdi-grid',
  color: 'indigo',
  name: 'home',
  },
  {
  label: 'Locos',
  icon: 'mdi-train',
  color: 'pink',
  name: 'roster',
  },
  {
  label: 'Throttles',
  icon: 'mdi-gamepad-variant',
  color: 'green',
  name: 'throttle-list',
  },
  {
  label: 'Effects',
  icon: 'mdi-rocket',
  color: 'purple',
  name: 'effects',
  },
  {
  label: "Conductor",
  icon: 'mdi-account-tie-hat',
  color: 'red',
  name: 'conductor',
  },
  {
  label: "Routes",
  icon: 'mdi-map',
  color: 'teal',
  name: 'routes',
  },
  {
  label: "Turnouts",
  icon: 'mdi-call-split',
  color: 'blue',
  name: 'turnouts',
  },
  {
  label: "Signals",
  icon: 'mdi-traffic-light',
  color: 'blue',
  name: 'signals',
  }
]

const router = useRouter()

function handleMenu(item:MenuItem) {
  router.push({ name: item.name })
}

</script>
<template>
  <v-navigation-drawer v-model="boundDrawer" :mobile="mobile" mobile-breakpoint="md">
    <v-list>
        <v-list-item v-for="item in menuConfig" 
        :key="item.label" 
        :title="item.label"
        :color="item.color || 'primary'"
        :active="router.currentRoute.value.name === item.label"
        @click="handleMenu(item)"
        link
        >
        <template #prepend>
            <v-icon size="24" :class="`text-${item.color}-500 dark:text-${item.color}-400`"
            class="stroke-none" >{{item.icon}}</v-icon>
        </template>
        </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>