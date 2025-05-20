<script setup lang="ts">
  import { ref } from 'vue';
  import powerIconSvg from '@/assets/icons/power.svg'

  const props = defineProps({
    connected: {
        type: Boolean,
        default: undefined
    },
    connectedLabel: {
        type: String,
        default: 'Connected'
    },
    disconnectedLabel: {
        type: String,
        default: 'Disconnected'
    }
  });

  const isStatusUndefined = ref(props.connected === undefined);

  const emit = defineEmits(['clear'])

  const clearclick = async () => {
    await emit('clear');
  }

</script>
<template>
  <template v-if="connected">
    <span class="mb-1 inline-flex items-center mr-2 px-4 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
      <span class="w-3 h-3 mr-1 bg-green-600" :style="{ mask: 'url(' + powerIconSvg + ')' }"></span>
      <span class="text-sm"> {{  connectedLabel  }}</span>
    </span>
 </template>
  <template v-else-if="isStatusUndefined">
    <span class="mb-1 inline-flex items-center mr-2 px-4 py-1 rounded-full bg-red-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
      <span class="w-3 h-3 mr-1 bg-gray-600" :style="{ mask: 'url(' + powerIconSvg + ')' }"></span>
      <span class="text-sm">{{ disconnectedLabel }}</span>
    </span>    
</template>
<template v-else>
    <span class="mb-1 inline-flex items-center mr-2 px-4 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
      <span class="w-3 h-3 mr-1 bg-red-500" :style="{ mask: 'url(' + powerIconSvg + ')' }"></span>
      <span class="text-sm">{{ disconnectedLabel }}</span>
    </span>
</template>
</template>