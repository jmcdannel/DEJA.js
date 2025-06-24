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
    <section class="flex flex-col flex-grow justify-center">
      <!-- <pre>{{ functions }}</pre> -->
      <ul class="grid grid-cols-3 justify-center mx-2 items-center gap-1">
        <li v-for="(locoFunc, addressx) in loco.functions?.filter(lf => lf.isFavorite)" :key="locoFunc.id">
          <!-- <pre>{{ locoFunc }}</pre> -->
          <FunctionButton :func="locoFunc" :address="loco.address" class="w-full" />
        </li>
        <li class="col-span-3">
          <v-btn @click="openAllFunctions()"
            prepend-icon="mdi-more"
            class="relative  w-full bg-gradient-to-br from-green-600 to-teal-600 w-full p-2">
            View All
          </v-btn>  
        </li>
      </ul>
    </section>
    <!-- <pre>{{ loco.functions?.filter(lf => lf.isFavorite) }}</pre> -->
    <FunctionList
      ref="listRef"
      :loco="loco"
    />
  </template>
</template>