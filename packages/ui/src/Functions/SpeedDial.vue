<script setup lang="ts">
  import { ref, type PropType } from 'vue'
  import FunctionButton from './FunctionButton.vue'
  import FunctionList from './FunctionList.vue'
  import type { Loco } from '@repo/modules/locos'

defineProps({
    loco: {
      type: Object as PropType<Loco>,
      required: true
    }
  })
  const emit = defineEmits(['saveLoco'])

  defineExpose({
    openAll: () => listRef?.value?.showModal(),
  })

  const listRef = ref<HTMLDialogElement | null>(null)
  
  function openAllFunctions() {
    listRef?.value?.showModal()
  }

</script>
<template>
  <template v-if="loco">
    <section class="flex flex-col flex-grow justify-end">
      <!-- <pre>{{ functions }}</pre> -->
      <ul class="flex flex-wrap justify-center mx-2 items-center max-w-48 sm:max-w-48 md:max-w-48">
        <li v-for="(locoFunc, addressx) in loco.functions?.filter(lf => lf.isFavorite)" :key="locoFunc.id">
          <!-- <pre>{{ locoFunc }}</pre> -->
          <FunctionButton :func="locoFunc" :address="loco.address" class="w-full" />
        </li>
        <li class="">
          <v-btn @click="openAllFunctions()"
            icon="mdi-more"
            class="relative bg-gradient-to-br from-green-600 to-teal-600 w-full p-2">
          </v-btn>  
        </li>
      </ul>
    </section>
    <FunctionList
      ref="listRef"
      :loco="loco"
    />
  </template>
</template>