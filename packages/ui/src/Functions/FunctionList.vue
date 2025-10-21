<script lang="ts" setup>
  import { ref } from 'vue'
  import FunctionButton from './FunctionButton.vue'
  import { defaultFunctions, useLocos, type Loco, type ConsistLoco } from '@repo/modules'
  import { LocoAvatar, MiniConsist } from '@repo/ui'

  const props = defineProps<{
    loco: Loco | null,
  }>()
  
  const modelOpen = ref(false)
  const _functions = ref(defaultFunctions.map(f => ({...f, ...props.loco?.functions?.find(lf => lf.id === f.id)})))
  const selectedConsistAddress = ref<number | null>(props.loco?.address ?? null)
  const currentLoco = ref<Loco | null>(props.loco ?? null)
  const { getLocos } = useLocos()
  const locos = getLocos()

  // when the modal opens, default the selected consist to the current loco

  // update functions when a consist loco is selected
  function handleConsistSelect(selected: ConsistLoco) {
    // Replace the current loco with the selected loco to show its functions
    selectedConsistAddress.value = selected.address ?? null
    // try to find a full loco entry from the locos collection
    const full = locos.value?.find((l: any) => l.address === selected.address)
    if (full) {
      currentLoco.value = full as Loco
      _functions.value = defaultFunctions.map(f => ({...f, ...full.functions?.find((lf: any) => lf.id === f.id)}))
      return
    }
  }

  function handleLocoSelect() {
    // Select the parent loco and load its functions
    currentLoco.value = props.loco ?? null
    selectedConsistAddress.value = props.loco?.address ?? null
    const funcs = defaultFunctions.map(f => ({...f, ...props.loco?.functions?.find(lf => lf.id === f.id)}))
    _functions.value = funcs
  }


  defineExpose({
     showModal: () => {
       modelOpen.value = true
       // default selection is the parent loco
       currentLoco.value = props.loco ?? null
       selectedConsistAddress.value = props.loco?.address ?? null
       // reset functions to the parent loco when opening
       _functions.value = defaultFunctions.map(f => ({...f, ...props.loco?.functions?.find(lf => lf.id === f.id)}))
     }
  })

</script>
<template>
  <v-dialog v-model="modelOpen" ref="modalRef" class="w-full max-w-4xl">
    <v-sheet class="p-4">
      <header class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <LocoAvatar v-if="loco" :loco="loco as Loco" :size="36" @select="handleLocoSelect" />
            <MiniConsist v-if="loco" :loco="loco" :selectedAddress="selectedConsistAddress" @select="handleConsistSelect" />
            <h2 class="text-2xl font-bold">Functions for {{ currentLoco?.name || loco?.name || 'Loco' }}</h2>
          </div>
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
            <FunctionButton :func="func" :address="currentLoco?.address ?? loco?.address" class="w-full justify-start" show-label show-default-icon />
        </li>
      </ul>
    </v-sheet>
  </v-dialog>
</template>