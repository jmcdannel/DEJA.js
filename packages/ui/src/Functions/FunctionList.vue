<script lang="ts" setup>
  import { ref } from 'vue'
  import FunctionButton from './FunctionButton.vue'
  import { defaultFunctions, type Loco } from '@repo/modules/locos'

  const props = defineProps<{
    loco: Loco | null,
  }>()
  

  const modelOpen = ref(false)
  const _functions = ref(defaultFunctions.map(f => ({...f, ...props.loco?.functions?.find(lf => lf.id === f.id)})))


  defineExpose({
    showModal: () => modelOpen.value = true
  })

</script>
<template>
  <v-dialog v-model="modelOpen" ref="modalRef" class="w-full max-w-4xl">
    <v-sheet class="p-4">
      <header class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold">Functions for {{ loco?.name || 'Loco' }}</h2>
        <v-btn icon @click="modelOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </header>
      <hr class="my-1 border-slate-500" />
      <ul v-if="loco" class="p-2 flex flex-row flex-wrap items-center">
        <li v-for="(func, fIdx) in _functions" :key="func.id"      
        class=" items-center
          flex 
          justify-center 
          space-between
          p-1
          basis-full
          md:basis-1/2
          ">
            <FunctionButton :func="func" :address="loco.address" class="w-full justify-start" show-label show-default-icon />
        </li>
      </ul>
    </v-sheet>
  </v-dialog>
</template>