<script setup lang="ts">
  import router from '@/router';

  const emit = defineEmits(['connect', 'disconnect'])
  const props = defineProps({
    icon: {
      type: String,
      required: true
    },
    isConnected: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    itemLabel: {
      type: String,
      default: ''
    },
    page: {
      type: String,
      default: ''
    }
  })
  function handleAction() {
    if (props.isConnected) {
      emit('disconnect')
    } else {
      emit('connect')
    }
    if (props.page) {
      router.push({ name: props.page })
    }
  }

  function getStatusColor() {
    if (props.disabled) {
      return 'neutral'
    } else if (props.isConnected) {
      return 'success'
    } else {
      return 'error'
    }
  } 

</script>

<template>
  <v-card>
    <template #actions>
      <v-btn v-if="isConnected" 
        @click="$emit('disconnect')" 
        :prepend-icon="icon" 
        color="error" 
        :disabled="disabled" 
        text="Disconnect"
        variant="outlined" />
      <v-btn v-else 
        @click="$emit('connect')" 
        :prepend-icon="icon" 
        color="success" 
        :disabled="disabled" 
        text="Connect"
        variant="outlined" />
    </template>
    <template #append>
      <v-icon v-if="icon" :icon="icon" :color="getStatusColor()" size="48" />
    </template>
    <template #prepend>

    </template>
    <template #image>
    </template>
    <template #item>
      <slot></slot>
    </template>
    <template #text>
      <slot name="desc"></slot>
    </template>
    <template #title>
      {{ itemLabel }}
    </template>
    <template #subtitle>

    </template>
  </v-card>
  <!-- <div class="grid grid-cols-1 gap-4 p-4 rounded-lg shadow-md bg-slate-900 bg-opacity-80">
    <div class=" col-start-2 row-span-3 row-start-1 self-center place-content-center place-items-center ">      
     
    </div>
    <div class="text-sky-500 font-bold">{{ itemLabel }}</div>
    <div class="text-4xl font-bold"><slot></slot></div>
    <div class="text-wrap pr-12"><slot name="desc"></slot></div>
    <div class="stat-actions">      
      <slot name="actions">
        
      </slot>
    </div>
  </div> -->
</template>
