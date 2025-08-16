<script setup lang="ts">
import ThrottleButtonControls from "./ThrottleButtonControls.vue";
import ThrottleSliderControls from "./ThrottleSliderControls.vue";

const props = defineProps({
  type: {
    type: String,
    default: "buttons",
  },
  speed: {
    type: Number,
    default: 0,
  },
  direction: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  horizontal: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:currentSpeed", "stop"]);
</script>
<template>
  <ThrottleSliderControls
    v-if="type === 'slider'"
    :speed="speed"
    :direction="direction"
    :disabled="disabled"
    @update:currentSpeed="emit('update:currentSpeed', $event)"
    @stop="emit('stop')"
  />
  <ThrottleButtonControls
    v-else
    :disabled="disabled"
    :horizontal="horizontal"
    @update:currentSpeed="emit('update:currentSpeed', $event)"
    @stop="emit('stop')"
  />
</template>
