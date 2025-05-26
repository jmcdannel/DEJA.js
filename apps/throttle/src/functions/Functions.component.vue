<script setup lang="ts">
  import { ref, type PropType } from 'vue'
  import Function from './Function.component.vue'
  import FunctionList from './FunctionList.vue'
  import type { Loco } from '@/throttle/types'

defineProps({
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

  const listRef = ref<HTMLDialogElement | null>(null)
  const settingsRef = ref<HTMLDialogElement | null>(null)
  
  function openAllFunctions() {
    listRef?.value?.showModal()
  }

</script>
<template>
  <template v-if="loco">
    <section class="flex flex-col flex-grow justify-end my-8">
      <!-- <pre>{{ functions }}</pre> -->
      <ul class="flex flex-wrap justify-center mx-2 items-center max-w-48 sm:max-w-48 md:max-w-48">
        <li v-for="(locoFunc, locoIdx) in loco.functions?.filter(lf => lf.isFavorite)" :key="locoFunc.id" class="basis-1/2 md:basis-1/3">
          <!-- <pre>{{ locoFunc }}</pre> -->
          <Function :func="locoFunc" :address="loco.locoId" class="w-full" />
        </li>
        <li class=" basis-full sm:basis-1/2 md:basis-1/3">
          <button @click="openAllFunctions()"
            class="relative btn btn-md bg-gradient-to-br from-cyan-600 to-indigo-600 w-full p-2">
            <v-icon size="10">mdi-more-fill</v-icon>
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