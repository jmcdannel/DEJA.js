<script setup lang="ts">
import { ref } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useTurnouts } from '@/api/useTurnouts'
import { MdOutlineForkLeft } from 'vue3-icons/md'

const { switchTurnout } = useTurnouts()

const props = defineProps({
  turnout: Object,
  turnoutId: String
})

const state = ref(props.turnout?.state)
const isRunning = ref(false)

async function handleTurnouts (event: Event) {
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  isRunning.value = isPending.value
  const target = event.target as HTMLInputElement;
  await switchTurnout({...props.turnout, id: props.turnoutId, state: target.checked})
}

</script>
<template>
  <v-card 
    class="shadow-xl my-1 p-[1px] rounded-full"
    :class="isRunning ? 'bg-gradient-to-r from-indigo-400 to-pink-900 ' : ''"
    :color="turnout?.color || 'primary'"
    >
    <v-card-title 
      class="flex flex-row items-center justify-between rounded-full px-2 bg-gray-900 bg-opacity-40"
      :class="isRunning ? 'shadow-inner shadow-pink-500 bg-opacity-80' : 'bg-opacity-95'"
      >
      <MdOutlineForkLeft class="w-6 h-6 stroke-none"></MdOutlineForkLeft>
      <h4 class="text-md font-bold mr-2">{{turnout?.name}}</h4>
      <aside>
        <v-switch v-model="state" @change="handleTurnouts" :color="turnout?.color || 'primary'" :disabled="isRunning" :loading="isRunning" hide-details />
      </aside>
    </v-card-title>
  </v-card>
</template>
