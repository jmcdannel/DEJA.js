<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useDccLog } from './DCCLog/useDccLog'
import DCCLogItem from './DCCLog/DCCLogItem.vue'
import { useAutoScroll } from '../../composables/useAutoScroll'

const { log } = useDccLog(true)

const scrollContainer = ref<HTMLElement | null>(null)
useAutoScroll(scrollContainer, log)

const messageCount = computed(() => log.value.length)

defineExpose({
  messageCount,
  clear: () => { log.value = [] },
})
</script>

<template>
  <div ref="scrollContainer" class="flex-1 overflow-y-auto px-1 py-1">
    <div v-if="log.length === 0" class="monitor-pane__empty">
      Waiting for DCC commands...
    </div>
    <div v-else class="flex flex-col">
      <div v-for="entry in log" :key="entry.id" class="monitor-pane__log-entry">
        <DCCLogItem :entry="entry" />
      </div>
    </div>
  </div>
</template>
