<script lang="ts" setup>
  import { defineEmits, defineProps, ref } from 'vue'
  import Function from './Function.component.vue'
  import { 
    PiHeadlightsFill,
    PiBellFill
  } from 'vue3-icons/pi'
  import { 
    FaBullhorn,
    FaRegStar,
    FaStar,

  } from 'vue3-icons/fa'
  import { RiTrainWifiFill } from 'vue3-icons/ri'
  import Modal from '@/core/Modal.component.vue'
  import type { Loco, LocoFunction } from '@/throttle/types'
  import FunctionIcon from './FunctionIcon.component.vue'

  const icons = [
    { name: 'light', icon: PiHeadlightsFill },
    { name: 'bell', icon: PiBellFill },
    { name: 'horn', icon: FaBullhorn },
    { name: 'wifi', icon: RiTrainWifiFill }
  ]

  const props = defineProps<{
    defaultFunctions: Array<LocoFunction>,
    loco: Loco | null,
  }>()

  const emit = defineEmits(['saveFunctions'])
  
  const menuRefs = ref<HTMLElement[]>([])
  const loco = ref<Loco | null>(props.loco as Loco)
  const _functions = ref(props.defaultFunctions.map(f => ({...f, ...loco.value?.functions.find(lf => lf.id === f.id)})))
  const modalRef = ref<HTMLDialogElement | null>(null)

  function handleLabelBlur() {
    if (loco.value) {
      emit('saveFunctions', _functions.value)      
    }
  }

  function handleFavorite(func: LocoFunction) {
    func.isFavorite = !func.isFavorite
    if (loco.value) {
      emit('saveFunctions', _functions.value)      
    }
  }

  function handleIcon(func: LocoFunction, icon: string, fIdx: number) {
    console.log('handleIcon', { func, icon }, menuRefs.value[fIdx], menuRefs.value[fIdx].attributes)
    func.icon = icon
    if (loco.value) {
      emit('saveFunctions', _functions.value)      
    }
    
    menuRefs.value[fIdx].attributes.removeNamedItem('open')
    
  }
  defineExpose({
    showModal: () => modalRef?.value?.showModal()
  })

</script>
<template>
  <Modal ref="modalRef">
    <h3 class="text-lg font-bold">Functions</h3>
    <hr class="my-2 border-slate-500" />
    <ul v-if="loco?.functions" class="p-2 flex flex-col items-center">
      <li v-for="(func, fIdx) in _functions" :key="func.id"
      
      class=" items-center
        flex 
        justify-center 
        space-between
        p-1
        mr-1
        my-1
        bg-gray-600
        bg-opacity-50
        ">
        <section class="flex items-center justify-center">
          <button @click="() => handleFavorite(func)">
            <FaStar v-if="func.isFavorite" class="w-6 h-6" />
            <FaRegStar v-else class="w-6 h-6" />
          </button>
          <Function :func="func" :address="loco.address" class="mx-2" />

          <input v-model="func.label" class="input input-bordered h-8 w-24 max-w-xs" @blur="handleLabelBlur">
           <details class="dropdown dropdown-end" ref="menuRefs">
            <summary class="btn btn-square ml-2">              
              <template v-if="func.icon">
                <FunctionIcon :icon="func.icon" class="w-5 h-5" />
              </template>
              <template v-else>
                <span class="text-xs">Icon</span>
              </template>
            </summary>
            <ul class="menu dropdown-content bg-base-200 rounded-box z-[1] w-auto p-2 shadow">
              <li v-for="ico in icons" :key="ico.name">
                <button 
                  @click="() => handleIcon(func, ico.name, fIdx)"
                  class="relative btn btn-md btn-square bg-gradient-to-br from-cyan-600 to-indigo-600">
                  <component :is="ico.icon" class="w-6 h-6" />
                </button>
              </li>
            </ul>
          </details>
     
          
        </section>
        <!-- <button class="btn btn-outline mx-1 btn-primary btn-sm py-2">
          <span class="">{{ cloco.address }}</span>
        </button> 
        <section class="rounded-2xl bg-zinc-800 text-xs flex justify-center pr-2 pl-3 items-center">
          <label class="block py-2 text-cyan-400 mr-2">Trim: <strong>{{  cloco.trim }}</strong></label>
          <button class="btn btn-circle btn-info btn-xs" @click="$emit('adjustTrim', cloco, -1)">
            <FaMinus alt="clear layout" class="h-3 w-3" />
          </button>
          <button class="btn btn-circle btn-info btn-xs" @click="$emit('adjustTrim', cloco, 1)">
            <FaPlus alt="clear layout" class="h-3 w-3" />
          </button>
        </section> -->
        <!-- <button class="mx-2 btn btn-sm btn-square">
          <FaTimesCircle alt="clear layout" class="h-3 w-3" @click="$emit('removeLoco', cloco)" />
        </button> -->
      </li>
    </ul>
  </Modal>
</template>