<script setup lang="ts">
  import { defineProps } from 'vue'
  import { 
    PiHeadlightsFill,
    PiBellFill
  } from 'vue3-icons/pi'
  import { 
    FaBullhorn,
    FaChevronCircleLeft,
    FaChevronCircleRight,
    FaMinus,
    FaPlus,
    FaRegStar,
    FaTimesCircle,
  } from 'vue3-icons/fa'
  import { RiTrainWifiFill } from 'vue3-icons/ri'

  defineProps({
    icon: {
      type: String
    }
  })

</script>
<template>
  <PiHeadlightsFill v-if="icon === 'light'" />
  <PiBellFill v-else-if="icon === 'bell'" class="w-6 h-6" />
  <FaBullhorn v-else-if="icon === 'horn'" class="w-6 h-6" />
  <template v-else>
    <RiTrainWifiFill class="w-6 h-6" />
  </template>
</template>