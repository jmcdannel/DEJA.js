<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LcdDisplay from '@/Core/UI/LcdDisplay.vue'

const deviceStatus = ref([
  'DEVICE STATUS',
  '=============',
  '',
  'Device: DCC-EX Controller',
  'Port: /dev/ttyUSB0',
  'Baud: 115200',
  '',
  'Status: CONNECTED',
  'Last Command: T 1 THROWN',
  'Response: OK',
  '',
  'Active Turnouts: 12',
  'Connected: 3d 7h 23m',
  '',
  'Ready for commands...'
])

const commandLog = ref([
  'COMMAND LOG',
  '===========',
  '',
  '14:30:15 > T 1 THROWN',
  '14:30:15 < OK',
  '',
  '14:30:18 > T 2 CLOSED',
  '14:30:18 < OK',
  '',
  '14:30:22 > T 3 THROWN',
  '14:30:22 < OK',
  '',
  '14:30:25 > T 4 CLOSED',
  '14:30:25 < OK',
  '',
  'Last: 14:30:25'
])

const errorLog = ref([
  'ERROR LOG',
  '=========',
  '',
  '14:25:10 ERR: Connection lost',
  '14:25:12 ERR: Retrying...',
  '14:25:15 OK: Reconnected',
  '',
  '14:28:30 ERR: Invalid command',
  '14:28:30 ERR: T 99 THROWN',
  '14:28:30 ERR: Turnout not found',
  '',
  '14:29:45 OK: System stable',
  '',
  'No active errors'
])

onMounted(() => {
  // Simulate real-time updates
  setInterval(() => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    // Update status with current time
    deviceStatus.value[deviceStatus.value.length - 1] = `Last update: ${timeStr}`
  }, 1000)
})
</script>

<template>
  <div class="p-4 space-y-6">
    <h1 class="text-xl font-bold">Device LCD Displays</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Device Status -->
      <div>
        <h2 class="text-lg font-semibold mb-2">Device Status</h2>
        <LcdDisplay 
          :content="deviceStatus"
          title="STATUS"
          color="green"
          size="sm"
          :show-cursor="true"
        />
      </div>
      
      <!-- Command Log -->
      <div>
        <h2 class="text-lg font-semibold mb-2">Command Log</h2>
        <LcdDisplay 
          :content="commandLog"
          title="COMMANDS"
          color="blue"
          size="sm"
        />
      </div>
      
      <!-- Error Log -->
      <div>
        <h2 class="text-lg font-semibold mb-2">Error Log</h2>
        <LcdDisplay 
          :content="errorLog"
          title="ERRORS"
          color="red"
          size="sm"
          :blink="false"
        />
      </div>
    </div>
    
    <!-- Usage Instructions -->
    <div class="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Usage</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        The LCD Display component provides a retro terminal aesthetic for displaying:
      </p>
      <ul class="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
        <li>Device status and connection information</li>
        <li>Command logs and responses</li>
        <li>Error messages and debugging info</li>
        <li>System monitoring data</li>
        <li>Code snippets and configuration</li>
      </ul>
    </div>
  </div>
</template> 