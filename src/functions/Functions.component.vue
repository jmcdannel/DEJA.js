<script setup lang="ts">
  import { ref, computed, type PropType } from 'vue'
  import { storeToRefs } from 'pinia'
  import { db } from '@/firebase'
  import { collection, doc } from 'firebase/firestore'
  import { useDocument } from 'vuefire'
  import { computedWithControl } from '@vueuse/core'
  import { 
    IoIosCog,
  } from 'vue3-icons/io'
  import { RiTrainWifiFill, RiMoreFill } from 'vue3-icons/ri'
  import Function from './Function.component.vue'
  import FunctionSettings from './FunctionSettings.component.vue'
  import FunctionList from './FunctionList.vue'
  import type { Loco, LocoFunction } from '@/throttle/types'
  import { useDejaCloud } from '@/deja-cloud/useDejaCloud'
  import { useConnectionStore } from '@/connections/connectionStore'
  import { defaultFunctions } from '@/functions/useFunctions'

  const props = defineProps({
    loco: {
      type: Object as PropType<Loco>,
      required: true
    }
  })
  const emit = defineEmits(['saveLoco'])

  defineExpose({
    openAll: () => listRef?.value?.showModal(),
    openSettings: () => settingsRef?.value?.showModal()
  })

  const { updateFunctions } = useDejaCloud()
  const { layoutId } = storeToRefs(useConnectionStore())
  const settingsRef = ref<HTMLDialogElement | null>(null)
  const listRef = ref<HTMLDialogElement | null>(null)
  const availableFunctions = computedWithControl(
    () => props?.loco.functions,  
    () => filterUsedFunctions(props.loco.functions || [])
  )
  
  function filterUsedFunctions(locoFunctions: LocoFunction[]) {
    const MAX_DEFAULT = 32
    console.log('filterUsedFunctions', locoFunctions, defaultFunctions)
    const result = defaultFunctions
      .filter((f) => locoFunctions.map((lf: LocoFunction) => lf.id).includes(f.id))
      .filter((f, idx) => idx < (MAX_DEFAULT - locoFunctions.length))
    console.log('filterUsedFunctions', result)
    defaultFunctions.forEach((f, idx) => {
      if (idx <  MAX_DEFAULT && !result.map((r) => r.id).includes(f.id)) {
        result.push(f)
      }
    })
    return result
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

  function getRoundedClasses(idx: number) {
    return ''
    // const locoFunctions = props.loco.functions || []
    // const isLastRow = (availableFunctions.value.length + locoFunctions.length - idx <= 2)
    // // console.log('getRoundedClasses', idx, idx % 3, isLastRow, availableFunctions.value.length, locoFunctions.length)
    // if (idx === 0) {
    //   return 'md:rounded-r-none md:rounded-b-none' // top left
    // } else if (idx === 2) {
    //   return 'md:rounded-b-none md:rounded-l-none' // top right
    // } else if (isLastRow && idx % 3 === 0 ) {
    //   return 'md:rounded-t-none md:rounded-r-none' // bottom left
    // } else if (isLastRow && idx % 3 === 2) {
    //   return 'md:rounded-t-none md:rounded-l-none' // bottom right
    // } else {
    //   return 'md:rounded-none'
    // }
  }

  function openSettings() {
    settingsRef?.value?.showModal()
  }

  function openAllFunctions() {
    listRef?.value?.showModal()
  }

</script>
<template>
  <template v-if="loco">
    <section class="flex flex-col flex-grow  overflow-auto">
      <!-- <pre>{{ functions }}</pre> -->
      <ul class="flex flex-wrap justify-center mx-2 items-center max-w-48 sm:max-w-48 md:max-w-48">
        <li v-for="(locoFunc, locoIdx) in loco.functions" :key="locoFunc.id" class="basis-1/2 sm:basis-1/2 md:basis-1/3">
          <!-- <pre>{{ locoFunc }}</pre> -->
          <Function :func="locoFunc" :address="loco.locoId" class="w-full" :class="getRoundedClasses(locoIdx)" />
        </li>
        <li class="basis-1/2 md:basis-1/3">
          <button @click="openAllFunctions()" :class="getRoundedClasses(8)"
            class="relative btn btn-md bg-gradient-to-br from-cyan-600 to-indigo-600 w-full p-2">
            <RiMoreFill class="w-4 h-4 md:w-6 md:h-6" />
          </button>  
        </li>
        <li v-for="(locoFunc, locoIdx) in availableFunctions" :key="locoFunc.id" class="basis-1/2 sm:basis-1/2 md:basis-1/3">
          <Function :func="locoFunc" :address="loco.locoId" class="w-full" :class="getRoundedClasses(locoIdx + loco?.functions?.length)" />
        </li>
      </ul>
      <!-- <div class="flex justify-center">
        <button @click="openSettings" class="px-8 rounded-b-lg py-1 bg-gradient-to-br from-indigo-500 to-blue-800"><IoIosCog w-4 h-4 /></button>
      </div> -->
    </section>
    <FunctionList
      ref="listRef"
      :loco="loco"
    />
    <!-- <button @click="openAllFunctions" class="sm:hidden rounded-lg p-4 bg-gradient-to-br from-indigo-500 to-blue-800"><RiTrainWifiFill class="w-8 h-8" /></button> -->
    <FunctionSettings 
      ref="settingsRef" 
      :loco="loco" 
      @save-functions="handleUpdateFunctions" 
    />
  </template>
</template>