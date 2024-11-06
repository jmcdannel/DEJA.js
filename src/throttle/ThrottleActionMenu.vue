<script setup lang="ts">
import { MdLocalParking } from "vue3-icons/md"
import { RiTrainWifiFill } from 'vue3-icons/ri'  
import { 
  IoIosCog,
} from 'vue3-icons/io'

</script>
<template>
  <nav class="">
    <button 
      class="btn btn-sm sm:btn-md btn-ghost border border-purple-600 border-opacity-50 rounded-r-none border-r-0 hover:bg-purple-800 hover:bg-opacity-65" 
      @click="$emit('clear')">
      <MdLocalParking alt="clear" class="w-4 h-4 md:w-6 md:h-6 stroke-none" />
    </button>
    <button 
      class="btn btn-sm sm:btn-md btn-ghost border border-purple-600 border-opacity-50 rounded-l-none hover:bg-purple-800 hover:bg-opacity-65" 
      @click="$emit('functions')" >
      <RiTrainWifiFill class="w-4 h-4 md:w-6 md:h-6 stroke-none" />
    </button>
  </nav>
</template>