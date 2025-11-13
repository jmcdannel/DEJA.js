<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFunctionIcon, type LocoFunction } from '@repo/modules/locos'
import LcdDisplay from '@/Core/UI/LcdDisplay.vue'
const emit = defineEmits(['edit'])
const props = defineProps({
  defaultFunction: Object,
  locoFunction: Object
})

const func = ref<LocoFunction>({
  ...({ isMomentary: false } as Partial<LocoFunction>),
  ...props.defaultFunction,
  ...props.locoFunction,
} as LocoFunction)
const customLabel = ref(func.value?.label)
const isFav = ref(func.value?.isFavorite)
const customIcon = ref(func.value?.icon)
const isMomentary = ref(func.value?.isMomentary ?? false)
const showPresets = ref(false)

const { getIconComponent, getAllIcons, DEFAULT_ICON } = useFunctionIcon()

const allIcons = computed(() => getAllIcons())

const iconCmp = computed(() =>
  customIcon.value ? getIconComponent(customIcon.value) : DEFAULT_ICON
)

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

watch(isMomentary, (value) => {
  func.value.isMomentary = value
  emit('edit', func.value)
})

</script>
<template>
  <v-sheet class="flex justify-between items-center gap-2 bg-transparent">
    <v-btn 
      :icon="isFav ? 'mdi-eye' : 'mdi-eye-off'" 
      :color="isFav ? 'yellow' : 'gray'" 
      variant="tonal" 
      size="small"
      @click="isFav =!isFav"
    >
    </v-btn>
    <v-btn 
      icon="mdi-play" 
      color="pink"
      variant="tonal" 
      size="large"
    >
    </v-btn>
    <v-dialog v-model="showPresets" max-width="600">
      <template #activator="{ props: activatorProps }">            
        <v-btn
          v-bind="activatorProps"
          variant="tonal"
          color="pink"
          size="large"
          >
          <v-icon size="24" class="mr-2 stroke-none">{{ iconCmp }}</v-icon>
        </v-btn>
      </template>
      <v-card class="p-4 max-h-[80vh] max-w-[50rem] overflow-y-auto">
        <v-card-body class="grid grid-cols-3 md:grid-cols-4 gap-4">
          <v-btn v-for="icon in allIcons" :key="icon.name"
            class="m-2" color="pink-darken-3"
            :variant="customIcon === icon.name ? 'elevated' : 'tonal'"
            @click="customIcon = icon.name, showPresets = false"
          >
            <v-icon size="24" class="mr-2 stroke-none">{{ icon.icon }}</v-icon>
            {{ icon.name }}
          </v-btn>
        </v-card-body>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="pink" variant="outlined" @click="showPresets = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> 
    <v-text-field
      v-model="customLabel"
      label="Label"
      variant="outlined"
      density="compact"
      class="flex-inline w-20"
      hide-details
    ></v-text-field>
    <v-switch
      v-model="isMomentary"
      inset
      color="pink"
      hide-details
      class="min-w-[7rem]"
      label="Momentary"
    ></v-switch>
    <v-spacer></v-spacer>
    <v-label class="mr-2">{{  func?.label }}</v-label>

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
  
  <v-divider class="my-2"></v-divider>
</template>