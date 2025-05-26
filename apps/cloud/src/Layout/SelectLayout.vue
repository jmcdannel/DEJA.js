<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLayout } from '@repo/modules/layouts'
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
  console.log('handleLayoutSelect', newLayout.value, newLayout)
  emit('selected', newLayout)
}

</script>
<template>
  <v-card title="Select Layout" color="orange" variant="tonal">
    <v-card-text>
      <v-btn v-for="layout in layouts" :key="layout.layoutId"
       variant="outlined" 
       color="primary" 
       class="m-1"
       @click="handleLayoutSelect(layout.layoutId)">
       <template #append>
        <v-chip size="small" variant="outlined" class="m-1">{{  layout.layoutId }}</v-chip>
       </template>
       {{  layout.name }}
      </v-btn>
    </v-card-text>
  </v-card>
</template>