<script setup lang="ts">
import { ref } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useTurnouts } from '@/api/useTurnouts'
import { MdOutlineForkLeft } from 'vue3-icons/md'

const { switchTurnout } = useTurnouts()

const props = defineProps({
  turnout: Object,
  turnoutId: String,
})

const state = ref(props.turnout?.state)
const isRunning = ref(false)

async function handleTurnouts (event: Event) {
  console.log('handleTurnouts', props.turnout, props.turnout?.id, event, event?.target?.checked)
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  isRunning.value = isPending.value
  await switchTurnout({...props.turnout, id: props.turnoutId, state: event?.target?.checked})
}

</script>
<template>
  <div 
    class="shadow-xl my-1 p-[1px] rounded-full"
    :class="isRunning ? 'bg-gradient-to-r from-indigo-400 to-pink-900 ' : 'bg-yellow-500'"
    >
    <div 
      class="flex flex-row items-center justify-center rounded-full px-2 bg-gray-900 "
      :class="isRunning ? 'shadow-inner shadow-pink-500 bg-opacity-80' : 'bg-opacity-95'"
      >
      <MdOutlineForkLeft class="w-6 h-6 stroke-none"></MdOutlineForkLeft>
      <h4 class="text-md font-bold mr-2">{{turnout?.name}}</h4>
      <p class="text-xs text-yellow-400 flex-grow">{{ turnout.desc }}</p>
      <aside>
        <v-switch v-model="state" @change="handleTurnouts" :disabled="isRunning" :loading="isRunning" hide-details />
      </aside>
    </div>
  </div>
</template>
