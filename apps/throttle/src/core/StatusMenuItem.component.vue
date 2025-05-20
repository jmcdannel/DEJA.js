<script setup lang="ts">
  import router from '@/router';

  const emit = defineEmits(['connect', 'disconnect'])
  const props = defineProps({
    icon: {
      type: Function,
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
      return 'text-gray-500'
    } else if (props.isConnected) {
      return 'text-success'
    } else {
      return 'text-error'
    }
  } 

</script>

<template>
  <div class="stat">
    <div class="stat-figure">      
       <component :is="icon" class="h-8 w-8 stroke-none mx-1" :class="getStatusColor()" />
    </div>
    <div class="stat-title text-sky-500 font-bold">{{ itemLabel }}</div>
    <div class="stat-value"><slot></slot></div>
    <div class="stat-desc text-wrap pr-24"><slot name="desc"></slot></div>
    <div class="stat-actions">      
      <slot name="actions">
        <button @click="handleAction" class="btn btn-sm btn-outline btn-primary">
          <component :is="icon" class="h-3 w-3 stroke-none mx-1" :class="getStatusColor()" />
          {{ isConnected ? 'Disconnect' : 'Connect' }}
        </button>
      </slot>
    </div>
  </div>
</template>
