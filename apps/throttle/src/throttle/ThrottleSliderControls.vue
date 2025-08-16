<script setup lang="ts">
import { ref, toRef, watch } from "vue";
import { debounce } from "vue-debounce";
import ThrottleSlider from "./ThrottleSlider.vue";

const DEBOUNCE_DELAY = 1000; // debounce speed changes by 100ms to prevent too many requests

const emit = defineEmits(["update:currentSpeed", "stop"]);

const props = defineProps({
  speed: {
    type: Number,
    required: true,
  },
  direction: {
    type: Boolean,
    default: null, // null means no direction set
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const speed = toRef(props, "speed");
const direction = toRef(props, "direction");
const setSpeed = debounce((val: number): void => {
  emit("update:currentSpeed", val);
}, `${DEBOUNCE_DELAY}ms`);

function setSliderSpeed(val: number): void {
  // handle slider changes
  const signed = direction.value ? val : -val;
  setSpeed(parseInt(signed.toString())); // debounced speed changes
}
function handleForward() {
  console.log("forward");
  emit("stop");
}

function handleReverse() {
  console.log("reverse");
  emit("stop");
}

// function handleSliderUpdate(val: number) {
//   if (direction.value === null) {
//     return
//   } else if (direction.value === true) {
//     emit('update:currentSpeed', val)
//   } else if (direction.value === false) {
//     emit('update:currentSpeed', -val)
//   }
// }

function isDisabled() {
  return props.direction === null;
}
</script>
<template>
  <div class="flex flex-col h-full justify-end">
    <ThrottleSlider
      :speed="speed"
      :disabled="isDisabled()"
      :label="direction ? 'FWD' : 'REV'"
      @update="setSliderSpeed"
      @stop="$emit('stop')"
    />
    <div class="flex mt-4 align-middle justify-center">
      <v-btn @click="handleReverse" prepend-icon="mdi-chevron-left">Rev</v-btn>
      <v-btn @click="handleForward" append-icon="mdi-chevron-right">Fwd</v-btn>
    </div>
  </div>
</template>
<style scoped></style>
