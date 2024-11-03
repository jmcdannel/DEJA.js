<script setup lang="ts">
import { ref } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useTurnouts } from '@/api/useTurnouts'
import { MdOutlineForkLeft } from 'vue3-icons/md'
// import { useEfx } from '@/api/useEfx'

const { switchTurnout } = useTurnouts()
// const { runEffect, getEffect } = useEfx()

const props = defineProps({
  turnout: Object,
  turnoutId: String,
})

const state = ref(props.turnout?.state)

async function handleTurnouts (event: Event) {
  console.log('handleTurnouts', props.turnout, props.turnout?.id, event, event?.target?.checked)

  await switchTurnout({...props.turnout, id: props.turnoutId, state: event?.target?.checked})
  if (props.turnout?.effectId) {
    useTimeoutFn(async () => {
      // const effect = await getEffect(props.turnout?.effectId)
      // await runEffect({...effect, state: event?.target?.checked})
    }, 2000)
  }
}

</script>
<template>
  <div class="shadow-xl my-1 p-[1px] bg-gradient-to-r from-indigo-400 to-pink-900 rounded-full">
    <div class="flex flex-row items-center justify-center bg-gray-900 bg-opacity-95 rounded-full px-2">
      <MdOutlineForkLeft class="w-6 h-6 stroke-none"></MdOutlineForkLeft>
      <h4 class="flex-grow text-md font-bold">{{turnout?.name}}</h4>
      <aside>
        <v-switch v-model="state" @change="handleTurnouts" hide-details />
      </aside>
    </div>
  </div>
</template>
