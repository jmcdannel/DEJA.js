<script setup lang="ts">
import { computed } from 'vue'
import { useFunctionIcon } from '@/Roster/Functions/useFunctionIcon'

const emit = defineEmits(['edit', 'update'])
const props = defineProps({
  func: Object,
  config: Object,
  editMode: {
    type: Boolean,
    default: false
  }
})

const { getIconComponent } = useFunctionIcon()

const iconCmp = computed(() => props?.func?.icon ? getIconComponent(props.func.icon)
  : null)

function runFunc(id) {
  console.log('runFunc', id)
}

function handleEdit() {
  console.log('handleEdit')
  props.editMode
    ? emit('edit', props.config.id)
    : runFunc(props.config.id)
}

</script>
<template>
    <v-badge v-if="func?.isFavorite" color="yellow" icon="mdi-star">
      <v-btn @click="handleEdit" class="m-1" variant="tonal" color="pink" size="large">
        <component :is="iconCmp" class="mr-2"></component>
        {{  func?.label || config?.label }}
        <v-icon v-if="editMode" @click="$emit('edit')" class="ml-2" icon="mdi-pencil"></v-icon>
      </v-btn>
    </v-badge>
    <v-btn v-else @click="handleEdit" class="m-1" variant="tonal" color="pink" size="large">
      <component :is="iconCmp" class="mr-2"></component>
      {{  func?.label || config?.label }}
      <v-icon v-if="editMode" @click="$emit('edit')" class="ml-2" icon="mdi-pencil"></v-icon>
    </v-btn>
</template>