<script lang="ts" setup>
  import { ref } from 'vue'
  import Function from './Function.component.vue'
  import Modal from '@/core/Modal.component.vue'
  import type { Loco } from '@/throttle/types'
  import { defaultFunctions } from '@repo/modules/locos'

  const props = defineProps<{
    loco: Loco | null,
  }>()
  
  const _functions = ref(defaultFunctions.map(f => ({...f, ...props.loco?.functions?.find(lf => lf.id === f.id)})))
  const modalRef = ref<HTMLDialogElement | null>(null)

  defineExpose({
    showModal: () => modalRef?.value?.showModal()
  })

</script>
<template>
  <Modal ref="modalRef">
    <h3 class="text-lg font-bold">Functions</h3>
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
          <Function :func="func" :address="loco.locoId" class="w-full justify-start" show-label show-default-icon />
      </li>
    </ul>
  </Modal>
</template>