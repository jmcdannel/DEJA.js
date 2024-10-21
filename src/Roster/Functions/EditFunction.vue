<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocos } from '@/Roster/useLocos'
import { useFunctionIcon } from '@/Roster/Functions/useFunctionIcon'
import { BsMenuButtonWideFill } from 'vue3-icons/bs';

const emit = defineEmits(['cancel'])
const props = defineProps({
  loco: Object,
  func: Object,
  config: Object
})

const customLabel = ref(props.func?.label)
const isFav = ref(!!props.func?.isFavorite)
const customIcon = ref(props.func?.icon)

const {  updateFunctions } = useLocos()
const { getIconComponent, getAllIcons } = useFunctionIcon()

const allIcons = computed(() => getAllIcons())

const iconCmp = computed(() => customIcon.value ? getIconComponent(customIcon.value)
  : null)

async function handleSave() {
  console.log('handleSave', props.config.id, !!isFav.value, customLabel.value, customIcon.value)
  const existing = props.loco?.functions?.find(f => f.id === props.config.id)
  const newFunc = {
    isFavorite: isFav.value,
    label: customLabel.value,
    icon: customIcon.value
  }
  let newFunctions = existing 
    ? (props.loco?.functions || []).map(f => {
        if (f.id === props.config.id) {
          return {
            ...f,
            ...newFunc
          }
        }
        return f
      })
    : [...(props.loco?.functions || []), { ...props.config, ...existing, ...newFunc }]
  
  
  console.log('handleSave', newFunctions, newFunc, existing)
  await updateFunctions(props.loco.id, newFunctions)
  emit('cancel')
  
}
function filterFunctions(f: LocoFunction) {
  return (f.label.trim() !== '' && f.label !== `F${f.id}`) || f.isFavorite || !!f.icon
}

function handleUpdateFunctions(functions: LocoFunction[]) {
  console.log('handleUpdateFunctions', functions.filter(filterFunctions))
  if (props?.loco?.id) {
    updateFunctions(props.loco.id, functions.filter(filterFunctions))      
    // availableFunctions.value = getAvailableFunctions()
    emit('saveLoco', props.loco)
  }
}

</script>
<template>
  <v-sheet class="my-4">
    <div class="flex justify-between items-center">
      <v-btn 
        class="m-2" 
        :icon="isFav ? 'mdi-star' : 'mdi-star-outline'" 
        :color="isFav ? 'yellow' : 'gray'" 
        variant="tonal" 
        size="small"
        @click="isFav = !isFav"
      >
      </v-btn>
      <v-btn class="m-2" variant="tonal" color="pink" size="large">
        <component :is="iconCmp" class="mr-2"></component>
        {{  customLabel || config?.label }}
      </v-btn>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="customLabel"
        label="Label"
        variant="outlined"
        density="compact"
        class="flex-inline m-2"
        hide-details
      ></v-text-field>
    </div>
    <v-sheet>
      <v-btn v-for="icon in allIcons" :key="icon" 
        class="m-2" color="pink-darken-3" 
        :variant="customIcon === icon.name ? 'elevated' : 'tonal'"
        @click="customIcon = icon.name"
        >
        <component :is="icon?.icon" class="mr-2"></component>
        {{ icon.name }}
      </v-btn>
    </v-sheet>

    <v-sheet class="flex">
      <v-btn @click="$emit('cancel')" class="m-2" color="rose" variant="tonal">
        Cancel
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn class="m-2" color="pink" @click="handleSave">
        <v-icon>mdi-content-save</v-icon>
        Save
      </v-btn>
    </v-sheet>
  </v-sheet>
  
  <v-divider class="my-4"></v-divider>
</template>