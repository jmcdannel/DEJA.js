<script lang="ts" setup>
  import { ref } from 'vue';
  import { 
    FaChevronCircleLeft,
    FaChevronCircleRight,
    FaMinus,
    FaPlus,
    FaTimesCircle,
  } from "vue3-icons/fa";

  import Modal from '@/core/Modal.component.vue'

  const props = defineProps({
    loco: {
      type: Object,
      required: true
    }
  })
  
  const modalRef = ref<HTMLDialogElement | null>(null);

  defineExpose({
    showModal: () => modalRef?.value?.showModal()
  })

</script>
<template>
  <Modal ref="modalRef">
    <h3 class="text-lg font-bold">Consist</h3>
    <hr class="my-2 border-slate-500" />
    <ul class="p-2 flex flex-col items-center" v-if="loco">
      <li v-for="cloco in loco.consist" :key="cloco" 
      class=" items-center
        flex 
        justify-center 
        space-between
        rounded-full
        p-1
        mr-1
        my-1
        bg-gray-600
        bg-opacity-50
        "
        :class="cloco.address === loco.address ? 'disabled' : ''">
        <section>
          <button class="mx-2 btn btn-sm btn-circle">
            <FaChevronCircleLeft v-if="cloco.direction" @click="$emit('toggleDir', cloco, false, $event)" class="h-5 w-5" alt="Left loco" />
            <FaChevronCircleRight v-else @click="$emit('toggleDir', cloco, true, $event)" class="h-5 w-5" alt="Right loco" />
          </button> 
        </section>
        <button class="btn btn-outline mx-1 btn-primary btn-sm py-2">
          <span class="">{{ cloco.address }}</span>
        </button> 
        <section class="rounded-2xl bg-zinc-800 text-xs flex justify-center pr-2 pl-3 items-center">
          <label class="block py-2 text-cyan-400 mr-2">Trim: <strong>{{  cloco.trim }}</strong></label>
          <button class="btn btn-circle btn-info btn-xs" @click="$emit('adjustTrim', cloco, -1)">
            <FaMinus alt="clear layout" class="h-3 w-3" />
          </button>
          <button class="btn btn-circle btn-info btn-xs" @click="$emit('adjustTrim', cloco, 1)">
            <FaPlus alt="clear layout" class="h-3 w-3" />
          </button>
        </section>
        <button class="mx-2 btn btn-sm btn-square">
          <FaTimesCircle alt="clear layout" class="h-3 w-3" @click="$emit('removeLoco', cloco)" />
        </button>
      </li>
    </ul>
  </Modal>
</template>