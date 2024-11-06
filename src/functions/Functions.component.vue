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
  const listRef = ref<HTMLDialogElement | null>(null)
  
  function openAllFunctions() {
    listRef?.value?.showModal()
  }

</script>
<template>
  <template v-if="loco">
    <section class="flex flex-col flex-grow justify-end overflow-auto my-8">
      <!-- <pre>{{ functions }}</pre> -->
      <ul class="flex flex-wrap justify-center mx-2 items-center max-w-48 sm:max-w-48 md:max-w-48">
        <li v-for="(locoFunc, locoIdx) in loco.functions?.filter(lf => lf.isFavorite)" :key="locoFunc.id" class=" basis-full sm:basis-1/2 md:basis-1/3">
          <!-- <pre>{{ locoFunc }}</pre> -->
          <Function :func="locoFunc" :address="loco.locoId" class="w-full" />
        </li>
        <li class=" basis-full sm:basis-1/2 md:basis-1/3">
          <button @click="openAllFunctions()"
            class="relative btn btn-md bg-gradient-to-br from-cyan-600 to-indigo-600 w-full p-2">
            <RiMoreFill class="w-4 h-4 md:w-6 md:h-6" />
          </button>  
        </li>
      </ul>
    </section>
    <FunctionList
      ref="listRef"
      :loco="loco"
    />
  </template>
</template>