<script setup lang="ts">
  import Title from '@/core/Title.component.vue';
  import Power from '@/core/Power.component.vue';
  import StatusMenu from '@/core/StatusMenu.component.vue';

</script>

<template>
  <header>
    <div class="navbar bg-base-100">
      <div class="navbar-start">
       <Title />
      </div>
      <div class="navbar-end">
        <StatusMenu /> 
        <Power />
      </div>
    </div>
  </header>
</template>
