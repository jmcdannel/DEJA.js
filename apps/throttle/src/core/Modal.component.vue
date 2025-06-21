<script lang="ts" setup>
  import { ref } from 'vue';

  const _modalRef = ref<HTMLDialogElement | null>(null);

  const showModal = () => {
    if (_modalRef.value) {
      _modalRef.value.showModal()
    }
  }

  const closeModal = () => {
    if (_modalRef.value) {
      _modalRef.value.close()
    }
  }

  defineExpose({
    showModal,
    closeModal
  })

</script>
<template>
  <v-dialog ref="_modalRef">
    <div class="modal-box">
      <slot></slot>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="closeModal">close</button>
    </form>
  </v-dialog>
</template>