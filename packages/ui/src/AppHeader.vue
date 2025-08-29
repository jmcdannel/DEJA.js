<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useCurrentUser } from 'vuefire'
import Logo from './Logo.vue'
import ControlBar from './ControlBar.vue'
import UserProfile from './UserProfile.vue'
import { useLayout } from '@repo/modules'

defineProps<{
  appName?: string
  appIcon?: string
  variant?: 'default' | 'cloud' | 'throttle' | 'monitor'
  showLayoutPower?: boolean
  showEmergencyStop?: boolean
  showUserProfile?: boolean
  showDeviceStatus?: boolean
  showDeviceStatusLabel?: boolean
  deviceStatusCompact?: boolean
  color?: string
  dark?: boolean
  layoutPowerState?: boolean
  devices?: any[]
  layouts?: any[]
}>()

const { getLayouts, getDevices } = useLayout()
const layouts = getLayouts()
const devices = getDevices()

const emit = defineEmits<{
  trackPowerToggle: [newState: boolean]
  layoutPowerToggle: [newState: boolean]
  emergencyStop: []
  deviceSelect: [deviceId: string]
  layoutSelect: [layoutId: string]
}>()

const layoutId = useStorage('@DEJA/layoutId', '')
const user = useCurrentUser()

// Event handlers
function handleTrackPowerToggle(newState: boolean) {
  emit('trackPowerToggle', newState)
}

function handleLayoutPowerToggle(newState: boolean) {
  emit('layoutPowerToggle', newState)
}

function handleEmergencyStop() {
  emit('emergencyStop')
}

function handleDeviceSelect(deviceId: string) {
  emit('deviceSelect', deviceId)
}

function handleLayoutSelect(layoutId: string) {
  emit('layoutSelect', layoutId)
}

const defaultProps = {
  appName: 'DEJA',
  appIcon: 'mdi-train',
  variant: 'default' as const,
  showLayoutPower: true,
  showEmergencyStop: true,
  showUserProfile: true,
  showDeviceStatus: true,
  showDeviceStatusLabel: true,
  deviceStatusCompact: false,
  color: 'surface',
  dark: true,
  layoutPowerState: false,
  devices: [] as any[],
  layouts: [] as any[]
}
</script>

<template>
  <v-app-bar 
    class="px-2 relative overflow-hidden header-gradient"
    :color="color || defaultProps.color" 
    :dark="dark !== undefined ? dark : defaultProps.dark">
    
    <!-- Large blurred circular backgrounds for subtle depth -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[80px] -top-[150px] -right-[200px]"></div>
      <div class="absolute w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[70px] -bottom-[100px] -left-[150px]"></div>
      <div class="absolute w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[60px] top-[20%] left-[30%]"></div>
    </div>
    
    <!-- Content with proper z-index -->
    <div class="relative z-10 flex items-center w-[100%] w-full justify-between">
      <!-- Left side - Logo and App Name -->
      <div class="flex items-center min-w-0">
        <Logo 
          :app-name="appName || defaultProps.appName"
          :app-icon="appIcon || defaultProps.appIcon"
          :variant="variant || defaultProps.variant"
        />
      </div>

      <!-- Center - Title (optional, can be overridden by slot) -->
      <div class="flex items-center justify-center flex-1 min-w-0">
        <slot name="title">
        </slot>
      </div>

      <!-- Right side - Controls in consistent order -->
      <div class="flex items-center justify-end min-w-0 header-controls">
        <!-- Layout-specific controls - always in the same order -->
        <template v-if="layoutId">
          
          <!-- Control Bar with all power controls and device status -->
          <ControlBar
            :show-layout-power="showLayoutPower"
            :show-emergency-stop="showEmergencyStop"
            :show-device-status="showDeviceStatus"
            :show-device-status-label="showDeviceStatusLabel"
            :device-status-compact="deviceStatusCompact"
            :layout-power-state="layoutPowerState"
            :devices="devices || []"
            :layouts="layouts || []"
            @track-power-toggle="handleTrackPowerToggle"
            @layout-power-toggle="handleLayoutPowerToggle"
            @emergency-stop="handleEmergencyStop"
            @device-select="handleDeviceSelect"
            @layout-select="handleLayoutSelect"
          />
        </template>
        
        <!-- User Profile - always on the far right -->
        <UserProfile v-if="showUserProfile !== false && user" />
        
        <!-- Additional app-specific actions -->
        <slot name="actions" />
      </div>
    </div>
  </v-app-bar>
</template>

<style scoped>
.header-gradient {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Ensure proper contrast for all elements */
:deep(.v-btn) {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.v-chip) {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Consistent spacing and sizing */
:deep(.v-btn) {
  min-width: 40px;
  height: 40px;
}

:deep(.v-chip) {
  min-height: 32px;
}

/* Subtle hover effects */
:deep(.v-btn:hover) {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

:deep(.v-chip:hover) {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* Ensure consistent gap between elements */
.header-controls {
  gap: 8px;
}

/* Enhanced logo and text styling */
:deep(.logo-container) {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Ensure text has proper contrast */
:deep(.v-list-item-title) {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
