<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ITag } from '@/Common/Tags/types'
import { useLayout } from '@/Layout/useLayout'

const model = defineModel()
const props = defineProps<{
  tags: string[]
}>()

const { getTagsByIds, getLayout } = useLayout()
const layout = getLayout()
const tags = ref<ITag[]>([])
const selectedTags = ref<ITag[]>(Array.isArray(model.value) ? model.value : [])

onMounted(async () => {
  if (props.tags) {
    const _tags = await getTagsByIds(props.tags) || []
    tags.value = _tags
  }
})

</script>
<template>
  <v-chip-group v-if="layout" v-model="selectedTags" multiple>
    <v-chip v-for="tag in layout?.tags" :key="tag.id" :value="tag.id" color="yellow" class="mr-2">
      {{ tag.name }}
    </v-chip>
  </v-chip-group>
</template>