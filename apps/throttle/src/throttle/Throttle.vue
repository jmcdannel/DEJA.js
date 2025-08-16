<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { Loco } from "@repo/modules/locos";
import CurrentSpeed from "@/throttle/CurrentSpeed.vue";
import ThrottleHeader from "@/throttle/ThrottleHeader.vue";
import ThrottleActionMenu from "@/throttle/ThrottleActionMenu.vue";
import { Consist, LocoAvatar, MiniConsist, FunctionsSpeedDial } from "@repo/ui";
import { useThrottle } from "@/throttle/useThrottle";
import ThrottleControls from "@/throttle/ThrottleControls.vue";

const props = defineProps({
  address: {
    type: Number,
    required: true,
  },
  controls: {
    type: String,
    default: "buttons",
  },
});

const {
  adjustSpeed: handleAdjustSpeed,
  currentSpeed,
  direction,
  loco,
  releaseThrottle,
  stop: handleStop,
  throttle,
} = useThrottle(props.address);

const $router = useRouter();
// const consistCmp = ref<InstanceType<typeof Consist> | null>(null)
// const functionsCmp = ref<InstanceType<typeof Functions> | null>(null)

async function clearLoco() {
  handleStop();
  releaseThrottle();
  $router.push({ name: "throttle-list" });
}

function openFunctions() {
  // functionsCmp.value && functionsCmp.value.openAll()
}

function openConsist() {
  // consistCmp.value && consistCmp.value.openSettings()
}

function openFunctionSettings() {
  // functionsCmp.value && functionsCmp.value.openSettings()
}
</script>
<template>
  <main
    v-if="throttle"
    class="flex flex-col gap-2 p-2 overflow-hidden w-full h-full flex-1 shadow-xl relative"
  >
    <!-- <pre>locoDocId:{{locoDocId}}</pre>-->
    <!-- <pre>loco:{{loco.functions}}</pre>  -->
    <!-- <pre>currentSpeed {{ currentSpeed }}</pre> -->
    <!-- <pre>throttleDir {{ throttleDir }}</pre> -->
    <!-- <pre>props.throttle {{ props.throttle }}</pre> -->
    <ThrottleHeader
      class="bg-gradient-to-r from-purple-300/10 to-pink-600/10 text-purple-400/10"
    >
      <template v-slot:left>
        <LocoAvatar
          v-if="loco"
          :loco="loco as Loco"
          :size="48"
          @park="clearLoco"
          @stop="handleStop"
        />
        <MiniConsist v-if="loco" :loco="loco" />
      </template>
      <template v-slot:center>
        <h1
          class="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 drop-shadow-lg"
        >
          {{ loco?.name }}
        </h1>
      </template>
      <template v-slot:right>
        <ThrottleActionMenu
          @park="clearLoco"
          @functions="openFunctions"
          @consist="openConsist"
        />
      </template>
    </ThrottleHeader>
    <section
      class="throttle w-full h-full flex flex-row justify-around flex-grow relative z-10"
    >
      <section
        v-if="loco"
        class="flex flex-col gap-2 mb-2 items-center justify-between flex-1/2 sm:flex-1"
      >
        <Consist v-if="loco" :loco="loco" />
        <v-spacer />
        <FunctionsSpeedDial :loco="loco" />
      </section>
      <section
        class="flex flex-col gap-2 mb-2 items-center justify-between flex-1/2 sm:flex-1"
      >
        <CurrentSpeed :speed="currentSpeed" />
        <ThrottleControls
          :type="controls"
          :speed="currentSpeed"
          :direction="direction"
          @update:currentSpeed="handleAdjustSpeed"
          @stop="handleStop"
        />
      </section>
    </section>
  </main>
</template>
