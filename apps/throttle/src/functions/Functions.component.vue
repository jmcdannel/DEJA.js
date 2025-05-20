<script setup lang="ts">
  import { defineEmits, defineProps, ref } from 'vue'
  import { 
    IoIosCog,
  } from 'vue3-icons/io'
  import Function from './Function.component.vue'
  import FunctionSettings from './FunctionSettings.component.vue'
  import type { Loco, LocoFunction } from '@/throttle/types'

  const props = defineProps<{
    loco: Object
  }>()

  const emit = defineEmits(['saveLoco'])

  const settingsRef = ref<HTMLDialogElement | null>(null)
  const loco = ref<Loco | null>(props.loco as Loco)

  const functions = [
    { id: 0, label: 'F0' },
    { id: 1, label: 'F1' },
    { id: 2, label: 'F2' },
    { id: 3, label: 'F3' },
    { id: 4, label: 'F4' },
    { id: 5, label: 'F5' },
    { id: 6, label: 'F6' },
    { id: 7, label: 'F7' },
    { id: 8, label: 'F8' },
    { id: 9, label: 'F9' },
    { id: 10, label: 'F10' },
    { id: 11, label: 'F11' },
    { id: 12, label: 'F12' },
    { id: 13, label: 'F13' },
    { id: 14, label: 'F14' },
    { id: 15, label: 'F15' },
    { id: 16, label: 'F16' },
    { id: 17, label: 'F17' },
    { id: 18, label: 'F18' },
    { id: 19, label: 'F19' },
    { id: 20, label: 'F20' },
    { id: 21, label: 'F21' },
    { id: 22, label: 'F22' },
    { id: 23, label: 'F23' },
    { id: 24, label: 'F24' },
    { id: 25, label: 'F25' },
    { id: 26, label: 'F26' },
    { id: 27, label: 'F27' },
    { id: 28, label: 'F28' },
    { id: 29, label: 'F29' },
    { id: 30, label: 'F30' },
    { id: 31, label: 'F31' }
  ] as LocoFunction[]

  const locoFunctions = ref<LocoFunction[]>(loco.value?.functions.filter(f => f.isFavorite) || [])

  const availableFunctions = functions
    .filter((f) => !locoFunctions.value.map(lf => lf.id).includes(f.id))
    .filter((f, idx) => idx < (9 - locoFunctions.value.length))

  function filterFunctions(f: LocoFunction) {
    return (f.label.trim() !== '' && f.label !== `F${f.id}`) || f.isFavorite
  }

  function handleUpdateFunctions(functions: LocoFunction[]) {
    console.log('handleUpdateFunctions', functions.filter(filterFunctions))
    if (loco.value) {
      loco.value.functions = functions.filter(filterFunctions)
      emit('saveLoco', loco.value)
    }
  }

  function getRoundedClasses(idx: number) {
    const isLastRow = (availableFunctions.length + locoFunctions.value.length - idx <= 3)
    // console.log('getRoundedClasses', idx, idx % 3, isLastRow, availableFunctions.length, locoFunctions.value.length)
    if (idx === 0) {
      return 'rounded-r-none rounded-b-none' // top left
    } else if (idx === 2) {
      return 'rounded-b-none rounded-l-none' // top right
    } else if (isLastRow && idx % 3 === 0 ) {
      return 'rounded-t-none rounded-r-none' // bottom left
    } else if (isLastRow && idx % 3 === 2) {
      return 'rounded-t-none rounded-l-none' // bottom right
    } else {
      return 'rounded-none'
    }
  }

  function openSettings() {
    settingsRef?.value?.showModal()
  }

</script>
<template>
  <section>
    <ul class="flex flex-wrap justify-center items-center" v-if="loco">
      <li v-for="(locoFunc, locoIdx) in locoFunctions" :key="locoFunc.id" class="basis-1/3">
        <Function :func="locoFunc" :address="loco.address" :class="getRoundedClasses(locoIdx)" />
      </li>
      <li v-for="(locoFunc, locoIdx) in availableFunctions" :key="locoFunc.id" class="basis-1/3">
        <Function :func="locoFunc" :address="loco.address" :class="getRoundedClasses(locoIdx + locoFunctions.length)" />
      </li>
    </ul>
    <div class="flex justify-center">
      <button @click="openSettings" class="px-8 rounded-b-lg py-1 bg-gradient-to-br from-indigo-500 to-blue-800"><IoIosCog w-4 h-4 /></button>
    </div>
  </section>
  <FunctionSettings ref="settingsRef" :loco="loco" :default-functions="functions" @save-functions="handleUpdateFunctions" />
</template>