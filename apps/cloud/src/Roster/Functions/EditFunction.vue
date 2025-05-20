<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFunctionIcon } from '@/Roster/Functions/useFunctionIcon'
const emit = defineEmits(['edit'])
const props = defineProps({
  defaultFunction: Object,
  locoFunction: Object
})

const func = ref({ ...props.defaultFunction, ...props.locoFunction })
const customLabel = ref(func.value?.label)
const isFav = ref(func.value?.isFavorite)
const customIcon = ref(func.value?.icon)
const showPresets = ref(false)

const { getIconComponent, getAllIcons, DEFAULT_ICON } = useFunctionIcon()

const allIcons = computed(() => getAllIcons())

const iconCmp = computed(() => customIcon.value ? getIconComponent(customIcon.value)
  : DEFAULT_ICON)

watch(isFav, (value) => {
  func.value.isFavorite = value
  emit('edit', func.value)
})

watch(customLabel, (value) => {
  func.value.label = value
  emit('edit', func.value)
})

watch(customIcon, (value) => {
  func.value.icon = value
  emit('edit', func.value)
})

</script>
<template>
  <v-sheet class="my-4">
    <div class="flex justify-between items-center">
      <v-btn 
        class="m-2" 
        :icon="isFav ? 'mdi-eye' : 'mdi-eye-off'" 
        :color="isFav ? 'yellow' : 'gray'" 
        variant="tonal" 
        size="small"
        @click="isFav =!isFav"
      >
      </v-btn>
      <v-btn
        class="m-2"
        variant="tonal"
        color="pink"
        size="large"
        @click="showPresets = !showPresets"
        >
        <component :is="iconCmp" class="mr-2 stroke-none w-8 h-8"></component>
      </v-btn>
      <v-btn 
        class="m-2" 
        icon="mdi-play" 
        color="pink"
        variant="tonal" 
        size="large"
      >
      </v-btn>
      {{  func?.label }}
      <v-text-field
        v-model="customLabel"
        label="Label"
        variant="outlined"
        density="compact"
        class="flex-inline m-2"
        hide-details
      ></v-text-field>
      <v-spacer></v-spacer>
      <pre class="text-xs">{{ JSON.stringify(func) }}</pre>
    </div>
    <v-sheet v-if="showPresets">
      <v-btn v-for="icon in allIcons" :key="icon" 
        class="m-2" color="pink-darken-3" 
        :variant="customIcon === icon.name ? 'elevated' : 'tonal'"
        @click="customIcon = icon.name"
        >
        <component :is="icon?.icon" class="mr-2"></component>
        {{ icon.name }}
      </v-btn>
    </v-sheet>

    <!-- <v-sheet class="flex">
      <v-btn @click="$emit('cancel')" class="m-2" color="rose" variant="tonal">
        Cancel
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn class="m-2" color="pink" @click="handleSave">
        <v-icon>mdi-content-save</v-icon>
        Save
      </v-btn>
    </v-sheet> -->
  </v-sheet>
  
  <v-divider class="my-4"></v-divider>
</template>