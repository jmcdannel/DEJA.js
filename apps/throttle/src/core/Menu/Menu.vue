<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { computed } from 'vue'
import { useMenu } from './useMenu'

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

const { handleMenu, menuConfig } = useMenu()

const { mobile } = useDisplay()

</script>
<template>
  <v-navigation-drawer v-model="boundDrawer" :mobile="mobile" mobile-breakpoint="md">
    <v-list>
        <v-list-item v-for="item in menuConfig" 
        :key="item.label" 
        :title="item.label"
        :color="item.color || 'primary'"
        :active="$router.currentRoute.value.name === item.name"
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