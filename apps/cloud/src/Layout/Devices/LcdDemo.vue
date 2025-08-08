<script setup lang="ts">
import { ref } from 'vue'
import LcdDisplay from '@/Core/UI/LcdDisplay.vue'

const demoContent = ref([
  'DEJA.js v1.0.0',
  '================',
  '',
  '> Initializing system...',
  '✓ DCC-EX connected',
  '✓ Layout loaded',
  '✓ Turnouts configured',
  '',
  'Status: ONLINE',
  'Devices: 3 connected',
  'Turnouts: 12 active',
  '',
  'Last command: T 1 THROWN',
  'Response: OK',
  '',
  'Ready for commands...'
])

const codeExample = ref([
  'function connectDevice(device) {',
  '  const { port, baudRate } = device;',
  '  ',
  '  return new Promise((resolve, reject) => {',
  '    const connection = new SerialPort({',
  '      path: port,',
  '      baudRate: baudRate || 115200',
  '    });',
  '    ',
  '    connection.on("open", () => {',
  '      console.log("Connected to", port);',
  '      resolve(connection);',
  '    });',
  '    ',
  '    connection.on("error", reject);',
  '  });',
  '}'
])

const errorLog = ref([
  'ERROR: Connection failed',
  'ERRNO: ECONNREFUSED',
  'PORT: /dev/ttyUSB0',
  'TIME: 2024-01-15 14:30:22',
  '',
  'Stack trace:',
  '  at SerialPort.open (serialport.js:45)',
  '  at Device.connect (device.js:23)',
  '  at Layout.connectDevice (layout.js:67)',
  '',
  'Retrying in 5 seconds...'
])

const statusDisplay = ref([
  'SYSTEM STATUS',
  '============',
  '',
  'CPU: 45% | MEM: 67%',
  'TEMP: 42°C | FAN: 1200RPM',
  '',
  'NETWORK: ONLINE',
  'UPTIME: 3d 7h 23m',
  '',
  'ACTIVE CONNECTIONS:',
  '  - DCC-EX: 192.168.1.100:2560',
  '  - WebSocket: 192.168.1.100:8080',
  '  - MQTT: 192.168.1.100:1883',
  '',
  'LAST UPDATE: 14:30:22'
])

// Interactive demo reactive variables
const lcdColor = ref<'green' | 'amber' | 'white' | 'blue' | 'red'>('green')
const lcdSize = ref<'sm' | 'md' | 'lg'>('md')
const lcdBlink = ref(false)
const lcdCursor = ref(false)
const lcdMaxLines = ref(20)

const handleContentChange = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  if (target) {
    demoContent.value = target.value.split('\n')
  }
}
</script>

<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold mb-6">LCD Display Demo</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Basic LCD Display -->
      <div>
        <h2 class="text-lg font-semibold mb-3">Basic LCD Display</h2>
        <LcdDisplay 
          :content="demoContent"
          title="DEJA.js Console"
          color="green"
          size="md"
        />
      </div>

      <!-- Code Example -->
      <div>
        <h2 class="text-lg font-semibold mb-3">Code Display</h2>
        <LcdDisplay 
          :content="codeExample"
          title="JavaScript Code"
          color="blue"
          size="sm"
        />
      </div>

      <!-- Error Display -->
      <div>
        <h2 class="text-lg font-semibold mb-3">Error Log</h2>
        <LcdDisplay 
          :content="errorLog"
          title="Error Console"
          color="red"
          size="md"
          :blink="true"
        />
      </div>

      <!-- Status Display -->
      <div>
        <h2 class="text-lg font-semibold mb-3">System Status</h2>
        <LcdDisplay 
          :content="statusDisplay"
          title="System Monitor"
          color="amber"
          size="lg"
          :show-cursor="true"
        />
      </div>

      <!-- Small LCD -->
      <div>
        <h2 class="text-lg font-semibold mb-3">Small LCD</h2>
        <LcdDisplay 
          content="Hello World!\nThis is a small LCD\ndisplay example."
          title="Mini Display"
          color="white"
          size="sm"
          :max-lines="5"
        />
      </div>

      <!-- Large LCD -->
      <div>
        <h2 class="text-lg font-semibold mb-3">Large LCD</h2>
        <LcdDisplay 
          content="This is a large LCD display\nwith bigger text and more\nspace for content."
          title="Large Display"
          color="green"
          size="lg"
          :max-lines="8"
        />
      </div>
    </div>

    <!-- Interactive Demo -->
    <div class="mt-8">
      <h2 class="text-lg font-semibold mb-3">Interactive Demo</h2>
      <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Content:</label>
          <textarea 
            :value="demoContent.join('\n')"
            @input="handleContentChange"
            class="w-full h-32 p-2 border rounded font-mono text-sm"
            placeholder="Enter LCD content here..."
          ></textarea>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-1">Color:</label>
            <select v-model="lcdColor" class="w-full p-2 border rounded">
              <option value="green">Green</option>
              <option value="amber">Amber</option>
              <option value="white">White</option>
              <option value="blue">Blue</option>
              <option value="red">Red</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Size:</label>
            <select v-model="lcdSize" class="w-full p-2 border rounded">
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Options:</label>
            <div class="space-y-1">
              <label class="flex items-center">
                <input type="checkbox" v-model="lcdBlink" class="mr-2">
                <span class="text-sm">Blink</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" v-model="lcdCursor" class="mr-2">
                <span class="text-sm">Show Cursor</span>
              </label>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Max Lines:</label>
            <input 
              type="number" 
              v-model="lcdMaxLines" 
              min="1" 
              max="50"
              class="w-full p-2 border rounded"
            >
          </div>
        </div>
        
        <LcdDisplay 
          :content="demoContent"
          title="Interactive LCD"
          :color="lcdColor"
          :size="lcdSize"
          :blink="lcdBlink"
          :show-cursor="lcdCursor"
          :max-lines="lcdMaxLines"
        />
      </div>
    </div>
  </div>
</template>

 