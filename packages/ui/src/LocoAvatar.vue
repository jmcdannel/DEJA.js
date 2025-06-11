<script setup lang="ts">
import { ref, type PropType } from 'vue'
import type { Loco } from '@repo/modules/locos'

const emit = defineEmits(['select', 'park', 'stop'])
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
    required: false,
  },
  showConsist: {
    type: Boolean,
    default: true
  },
  showMenu: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String as PropType<'text' | 'flat' | 'elevated' | 'tonal' | 'outlined' | 'plain'>,
    default: 'tonal'
  }
})

const isMenuOpen = ref(false)
const color = ref(props.color || props.loco?.meta?.color || 'primary')

function handleLocoClick() {
  console.debug('LocoAvatar clicked', props.loco.address)
  if (props.showMenu) {
    isMenuOpen.value = !isMenuOpen.value
  } else {
    emit('select', props.loco.address)
  }
}

</script>
<template>
  <div class="relative flex" v-if="loco">
    <v-speed-dial
      v-model="isMenuOpen"
      location="top center"
      transition="fade-transition"
      :color="color"
      contained
      >
      <template #activator>        
        <v-badge v-if="loco.consist?.length && showConsist" 
          color="primary"
          :content="loco?.consist?.length || 0"
          offset-x="5"
          offset-y="5"
          >
          <v-btn
            :color="loco?.meta?.color || color"
            rounded="circle"
            :size="size"
            stacked
            :text="loco.address?.toString() || '?'"
            :variant="variant"
            @select="handleLocoClick"
          />
        </v-badge>
        <v-btn v-else
          :color="loco?.meta?.color || color"
          rounded="circle"
          :size="size"
          stacked
          :text="loco.address?.toString() || '?'"
          :variant="variant"
          @select="handleLocoClick"
        />  
      </template>
      <v-btn 
        key="1" 
        @click="$router.push({ name: 'throttle', params: { address: loco.address } })"
        :color="color"
        icon="mdi-gamepad-square"
      />
      <v-btn 
        key="3"
        @click="$router.push({ name: 'throttle-list' })"
        :color="color"
        icon="mdi-view-sequential-outline" 
      />
      <v-btn 
        key="4" 
        @click="$emit('park')"
        :color="color"
        icon="mdi-parking"
      />
      <v-btn 
        key="5" 
        @click="$emit('stop')"
        :color="color"
        icon="mdi-stop-circle-outline"
      />
    </v-speed-dial>
  </div>
</template>