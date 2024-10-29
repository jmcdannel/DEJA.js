<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEfx } from '@/api/useEfx'

const { efxTypes, runEffect } = useEfx()

const props = defineProps({
  efx: Object,
  efxId: String,
})


const efxType = computed(() => efxTypes.find((type) => type.value === props?.efx?.type))

async function handleEfx (event: Event) {
  console.log('handleEfx', props.efx, props.efx?.id, event, event?.target?.checked)
  props?.efx && props?.efxId && await runEffect({
      ...props.efx,
      id: props.efxId,
      state: event?.target?.checked
  })
}

</script>
<template>
  <div class="card card-compact shadow-xl w-full my-1 bg-gradient-to-r from-rose-950 to-slate-900 border border-rose-500">
    <div class="card-body flex flex-row items-center justify-center">
      <!-- <component :is="efxType?.icon" class="w-6 h-6 stroke-none"></component> -->
      <h2 class="flex-grow text-xl font-bold">{{efx?.name}}</h2>
      <!-- <p>{{ efxId }}</p> -->
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text sr-only">Remember me</span>
          <input type="checkbox" class="toggle toggle-primary bg-rose-500 hover:bg-red-400" @click="handleEfx" />
        </label>
      </div>
      <!-- <p>{{ efxType?.label }}</p>
      <p>{{ efx?.device }}</p> -->
    </div>
  </div>
</template>
