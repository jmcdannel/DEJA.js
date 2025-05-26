<script setup lang="ts">
import { ref, type PropType } from 'vue'
import type { Loco, Throttle } from '@/throttle/types'
import { useRouter } from 'vue-router'
import { useThrottle } from '@/throttle/useThrottle'
import LocoAvatarButton from './LocoAvatarButton.vue'
import LocoAvatarMenu from './LocoAvatarMenu.vue'
import ThrottleCard from '@/throttle/ThrottleCard.vue'

const emit = defineEmits(['selected'])
const props = defineProps({
  loco: {
    type: Object as PropType<Loco>,
    required: true
  },
  size: {
    type: Number,
    default: 72
  },
  color: {
    type: String,
    default: 'primary'
  },
  showConsist: {
    type: Boolean,
    default: true
  },
  showMenu: {
    type: Boolean,
    default: false
  },
  showCard: {
    type: Boolean,
    default: false
  },
  throttle: {
    type: Object as PropType<Throttle>,
    default: null
  },
  variant: {
    type: String as PropType<'text' | 'flat' | 'elevated' | 'tonal' | 'outlined' | 'plain'>,
    default: 'tonal'
  }
})

const $router = useRouter()
const { acquireThrottle, releaseThrottle, updateSpeed } = useThrottle(props.throttle)

const isMenuOpen = ref(false)
const isThrottleCardOpen = ref(false)

function handleLocoClick() {
  if (props.showCard) {
    isThrottleCardOpen.value = true
  } else if (props.showMenu) {
    isMenuOpen.value = !isMenuOpen.value
  } else {
    emit('selected', props.loco.locoId)
  }
}

async function handleCard() {
  if (!props.throttle) {
    await acquireThrottle(props.loco.locoId)
  }
  isThrottleCardOpen.value = true
}

async function handleFullscreen() {
  isThrottleCardOpen.value = false
  if (!props.throttle) {
    await acquireThrottle(props.loco.locoId)
  }
  $router.push({ name: 'cloud-throttle', params: { address: props.loco.locoId } })
}

async function handleThrottleList() {
  if (!props.throttle) {
    await acquireThrottle(props.loco.locoId)
  }
  $router.push({ name: 'throttle-list' })
}

function handlePark() {
  releaseThrottle(props.loco.locoId)
  $router.push({ name: 'throttle-list' })
}

function handleStop() {
  updateSpeed(props.loco.locoId, 0)
}

</script>
<template>
  <div class="relative flex" v-if="loco">
    <v-speed-dial
      v-model="isMenuOpen"
      location="top center"
      transition="fade-transition"
      :color="loco?.meta?.color || 'primary'"
      contained
      >
      <template #activator>
        <LocoAvatarButton
          :color="loco?.meta?.color || color"
          :loco="loco"
          :size="size"
          :text="loco.locoId?.toString() || '?'"
          :variant="variant"
          @click="handleLocoClick"
        />
      </template>
      <LocoAvatarMenu 
        :loco="loco" 
        :throttle="throttle"
        @showcard="handleCard"
        @fullscreen="handleFullscreen"
        @park="handlePark"
        @stop="handleStop"
        @throttlelist="handleThrottleList"
      />
    </v-speed-dial>
  </div>  
  <v-bottom-sheet v-model="isThrottleCardOpen">
    <ThrottleCard v-if="loco && throttle" 
      @fullscreen="handleFullscreen"
      @park="handlePark"
      :throttle="throttle" 
      :loco="loco" />
  </v-bottom-sheet>
</template>