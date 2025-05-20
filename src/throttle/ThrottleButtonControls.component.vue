<script setup lang="ts">
  import { defineEmits } from 'vue'
  
  const props  = defineProps({
    speed: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    horizontal: {
      type: Boolean,
      default: false
    }
  })

  const emit = defineEmits(['update:currentSpeed', 'stop'])

  async function handleUp() {
    emit('update:currentSpeed', 1)
  }

  async function handleUp5() {
    emit('update:currentSpeed', 5)
  }

  async function handleDown() {
    emit('update:currentSpeed', -1)
  }

  async function handleDown5() {
    emit('update:currentSpeed', -5)
  }

  async function handleStop() {
    emit('stop')
  }

  const btnClasses = [
    'btn btn-accent relative h-auto mx-auto @[960px]:w-24 p-1 @[400px]:p-1 @[640px]:p-2 @[1024px]:py-2 @[1024px]:px-8',
    props.horizontal ? '' : 'px-4'].join(' ')
  const iconClasses = `h-4 w-8 @[400px]:h-5 @[400px]:w-5 @[960px]:h-6 @[960px]:w-12 relative}`

</script>
<template>
  <div class="py-0 @[400px]:py-2 @[400px]:px-4 @[640px]:py-2 @[640px]:px-12 flex justify-stretch items-center flex-grow relatve z-20"
    :class="`${horizontal ? 'flex-row px-1' : 'flex-col '}`">
    <button 
      class=" flex-grow" 
      :class="`${btnClasses} ${horizontal ? 'rounded-r-none rounded-l-3xl' : 'rounded-b-none rounded-t-3xl'}`"
      @click="handleUp5">
      <v-icon 
        :icon="horizontal ? 'mdi-plus-thick' : 'mdi-chevron-double-up'" 
        :class="iconClasses" />
    </button>
    <hr class="border-black" />
    <button 
      class="rounded-none flex-grow" 
      :class="btnClasses"
      @click="handleUp">
      <v-icon 
        :icon="horizontal ? 'mdi-plus' : 'mdi-chevron-up'" 
        :class="iconClasses"
      />
    </button>
    <button 
      class="btn bg-red-500 rounded-3xl py-2 @[1024px]:py-4 min-w-16 h-auto mx-auto relative z-10"
      :class="horizontal ? '@[960px]:h-36 rounded-none' : 'w-28 @[960px]:w-36 rounded-3xl'"
       @click="handleStop">
      <v-icon icon="mdi-stop" class="h-8 w-8 @[1024px]:h-12 @[1024px]:w-12 relative" />
    </button>
    <button 
      class="rounded-none  flex-grow"
      :class="btnClasses" 
      @click="handleDown">
      <v-icon 
        :icon="horizontal ? 'mdi-minus' : 'mdi-chevron-down'" 
        :class="iconClasses"
      />
    </button>
    <hr class="border-black" />
    <button 
      class="flex-grow" 
      :class="`${btnClasses} ${horizontal ? 'rounded-l-none rounded-r-3xl' : 'rounded-t-none rounded-b-3xl'}`"
      @click="handleDown5">
      <v-icon 
        :icon="horizontal ? 'mdi-minus-thick' : 'mdi-chevron-double-down'"
        :class="iconClasses"
      />
    </button>
  </div>
</template>