<script setup lang="ts">
import { computed } from 'vue'
import { type Turnout } from '@repo/modules'
import ItemSwitch from '../ModuleList/ItemSwitch.vue'

interface Props {
  turnout: Turnout
  isRunning: boolean
}

const props = defineProps<Props>()
const state = defineModel('state', { type: Boolean })

const item = computed(() => ({
  ...props.turnout,
  icon: props.turnout?.type === 'servo' ? 'mdi-call-split' : 'mdi-electric-switch',
}))
</script>

<template>
  <ItemSwitch :item="item" :is-running="isRunning" v-model:state="state" />
</template>
