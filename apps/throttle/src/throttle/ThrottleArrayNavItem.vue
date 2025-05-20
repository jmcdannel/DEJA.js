<script setup lang="ts">

  defineProps({
    throttle: Object,
    position: String
  })


  function computedLinkClass(position: string | undefined) {
    switch(position) {
      case 'first':
        return ' border-l ml-2 -mr-2 rounded-tl-3xl rounded-bl-3xl'
      case 'last':
      default:
        return ' border-r mr-2 -ml-2 rounded-tr-3xl rounded-br-3xl'
    }
  }
</script>
<template>

<div 
  v-if="throttle"
  class="p-4 flex border-teal-500 bg-teal-900 bg-opacity-25 h-32 my-auto border-t border-b"
  :class="computedLinkClass(position)">
  <router-link
    :to="{ name: 'cloud-throttle', params: { address: throttle.id } }"
    custom
    v-slot="{ navigate }"
    >
    <button 
      class="text-primary" 
      @click="navigate" 
      style="--va-badge-text-wrapper-border-radius: 50%;"
      role="link">
      <v-badge
        overlap
        :text="throttle?.speed.toString()"
      >
        <v-avatar size="small">{{ throttle?.id }}</v-avatar>
      </v-badge>
    </button>
  </router-link>
  </div>  
</template>