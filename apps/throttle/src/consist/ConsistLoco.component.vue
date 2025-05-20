<script lang="ts" setup>
  import { defineProps, ref } from 'vue';

  import { 
    FaChevronCircleLeft,
    FaChevronCircleRight,
  } from "vue3-icons/fa";

  const props = defineProps({
    cloco: {
      type: Object,
      required: true
    }
  })

</script>
<template>
  <li 
    class="
      bg-gradient-to-r 
      from-sky-500 
      to-sky-700
      flex 
      justify-center 
      align-middle 
      items-center
      space-between
      rounded-full
      p-1
      mr-1
      my-1
      ">
      <button class="btn btn-circle btn-outline btn-xs border-sky-900">
        <FaChevronCircleLeft v-if="cloco.direction" @click="$emit('toggleDir', cloco, false, $event)" class="h-5 w-5 fill-sky-900" alt="Left loco" />
        <FaChevronCircleRight v-else @click="$emit('toggleDir', cloco, true, $event)" class="h-5 w-5 fill-sky-900" alt="Right loco" />
      </button>
      <button class="btn btn-circle ml-1 btn-xs ">
        <span class="">{{ cloco.address }}</span>
      </button>
    </li>
</template>