<script setup lang="ts">
import { IoIosCog } from 'vue3-icons/io'
import { BsFillRocketTakeoffFill } from 'vue3-icons/bs'
import { MdOutlineForkLeft } from 'vue3-icons/md'

import { AiFillControl } from 'vue3-icons/ai'

</script>
<template>
  <footer class="relative">
    <slot></slot>
    <div class="btm-nav mx-auto">
      <router-link
        :to="`/locos`"
        custom
        v-slot="{ navigate }"
      >
        <button class="text-primary" :class="{ active: ($route?.name === 'home' || $route?.name === 'throttle') }" @click="navigate" role="link">
          <AiFillControl  class="w-6 h-6 text-pink-500 " />
        </button>
      </router-link>
      <router-link
        :to="`/effects`"
        custom
        v-slot="{ navigate }"
      >
        <button class="text-primary" :class="{ active: ($route?.name === 'effects') }" @click="navigate" role="link">
          <BsFillRocketTakeoffFill  class="w-6 h-6 text-purple-500 stroke-none" />
        </button>
      </router-link>
      <router-link
        :to="`/turnouts`"
        custom
        v-slot="{ navigate }"
      >
        <button class="text-primary" :class="{ active: ($route?.name === 'turnouts') }" @click="navigate" role="link">
          <MdOutlineForkLeft  class="w-6 h-6 text-yellow-400 stroke-none" />
        </button>
      </router-link>
      <router-link
        :to="`/connect`"
        custom
        v-slot="{ navigate }"
      >
        <button class="text-primary" :class="{ active: ($route?.name === 'connect') }" @click="navigate" role="link">
          <IoIosCog  class="w-6 h-6" />
        </button>
      </router-link>
    </div>
  </footer>
</template>