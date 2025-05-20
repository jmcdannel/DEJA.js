<script setup lang="ts">
  import { RouterLink } from 'vue-router'
  import ConnectionStatus from '@/core/ConnectionStatus.component.vue'
  import linkIconSvg from '@/assets/icons/link.svg'

  // Define the prop
  const props = defineProps({
    isConnected: {
      type: Boolean,
      required: true
    },
    connectPath: {
      type: String,
      required: true
    },
    connectedLabel: {
      type: String,
      required: true
    }
  })

</script>

<template>
  <router-link
    :to="props.connectPath"
  >
    <div class="card bg-base-100 bg-opacity-70 shadow-xl border-teal-900 border-2 mb-2 mr-2 ">
      <div class="card-body flex-row justify-between p-4">
        <h2 class="card-title text-lg">
          <img :src="linkIconSvg" alt="my-logo" class="w-12 h-12 fill-white strike-white border-teal-500 border-2 rounded-xl p-2" />
          <slot name="title">{{ props.connectedLabel }}</slot>
        </h2>
        <slot></slot>
        <div class="card-actions justify-end items-center">
          <ConnectionStatus :connected="props.isConnected" :connected-label="props.connectedLabel" />
        </div>
      </div>
    </div>
</router-link>
</template>
