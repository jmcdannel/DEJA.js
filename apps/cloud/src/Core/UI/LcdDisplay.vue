<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  content?: string | string[]
  title?: string
  color?: 'green' | 'amber' | 'white' | 'blue' | 'red'
  size?: 'sm' | 'md' | 'lg'
  blink?: boolean
  showCursor?: boolean
  maxLines?: number
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  title: '',
  color: 'green',
  size: 'md',
  blink: false,
  showCursor: false,
  maxLines: 20
})

const displayContent = computed(() => {
  if (Array.isArray(props.content)) {
    return props.content.slice(0, props.maxLines)
  }
  return props.content.split('\n').slice(0, props.maxLines)
})

const colorClasses = computed(() => {
  const colors = {
    green: 'text-green-400',
    amber: 'text-amber-400',
    white: 'text-gray-100',
    blue: 'text-blue-400',
    red: 'text-red-400'
  }
  return colors[props.color]
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }
  return sizes[props.size]
})

const cursorClass = computed(() => {
  return props.showCursor ? 'after:content-["█"] after:animate-pulse' : ''
})

const copyToClipboard = async () => {
  try {
    const content = displayContent.value.join('\n')
    await navigator.clipboard.writeText(content)
    // You could add a toast notification here if you have one
    console.log('Content copied to clipboard')
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
  }
}
</script>

<template>
  <div class="lcd-display bg-black border-2 border-gray-700 rounded-lg p-4 shadow-lg">
    <!-- LCD Header -->
    <div v-if="title" class="lcd-header mb-2 pb-2 border-b border-gray-600">
      <span class="text-gray-400 text-xs font-mono">{{ title }}</span>
    </div>
    
    <!-- LCD Screen -->
    <div class="lcd-screen bg-black rounded p-3 font-mono leading-tight animate-deja-lcd-flicker">
      <div 
        v-for="(line, index) in displayContent" 
        :key="index"
        class="lcd-line"
        :class="[colorClasses, sizeClasses, cursorClass]"
      >
        <span v-if="blink" class="animate-pulse">{{ line }}</span>
        <span v-else>{{ line }}</span>
      </div>
      
      <!-- Empty lines to fill screen -->
      <div 
        v-for="i in Math.max(0, maxLines - displayContent.length)" 
        :key="`empty-${i}`"
        class="lcd-line text-gray-800"
        :class="[colorClasses, sizeClasses]"
      >
        &nbsp;
      </div>
    </div>
    
    <!-- LCD Footer -->
    <div class="lcd-footer mt-2 pt-2 border-t border-gray-600">
      <div class="flex justify-between items-center text-gray-500 text-xs font-mono">
        <span>{{ displayContent.length }}/{{ maxLines }}</span>
        <v-btn
          size="x-small"
          variant="text"
          color="gray"
          @click="copyToClipboard"
          prepend-icon="mdi-content-copy"
          class="text-xs"
        >
          Copy
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lcd-display {
  background: linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 0, 0.1);
}

.lcd-screen {
  background: linear-gradient(180deg, #000000 0%, #0a0a0a 100%);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
  min-height: 200px;
}

.lcd-line {
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.lcd-header, .lcd-footer {
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
}

/* CRT scan lines effect */
.lcd-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 0, 0.03) 2px,
    rgba(0, 255, 0, 0.03) 4px
  );
  pointer-events: none;
  z-index: 1;
}

/* Glow effect for text */
.lcd-line {
  text-shadow: 0 0 5px currentColor;
}

</style> 