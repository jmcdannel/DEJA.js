<script setup lang="ts">
import { ref } from 'vue'
import { useEfx } from '@repo/modules/effects'
import ViewJson from '@/Core/UI/ViewJson.vue'
import RouteTurnoutForm from '@/Routes/RouteTurnoutForm.vue'
import ColorPicker from '@/Common/Color/ColorPicker.vue'
import type { IEfx } from '@/Effects/types'
import TagPicker from '@/Common/Tags/TagPicker.vue'
import { slugify } from '@repo/utils/slugify'
// TODO: icon picker

const props = defineProps<{
  efx: IEfx
}>()

const emit = defineEmits(['close'])

const { setEfx, efxTypes, getEfxType, DEFAULT_TYPE } = useEfx()

const editColor = ref(false)

const name = ref(props.efx?.name || '')
const point1 = ref(props.efx?.point1)
const point2 = ref(props.efx?.point2)
const macroOn = ref(props.efx?.on || [])
const macroOff = ref(props.efx?.off || [])
const efxType = ref('route')
const efxTypeObj = ref(props.efx?.type ?  getEfxType(props.efx?.type) : DEFAULT_TYPE)
const color = ref(props.efx?.color || efxTypeObj.value?.color || 'purple')  
const tags = ref<string[]>(props.efx?.tags || [])
const loading = ref(false)
const rules = {
  required: [(val) => !!val || 'Required.']
}

async function submit () {
  loading.value = true

  const newEfx: IEfx = {
    name: name.value,
    type: efxType.value,
    color: color.value,
    tags: tags.value,
  }
  //  set pin
  newEfx.point1 = point1.value || ''
  newEfx.point2 = point2.value || ''

  //  set macro
  newEfx.on = macroOn.value
  newEfx.off = macroOff.value
 
  await setEfx(props.efx?.id || `route-${slugify(newEfx.point1)}-${slugify(newEfx.point2)}`, newEfx)

  console.log(props.efx, newEfx)
  loading.value = false
  emit('close')
}

function handleMacro({on , off}: {on: string[], off: string[]}) {
  console.log('handleMacro', on, off)
  macroOn.value = on
  macroOff.value = off
}

</script>
<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <div class="flex items-center justify-between">
      <v-label class="m-2 text-4xl">
        <component v-if="efxTypeObj?.icon" :is="efxTypeObj?.icon" :color="color" class="w-16 h-16 stoke-none mr-4"></component>
        {{ efx ? 'Edit' : 'Add'}} Route
      </v-label>
      <v-chip class="m-2" :color="color" size="x-large">
        <v-icon v-if="efxTypeObj?.icon" :icon="efxTypeObj.icon" class="mr-2"></v-icon>
        {{ efxType }}
      </v-chip>
    </div>
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>

    <!-- name -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <v-text-field
        v-model="name"
        label="Name"
        variant="outlined"
        :rules="rules.required"
      ></v-text-field>
      <div class="grid grid-cols-2 gap-4">
        <v-text-field
            v-model="point1"
            label="Point 1"
            variant="outlined"
            min-width="100"
            max-width="200"
          >
        </v-text-field>

        <v-text-field
            v-model="point2"
            label="Point 2"
            variant="outlined"
            min-width="100"
            max-width="200"
          >
        </v-text-field>
      </div>
    </div>
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <RouteTurnoutForm @change="handleMacro" :on="macroOn" :off="macroOff"></RouteTurnoutForm>

    <!-- color -->
    <section class="h-auto  my-4">
      <v-btn
        class="min-h-48 min-w-48 border flex"
        :color="color"
        @click="editColor = true" >
        <!-- <v-icon :icon="efxOpt.icon" :color="efxOpt.color"></v-icon> -->
        <div class="relative flex flex-col justify-center items-center">
          <v-icon size="64">mdi-palette</v-icon>
          <div class="mt-4">Color [{{ color }}]</div>
        </div>        
      </v-btn>
    </section>
    <v-dialog max-width="80vw" v-model="editColor">
      <ColorPicker v-model="color" @select="editColor = false" @cancel="editColor = false; color = props.turnout?.color ?? 'purple'"></ColorPicker>
    </v-dialog>

    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <TagPicker class="my-4 " v-model="tags"></TagPicker>
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 my-4">
      <v-btn
        class="mt-2"
        text="Close"
        type="button"
        variant="tonal"
        @click="$emit('close')"
      ></v-btn>
      <v-btn
        :loading="loading"
        class="mt-2"
        text="Submit"
        type="submit"
        :color="color"
      ></v-btn>  
    </div>
    <ViewJson :json="efx" label="Efx" />
    <ViewJson :json="efxTypeObj" label="efxTypeObj" />
    <ViewJson :json="efxTypes" label="efxTypes" />
  </v-form>
</template>