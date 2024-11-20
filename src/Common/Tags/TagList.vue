<script setup lang="ts">
import { ref } from 'vue'
import { ITag } from '@/Common/Tags/types'
import { useLayout } from '@/Layout/useLayout'
import Tag from './Tag.vue'

const model = defineModel()
defineEmits(['select'])

const { getLayout } = useLayout()
const layout = getLayout()
const selectedTags = ref<ITag[]>(Array.isArray(model.value) ? model.value : [])

</script>
<template>
  <v-chip-group 
    v-if="layout" 
    v-model="selectedTags" 
    color="yellow"
    column
    multiple>
    <Tag 
      v-for="tag in layout?.tags" 
      :key="tag.id" 
      :tag="tag" 
      class="mr-2" 
      @click="$emit('select', tag)"
    />
    <slot name="append"></slot>
  </v-chip-group>
</template>