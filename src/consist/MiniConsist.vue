<script lang="ts" setup>
  import { ref } from 'vue'
  import { 
    IoIosCog,
  } from "vue3-icons/io";
  import { 
    FaChevronCircleLeft,
    FaPlus,
  } from "vue3-icons/fa";

  import type { ConsistLoco, Loco } from '@/throttle/types'
  import { useDejaCloud } from '@/deja-cloud/useDejaCloud'

  import ConsistSettings from './ConsistSettings.component.vue'
  import ConsistAddLoco from './ConsistAddLoco.component.vue'
  import ConsistLocoItem from './ConsistLoco.component.vue'

  const props = defineProps<{
    loco: Object
  }>()

  const { updateConsist } = useDejaCloud()
  
  const settingsRef = ref<HTMLDialogElement | null>(null)
  const addLocoRef = ref<HTMLDialogElement | null>(null)

  function openSettings() {
    settingsRef?.value?.showModal()
  }

  function openAddLoco() {
    addLocoRef?.value?.showModal()
  }

  function handleRemoveLoco(cloco: ConsistLoco) {
    if (props.loco) {
      const newConsist = (props.loco.consist || [])
        .filter((l:ConsistLoco) => l.address !== cloco.address)
      console.log('newConsist', newConsist)
      updateConsist(props.loco.id, newConsist)
    }
  }

  function handleAdjustTrim(cloco: ConsistLoco, trim: number) {
    if (props.loco) {
      const newConsist = (props.loco.consist || []).map((l:ConsistLoco) => {
        if (l.address === cloco.address) {
          l.trim += trim
        }
        return l
      })
      console.log('newConsist', newConsist)
      updateConsist(props.loco.id, newConsist)
    }
  }

  const handleAddLoco = (newAddress: string) => {
    if (props.loco) {
      const newLoco = {
        address: parseInt(newAddress),
        direction: true,
        trim: 0
      }
      const newConsist = [...(props.loco.consist || []), newLoco]
      console.log('newConsist', newConsist, props.loco, props.loco?.id)
      updateConsist(props.loco.id, newConsist)
    }
  }

  function toggleLocoDir(cloco: ConsistLoco, direction:boolean) {
    if (props.loco) {
      const newConsist = (props.loco.consist || []).map((l:ConsistLoco) => {
        if (l.address === cloco.address) {
          l.direction = direction
        }
        return l
      })
      console.log('newConsist', newConsist)
      updateConsist(props.loco.id, newConsist)
    }
  }

  const opacityClasses = {
    10: 'opacity-10',
    20: 'opacity-20',
    30: 'opacity-30',
    40: 'opacity-40',
    50: 'opacity-50',
    60: 'opacity-60',
    70: 'opacity-70',
    80: 'opacity-80',
    90: 'opacity-90',
    100: 'opacity-100',
  }

  const leftOffsetClasses ={
    0: '-left-0',
    2: '-left-2',
    4: '-left-4',
    6: '-left-6',
    8: '-left-8',
    10: '-left-10',
    12: '-left-12',
    14: '-left-14',
    16: '-left-16',
    18: '-left-18',
    20: '-left-20'
  }

</script>
<template>
  <ol class="sm:hidden relative flex -left-2
          justify-center 
          align-middle 
          items-center
          cursor-pointer
          space-between"
          @click="openSettings">
      <template v-if="loco?.consist?.length" v-for="(cloco, index) in loco?.consist" :key="cloco">
        <li 
          :class="`${leftOffsetClasses[index * 2] || '-left-22'} ${opacityClasses[80-(index+1) * 10] || 'opacity-20'}`"
          class="my-1 relative">
          <!-- <button class="btn btn-circle btn-outline btn-xs border-pink-500">
            <FaChevronCircleLeft class="h-5 w-5 fill-pink-500" alt="Left loco" />
          </button> -->
          <div class="ml-1 avatar placeholder">
            <div class=" rounded-full w-8 bg-sky-500 text-white">
              <span class="text-sm">{{ cloco?.address }}</span>
            </div> 
          </div>
        </li>
      </template>
      <template v-else>
        <li class="my-1 relative">
          <div class="ml-1 avatar placeholder">
            <div class=" rounded-full w-8 bg-sky-500 text-white">
              <span class="text-sm">+</span>
            </div> 
          </div>
        </li>
      </template>
    </ol>

  <ConsistSettings 
    ref="settingsRef" 
    @toggle-dir="toggleLocoDir"
    @remove-loco="handleRemoveLoco"
    @adjust-trim="handleAdjustTrim"
    :loco="loco"
  />
  <ConsistAddLoco ref="addLocoRef" @add-loco="handleAddLoco" />
</template>