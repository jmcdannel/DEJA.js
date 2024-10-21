<script setup lang="ts">
import { useColors } from '@/Core/UI/useColors'
import { 
  BsCloudPlusFill
} from 'vue3-icons/bs'

const props = defineProps({
  color: {
    type: String,
    default: 'gray'
  }
})

const { getColor } = useColors()

const colorDef = getColor(props.color)

</script>
<template>
  <v-sheet 
    rounded="lg"
    :class="`${colorDef.border} `"
    class="w-full h-full min-h-36 border-2 border-opacity-30 dark:border-opacity-30 hover:border-opacity-100 hover:dark:border-opacity-90 text-white mx-auto border-dashed"    
    >
    <button class="cursor-pointer w-full h-full flex items-center justify-center"
      :class="`${colorDef.text} hover:text-slate-50 hover:bg-${colorDef.value}-500 hover:dark:bg-${colorDef.value}-500`" @click="$emit('add')">
      <BsCloudPlusFill 
        class="w-16 h-16 stroke-none"/>
    </button>
  </v-sheet>
</template>