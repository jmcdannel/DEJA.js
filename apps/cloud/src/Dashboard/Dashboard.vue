<script setup lang="ts">
import { computed } from 'vue'
import { useCurrentUser } from 'vuefire';
import { useRouter } from 'vue-router'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'
import DeviceStatusList from '@repo/ui/src/DeviceStatus/DeviceStatusList.vue'
import { useLayout } from '@repo/modules'

const user = useCurrentUser()
const router = useRouter()
const { getDevices } = useLayout()
const devices = getDevices()

const hasDccExDevice = computed(() =>
  devices.value?.some((device) => device.type === 'dcc-ex')
)

function handleDisconnect() {
  router.push('/')
}

function handleGoToLayout() {
  router.push({ name: 'Layout' })
}

</script>
<template>
  <div class="animate-fade-in-up">
    <ModuleTitle menu="Dashboard" />
    <template v-if="user">
      <template v-if="hasDccExDevice">
        <DeviceStatusList @disconnect="handleDisconnect" class="glass-dark rounded-2xl shadow-soft-dark p-6 mt-4" />
      </template>
      <template v-else>
        <div class="glass-dark rounded-3xl shadow-soft-dark p-8 mt-6 transition-all duration-300 hover:shadow-glow-cyan border border-brand-cyan/20">
          <EmptyState
            icon="mdi-memory"
            color="cyan"
            title="Set Up Your Command Station"
            description="Connect a DCC-EX CommandStation device to your layout to start controlling trains, turnouts, signals, and effects from the cloud."
            :use-cases="[{ icon: 'mdi-speedometer', text: 'Monitor layout status' }, { icon: 'mdi-devices', text: 'Track connected devices' }, { icon: 'mdi-chart-line', text: 'System health overview' }]"
            action-label="Go to Layout Setup"
            action-to="/layout"
            @action="handleGoToLayout"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>