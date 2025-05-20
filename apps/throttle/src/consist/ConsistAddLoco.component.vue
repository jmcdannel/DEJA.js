<script lang="ts" setup>
  import { ref, type PropType, } from 'vue';
  import Modal from '@/core/Modal.component.vue'
  import type { ConsistLoco, Loco } from '@/throttle/types';

  const props = defineProps({
    locos: {
      type: Array as PropType<Loco[]>,
      required: true
    }
  })

  const newAddress = ref<number | null>(null)
  
  const modalRef = ref<HTMLDialogElement | null>(null);

  defineExpose({
    showModal: () => modalRef?.value?.showModal()
  })

</script>
<template>
  <Modal ref="modalRef">

    <h3 class="text-lg font-bold">Loco Address</h3>
    <hr class="my-2 border-slate-500" />
    <section class="flex">
      <div class="flex-grow">
        <input 
          v-model="newAddress" 
          type="text" 
          placeholder="Loco Address" 
          class="input input-bordered w-full max-w-xs" 
          pattern="[0-9]*" 
          inputmode="numeric" 
        />
      </div>
      <button class="ml-2 btn btn-primary" @click="$emit('addLoco', newAddress)">Add</button>
    </section>
    <ul class="p-2 flex flex-col items-center" v-if="locos?.length > 0">
      <li class="mb-2" v-for="cloco in locos" :key="cloco.address">
          <button
            role="link"
            @click="$emit('addLoco', cloco.address)"
            class="btn bg-gradient-to-br from-orange-700 to-rose-500 text-white text-lg btn-wide btn-lg"
          >
          {{cloco.address}}          
          </button>
      </li>
    </ul>
  </Modal>
</template>