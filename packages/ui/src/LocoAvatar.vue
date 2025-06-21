<script setup lang="ts">
import { ref, type PropType } from 'vue'
import { useRouter } from 'vue-router'
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
const $router = useRouter()
const isMenuOpen = ref(false)
const color = ref(props.color || props.loco?.meta?.color || 'primary')

</script>
<template>
  <div class="relative flex" v-if="loco">
    <template v-if="!showMenu">
      <v-badge v-if="showConsist && loco?.consist?.length"
        color="primary"
        :content="loco?.consist?.length || 0"
        >
        <v-btn
          :color="loco?.meta?.color || color"
          rounded="circle"
          @click="$emit('select', loco.address)"
          :size="size"
          stacked
          :text="loco.address?.toString() || '?'"
          :variant="variant"
        />
      </v-badge>
      <v-btn v-else
        :color="loco?.meta?.color || color"
        rounded="circle"
          @click="$emit('select', loco.address)"
        :size="size"
        :text="loco.address?.toString() || '?'"
        :variant="variant"
      />  
    </template>
     
    <v-speed-dial v-else
      v-model="isMenuOpen"
      location="left center"
      transition="fade-transition"
      :color="color"
      contained
      >
      <template v-slot:activator="{ props: activatorProps }">
        <v-badge v-if="showConsist && loco?.consist?.length"
          color="primary"
          :content="loco?.consist?.length || 0"
          >
          <v-btn
            :color="loco?.meta?.color || color"
            rounded="circle"
            v-bind="activatorProps"
            :size="size"
            stacked
            :text="loco.address?.toString() || '?'"
            :variant="variant"
          />
        </v-badge>
        <v-btn v-else
          :color="loco?.meta?.color || color"
          rounded="circle"
          v-bind="activatorProps"
          :size="size"
          :text="loco.address?.toString() || '?'"
          :variant="variant"
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