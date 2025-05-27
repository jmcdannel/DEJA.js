<script lang="ts" setup>
import { ref } from 'vue';
import type { Loco } from '@repo/modules/locos'
import Modal from '@/core/Modal.component.vue'
import { useLocos } from '@repo/modules/locos'
import LocoAvatar from '@/core/LocoAvatar/LocoAvatar.vue'
  
const modalRef = ref<HTMLDialogElement | null>(null);

defineEmits(['selected'])
defineExpose({
  showModal: (): void => modalRef?.value?.showModal(),
  closeModal: (): void => modalRef?.value?.close()
})

const { getLocos } = useLocos()
const locos = getLocos()

</script>
<template>
  <Modal ref="modalRef">
    <h3 class="text-lg font-bold">Loco</h3>
    <hr class="my-2 border-slate-500" />
    <div class="flex flex-wrap gap-2">
      <LocoAvatar
        v-for="loco in locos" 
        :key="loco.locoId" 
        :loco="loco as Loco"
        @selected="$emit('selected', loco.locoId)"
      />
    </div>
  </Modal>
</template>