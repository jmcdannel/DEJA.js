<script setup lang="ts">
  
  const props  = defineProps({
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
  const iconClasses = `h-4 w-8 @[400px]:h-5 @[400px]:w-5 @[960px]:h-6 @[960px]:w-12 relative`

</script>
<template>
  <div class="p-2@[400px]:py-2 @[400px]:px-4 @[640px]:py-2 @[640px]:px-12 flex justify-stretch items-center flex-grow relatve z-20"
    :class="`${horizontal ? 'flex-row px-1' : 'flex-col '}`">
    <v-btn 
      class=" flex-grow" 
      :class="`${btnClasses} ${horizontal ? 'rounded-r-none rounded-l-3xl py-3' : 'rounded-b-none rounded-t-3xl'}`"
      color="green"
      @click="handleUp5">
        <template v-if="horizontal">
          <v-icon icon="mdi-plus-thick" :class="iconClasses" />
          <v-icon icon="mdi-plus-thick" :class="iconClasses" />
        </template>
        <v-icon v-else icon="mdi-chevron-double-up" :class="iconClasses" />
    </v-btn>
    <hr class="border-black" />
    <v-btn  
      class="rounded-none flex-grow" 
      :class="`${btnClasses} ${horizontal ? 'py-3' : ''}`"
      color="green"
      @click="handleUp">
      <v-icon 
        :icon="horizontal ? 'mdi-plus' : 'mdi-chevron-up'" 
        :class="iconClasses"
      />
    </v-btn>
    <v-btn  
      class="rounded-3xl py-0 @[960px]:py-4 min-w-8 @[960px]:min-w-16 h-auto mx-auto relative z-10"
      :class="horizontal ? '@[960px]:h-36 rounded-none py-3 px-4' : 'w-28 py-6 @[960px]:w-36 rounded-3xl'"
      color="red"
      @click="handleStop">
      <v-icon icon="mdi-stop"  />
    </v-btn>
    <v-btn  
      class="rounded-none  flex-grow"
      :class="`${btnClasses} ${horizontal ? 'py-3' : ''}`"
      color="green"
      @click="handleDown">
      <v-icon 
        :icon="horizontal ? 'mdi-minus' : 'mdi-chevron-down'" 
        :class="iconClasses"
      />
    </v-btn>
    <hr class="border-black" />
    <v-btn  
      class="flex-grow items-center justify-center" 
      :class="`${btnClasses} ${horizontal ? 'rounded-l-none rounded-r-3xl py-3' : 'rounded-t-none rounded-b-3xl'}`"
      color="green"
      @click="handleDown5">
        <template v-if="horizontal">
          <v-icon icon="mdi-minus-thick" :class="iconClasses" />
          <v-icon icon="mdi-minus-thick" :class="iconClasses" />
        </template>
        <v-icon v-else icon="mdi-chevron-double-down" :class="iconClasses" />
    </v-btn>
  </div>
</template>