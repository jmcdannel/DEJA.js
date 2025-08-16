<script async setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import Throttle from "@/throttle/Throttle.vue";

const route = useRoute();
const address = ref(parseInt(route.params.address?.toString()));
const controls = computed(() =>
  route.query.controls === "slider" ? "slider" : "buttons"
);
</script>

<template>
  <div
    class="@container flex-grow flex flex-col relative overflow-hidden w-full h-full flex-1"
  >
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px] -top-[200px] -left-[300px]"
      ></div>
      <div
        class="absolute w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[80px] -bottom-[100px] -right-[200px]"
      ></div>
      <div
        class="absolute w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[90px] top-[30%] left-[40%]"
      ></div>
    </div>
    <Throttle :address="address" :controls="controls" />
  </div>
</template>
