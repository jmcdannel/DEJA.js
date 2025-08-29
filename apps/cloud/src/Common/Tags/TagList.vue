<script setup lang="ts">
import { ref } from 'vue'
import type { Tag } from '@repo/modules'
import { useLayout } from '@repo/modules'
import TagCmp from './Tag.vue'

const model = defineModel()
defineEmits(['select'])

const { getLayout } = useLayout()
const layout = getLayout()
const selectedTags = ref<Tag[]>(Array.isArray(model.value) ? model.value : [])

</script>
<template>
  <v-chip-group 
    v-if="layout" 
    v-model="selectedTags" 
    color="yellow"
    column
    multiple>
    <TagCmp 
      v-for="tag in layout?.tags" 
      :key="tag.id" 
      :tag="tag" 
      class="mr-2" 
      @click="$emit('select', tag)"
    />
    <slot name="append"></slot>
  </v-chip-group>
</template>