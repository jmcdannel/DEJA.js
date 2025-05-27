<script lang="ts" setup>
import { ref, type PropType } from 'vue'
import { 
  IoIosCog,
} from "vue3-icons/io";
import { 
  FaChevronCircleLeft,
  FaPlus,
} from "vue3-icons/fa";

import type { ConsistLoco, Loco } from '@repo/modules/locos'
import { useLocos } from '@repo/modules/locos'
import ConsistSettings from './ConsistSettings.component.vue'
import ConsistAddLoco from './ConsistAddLoco.component.vue'
import ConsistLocoItem from './ConsistLoco.component.vue'


defineExpose({
  openSettings: () => settingsRef?.value?.showModal()
})

const props = defineProps({
  loco: {
    type: Object as PropType<Loco>,
    required: true
  }
})

const { updateConsist } = useLocos()

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
    props.loco.id && updateConsist(props.loco.id, newConsist)
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
    props.loco.id && updateConsist(props.loco.id, newConsist)
  }
}

const handleAddLoco = (newAddress: string) => {
  console.log('handleAddLoco', newAddress)
  if (props.loco) {
    const newLoco = {
      address: parseInt(newAddress),
      direction: true,
      trim: 0
    }
    const newConsist = [...(props.loco.consist || []), newLoco]
    props.loco.id && updateConsist(props.loco.id, newConsist)

    addLocoRef?.value?.close()
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
    props.loco.id && updateConsist(props.loco.id, newConsist)
  }
}

</script>
<template>  
    <ol 
      class="hidden sm:flex bg-gradient-to-r from-pink-500 to-indigo-800
      flex-row
      m-2
      px-1      
      rounded-3xl">
      <template v-if="loco?.consist?.length > 0">
        <li class="bg-gradient-to-r from-indigo-800 to-indigo-500
          flex 
          justify-center 
          align-middle 
          items-center
          space-between
          rounded-full
          p-1
          mr-1
          my-1
          ">
          <button class="btn btn-circle btn-outline btn-xs border-pink-500">
            <FaChevronCircleLeft class="h-5 w-5 fill-pink-500" alt="Left loco" />
          </button>
          <div class="ml-1 avatar placeholder">
            <div class=" rounded-full w-6 bg-sky-500 text-white">
              <span class="text-sm">{{ loco?.locoId }}</span>
            </div> 
          </div>
        </li>
        <template v-for="cloco in loco?.consist" :key="cloco">
          <ConsistLocoItem 
            :cloco="cloco" 
            @toggle-dir="toggleLocoDir"  />
        </template>
        <li class="bg-purple-600
          flex 
          justify-center 
          align-middle 
          space-between
          rounded-full
          p-1
          mr-1
          my-1
          ">
          <button class="btn btn-circle text-purple-200 btn-xs" @click="openSettings">
            <IoIosCog class="h-5 w-5" />
          </button>
        </li>
      </template>
      <template v-else>
        <li
          class="
            flex
            items-center
            p-1
            mr-1
            my-1
            text-xs
            uppercase
            text-purple-200
          "
        >
          Consist
        </li>
      </template>
      <li class="bg-green-500
        flex 
        justify-center 
        align-middle 
        space-between
        rounded-full
        p-1
        mr-1
        my-1
        ">
        <button class="btn btn-circle text-black btn-outline btn-xs" @click="openAddLoco">
          <FaPlus alt="add loco to consist" class="h-3 w-3" />
        </button>
      </li>
    </ol>

  <ConsistSettings 
    ref="settingsRef" 
    @toggle-dir="toggleLocoDir"
    @remove-loco="handleRemoveLoco"
    @adjust-trim="handleAdjustTrim"
    :loco="loco"
  />
  <ConsistAddLoco ref="addLocoRef" @selected="handleAddLoco" />
</template>