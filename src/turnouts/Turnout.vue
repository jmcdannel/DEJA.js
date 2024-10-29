<script setup lang="ts">
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
  <div class="card card-compact shadow-xl w-full my-1 border-opacity-50 bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500">
    <div class="card-body flex flex-row items-center justify-center">
      <MdOutlineForkLeft class="w-6 h-6 stroke-none"></MdOutlineForkLeft>
      <h2 class="flex-grow text-xl font-bold">{{turnout?.name}}</h2>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text sr-only">Toggle Turnout</span>
          <input type="checkbox" class="toggle toggle-primary bg-yellow-500 hover:bg-indigo-500" @click="handleTurnouts" />
        </label>
      </div>
      <!-- <p>{{ turnout?.type }}</p>
      <p>{{ turnout?.device }}</p> -->
    </div>
  </div>
</template>
