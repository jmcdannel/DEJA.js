<script setup lang="ts">
import { ref } from 'vue'
import { useEfx } from '@/api/useEfx'

const { runEffect } = useEfx()

const props = defineProps({
  efx: Object,
  efxId: String,
})

const state = ref(props.efx?.state)

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
  <div v-if="efx" class="card card-compact shadow-xl w-full my-1 bg-gradient-to-r from-rose-950 to-slate-900 border border-rose-500">
    <div class="card-body flex flex-row items-center justify-center">
      <!-- <component :is="efxType?.icon" class="w-6 h-6 stroke-none"></component> -->
      <h2 class="flex-grow text-xl font-bold">{{efx?.name}}</h2>
      <v-switch v-model="state" @change="handleEfx" />
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
