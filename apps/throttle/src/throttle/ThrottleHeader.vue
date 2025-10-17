<script setup lang="ts">

</script>
<template>
  <header
    class="p-2 text-lg bg-transparent flex items-center justify-between relative flex-wrap gap-2"
  >
    <slot name="prepend"></slot>
    <section class="flex items-center gap-2">
      <slot name="left"></slot>
    </section>
    <section class="flex items-center justify-center gap-2 text-center">
      <slot name="center"></slot>
    </section>
    <section class="flex items-center gap-2">
      <slot name="right"></slot>
    </section>
    <slot name="append"></slot>
  </header>
</template>
