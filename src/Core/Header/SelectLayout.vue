<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLayout } from '@/Layout/useLayout'
import ViewJson from '@/Core/UI/ViewJson.vue'

const { getLayouts, getLayout } = useLayout()
const emit = defineEmits(['selected', 'clear'])

const props = defineProps({
  layoutId: String
})


const layouts = getLayouts()
// const
const selectedLayout = getLayout(props.layoutId)
const newLayoutID = ref(props.layoutId)


// const newLayoutID = computed(() => layouts.value?.find(o => o.value === props.layoutId))

console.log('layouts', layouts, newLayoutID)
async function handleLayoutSelect(newLayout) {
  console.log('handleLayoutSelect', newLayout.layoutId, newLayout)
  emit('selected', newLayout.layoutId)
}
</script>
<template>
  <!-- <ViewJson :json="layouts" label="Layouts"></ViewJson>
  <pre>selectedLayout: {{ selectedLayout }}</pre>
  <pre>newLayoutID:{{ newLayoutID }}</pre>
  <pre>layoutId:{{ layoutId }}</pre> -->
  <!-- <template v-if="layouts">
    <v-combobox
      auto-select-first="exact"
      :model-value="selectedLayout?.name"
      :items="layouts"
      item-title="name"
      item-value="layoutId"
      variant="solo"
      color="purple-lighten-4"
      bg-color="deep-purple-darken-4"
      density="compact"
      hide-details
      clearable
      @update:model-value="handleLayoutSelect">
    </v-combobox>
  </template> -->
  
</template>