<script lang="ts" setup>
import { ref } from 'vue'
import Function from './Function.vue'
import { 
  FaRegStar,
  FaStar,
} from 'vue3-icons/fa'
import Modal from '@/core/Modal.component.vue'
import type { Loco, LocoFunction } from '@repo/modules/locos'
import { FUNCTION_ICONS, defaultFunctions } from '@repo/modules/locos'
import FunctionIcon from './FunctionIcon.component.vue'

const props = defineProps<{
  loco: Loco | null,
}>()

const emit = defineEmits(['saveFunctions'])

const menuRefs = ref<HTMLElement[]>([])
const _functions = ref(defaultFunctions.map(f => ({...f, ...props.loco?.functions?.find(lf => lf.id === f.id)})))
const modalRef = ref<HTMLDialogElement | null>(null)

function handleLabelBlur() {
  emit('saveFunctions', _functions.value)
}

function handleFavorite(func: LocoFunction) {
  func.isFavorite = !func.isFavorite
  emit('saveFunctions', _functions.value)
}

function handleIcon(func: LocoFunction, icon: string, fIdx: number) {
  func.icon = icon
  console.log('handleIcon', { func, icon }, menuRefs.value[fIdx], menuRefs.value[fIdx].attributes,  _functions.value)
  emit('saveFunctions', _functions.value)
  
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
    <ul v-if="loco" class="p-2 flex flex-col items-center">
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
          <Function :func="func" :address="loco.locoId" class="mx-2" />

          <input v-model="func.label" class="input input-bordered h-8 min-w-28 w-full max-w-xs" @blur="handleLabelBlur">
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
              <li v-for="ico in FUNCTION_ICONS" :key="ico.name">
                <button 
                  @click="() => handleIcon(func, ico.name, fIdx)"
                  class="relative btn btn-md btn-square bg-gradient-to-br from-cyan-600 to-indigo-600">
                  <v-icon size="16" class="stroke-none">
                    {{ ico.icon }}
                  </v-icon>
                </button>
              </li>
            </ul>
          </details>
        </section>
      </li>
    </ul>
  </Modal>
</template>