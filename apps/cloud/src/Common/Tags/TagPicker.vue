<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Tag } from '@repo/modules'
import { useLayout } from '@repo/modules'
import TagCmp from './Tag.vue'

const model = defineModel()

const { getTags } = useLayout()
const layoutTags = ref<Tag[]>([])

onMounted(async () => {
  layoutTags.value = await getTags()
})

</script>
<template>
  <v-chip-group v-model="model" multiple>
    <TagCmp 
      v-for="tag in layoutTags" 
      :key="tag.id" 
      :tag="tag" 
      class="mr-2" 
    />
  </v-chip-group>
</template>