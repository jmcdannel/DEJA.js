<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ITag } from '@/Common/Tags/types'
import { useLayout } from '@/Layout/useLayout'
import Tag from './Tag.vue'

const model = defineModel()

const { getTags } = useLayout()
const layoutTags = ref<ITag[]>([])

onMounted(async () => {
  layoutTags.value = await getTags()
})

</script>
<template>
  <v-chip-group v-model="model" multiple>
    <Tag 
      v-for="tag in layoutTags" 
      :key="tag.id" 
      :tag="tag" 
      class="mr-2" 
    />
  </v-chip-group>
</template>