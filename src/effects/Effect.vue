<script setup lang="ts">
import { ref } from 'vue'
import { useEfx } from '@/api/useEfx'

const { runEffect, getEfxType } = useEfx()

const props = defineProps({
  efx: Object,
  efxId: String,
})

const state = ref(props.efx?.state)
const efxType = ref(getEfxType(props.efx?.type))

async function handleEfx (event: Event) {
  const target = event.target as HTMLInputElement
  console.log('handleEfx', props.efx, props.efx?.id, event, target.checked)  
  await runEffect({
      ...props.efx,
      id: props.efxId,
      state: target.checked
  })
}

</script>
<template>
  <div class="shadow-xl my-1 p-[1px] bg-gradient-to-r from-indigo-400 to-pink-900 rounded-full">
    <div class="flex flex-row items-center justify-center bg-gray-900 bg-opacity-95 rounded-full px-2">
      <component :is="efxType?.icon" class="w-6 h-6 stroke-none mr-2" :color="efxType?.color"></component>
      <h4 class="flex-grow text-md font-bold">{{efx?.name}}</h4>
      <v-switch v-model="state" @change="handleEfx" hide-details />
      <!-- <p>{{ efxId }}</p> -->
      <!-- <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text sr-only">Remember me</span>
          <input type="checkbox" class="toggle toggle-primary bg-rose-500 hover:bg-red-400" @click="handleEfx" />
        </label>
      </div> -->
      <!-- <p>{{ efxType?.label }}</p>
      <p>{{ efx?.device }}</p> -->
    </div>
  </div>
</template>
