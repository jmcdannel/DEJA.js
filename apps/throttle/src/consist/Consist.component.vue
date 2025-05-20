<script lang="ts" setup>
  import { defineProps, defineEmits, ref } from 'vue';

  import { 
    IoIosCog,
  } from "vue3-icons/io";
  import { 
    FaChevronCircleLeft,
    FaPlus,
  } from "vue3-icons/fa";

  import type { ConsistLoco, Loco } from '@/throttle/types'

  import ConsistSettings from './ConsistSettings.component.vue'
  import ConsistAddLoco from './ConsistAddLoco.component.vue'
  import ConsistLocoItem from './ConsistLoco.component.vue'

  const props = defineProps({
    locos: {
      type: Array,
      required: true
    },
    loco: {
      type: Object,
      required: true
    }
  })

  const locos = ref<Loco[]>(props.locos as Loco[])
  const loco = ref<Loco | null>(props.loco as Loco)
  const settingsRef = ref<HTMLDialogElement | null>(null)
  const addLocoRef = ref<HTMLDialogElement | null>(null)

  function openSettings() {
    settingsRef?.value?.showModal()
  }

  function openAddLoco() {
    addLocoRef?.value?.showModal()
  }

  function handleRemoveLoco(cloco: ConsistLoco) {
    if (loco.value) {
      loco.value.consist = loco.value.consist.filter(l => l.address !== cloco.address)
      // localStorage.setItem('@DEJA/locos', JSON.stringify(locos.value))
    }
  }

  function handleAdjustTrim(cloco: ConsistLoco, trim: number) {
    if (loco.value) {
      loco.value.consist.map(l => {
        if (l.address === cloco.address) {
          l.trim += trim
        }
        return l
      })
      // localStorage.setItem('@DEJA/locos', JSON.stringify(locos.value))
    }
  }

  const handleAddLoco = (newAddress: string) => {
    if (loco.value && newAddress) {
      loco.value.consist = [...loco.value.consist, { address: parseInt(newAddress), direction: true, trim: 0 }];
      // localStorage.setItem('@DEJA/locos', JSON.stringify(locos.value));
    }
  }

  function toggleLocoDir(cloco: ConsistLoco, direction:boolean) {
    if (loco.value) {
      loco.value.consist.map(l => {
        if (l.address === cloco.address) {
          l.direction = direction
        }
        return l
      })
      // localStorage.setItem('@DEJA/locos', JSON.stringify(locos.value))
    }
  }

</script>
<template>
  <ol v-if="loco"
      class="bg-gradient-to-r from-pink-500 to-indigo-800
      flex 
      flex-row
      flex-wrap 
      mr-2
      px-1      
      rounded-3xl">
      <template v-if="loco.consist.length > 0">
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
              <span class="text-sm">{{ loco.address }}</span>
            </div> 
          </div>
        </li>
        <template v-for="cloco in loco.consist" :key="cloco">
          <ConsistLocoItem 
            :cloco="cloco" 
            @toggle-dir="toggleLocoDir"  />
        </template>
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
      <template v-if="loco.consist.length > 0">
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
    </ol>

    <ConsistSettings 
      v-if="loco"
      ref="settingsRef" 
      @toggle-dir="toggleLocoDir"
      @remove-loco="handleRemoveLoco"
      @adjust-trim="handleAdjustTrim"
      :loco="loco"
    />
    <ConsistAddLoco ref="addLocoRef" :locos="locos" @add-loco="handleAddLoco" />

</template>