<script setup lang="ts">

defineProps({
  address: {
    type: Number,
    required: true
  }
})

</script>
<template>
  <header class="p-2 text-lg bg-transparent flex items-center justify-between relative flex-wrap">
    <slot name="prepend"></slot>
    <section class="flex">
      <slot name="left"></slot>
    </section>
    <section class="flex">
      <slot name="center"></slot>
    </section>
    <section class="flex">
      <slot name="right"></slot>
    </section>
    <slot name="append"></slot>
  </header> 
</template>