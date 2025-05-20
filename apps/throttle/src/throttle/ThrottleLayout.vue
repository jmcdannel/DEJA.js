<script setup lang="ts">
  import { 
    MdViewArray,
    MdViewCarousel,
    MdViewColumn,
    MdOutlineViewCozy,
    MdOutlineViewHeadline,
    MdOutlineViewAgenda,
    MdOutlineViewSidebar
  } from "vue3-icons/md";
  import { useStorage } from '@vueuse/core'

  const viewAs = useStorage('@DEJA/prefs/throttleView', 'Array')

</script>
<template>
  <div class="join">
    <button 
      class="btn join-item hover:bg-purple-800 hover:bg-opacity-65" 
      :class="viewAs === 'Array' ? 'bg-purple-500' : ''"
      @click="viewAs = 'Array'">
      <MdViewArray class="w-4 h-4 md:w-6 md:h-6 stroke-none" />
    </button>
    <button 
      class="btn join-item hover:bg-purple-800 hover:bg-opacity-65" 
      :class="viewAs === 'List' ? 'bg-purple-500' : ''"
      @click="viewAs = 'List'">
      <MdOutlineViewHeadline class="w-4 h-4 md:w-6 md:h-6 stroke-none" />
    </button>
    <button 
      class="btn join-item hover:bg-purple-800 hover:bg-opacity-65" 
      :class="viewAs === 'Sidebar' ? 'bg-purple-500' : ''"
      @click="viewAs = 'Sidebar'">
      <MdOutlineViewSidebar class="w-4 h-4 md:w-6 md:h-6 stroke-none" />
    </button>
    <button 
      class="btn join-item hover:bg-purple-800 hover:bg-opacity-65" 
      :class="viewAs === 'Grid' ? 'bg-purple-500' : ''"
      @click="viewAs = 'Grid'">
      <MdOutlineViewCozy class="w-4 h-4 md:w-6 md:h-6 stroke-none" />
    </button>
    <button 
      class="btn join-item hover:bg-purple-800 hover:bg-opacity-65" 
      :class="viewAs === 'Split' ? 'bg-purple-500' : ''"
      @click="viewAs = 'Split'">
      <MdOutlineViewAgenda class="w-4 h-4 md:w-6 md:h-6 stroke-none rotate-90" />
    </button>
  </div>

</template>