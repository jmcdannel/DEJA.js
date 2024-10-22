<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTurnouts } from '@/Turnouts/useTurnouts'
import { useLayout } from '@/Layout/useLayout'
import { useEfx } from '@/Effects/useEfx'
import { BsCpu } from 'vue3-icons/bs'

const props = defineProps<{
  turnout: Object
}>()
const emit = defineEmits(['close'])
const DEFAULT_DEVICE = 'dccex'
const DEFAULT_TYPE = 'kato'

const { getEffects } = useEfx()
const { getDevices } = useLayout()
const { setTurnout } = useTurnouts()

const devices = getDevices()
const effects = getEffects()

const turnoutId = ref(props.turnout?.id || '')
const name = ref(props.turnout?.name || '')
const desc = ref(props.turnout?.desc || '')
const index = ref(props.turnout?.turnoutIdx || '')
const effectId = ref(props.turnout?.effectId || '')
const device = ref(props.turnout?.device || DEFAULT_DEVICE)
const straight = ref(props.turnout?.straight || '')
const divergent = ref(props.turnout?.divergent || '')
const turnoutType = ref(DEFAULT_TYPE)
const loading = ref(false)
const rules = {
  required: [(val) => !!val || 'Required.']
}

const effectOptions = effects?.value.map((efx) => ({
  title: `${efx.name} [${efx.id}]`,
  value: efx.id
}))

watch(name, autoId)
watch(device, autoId)
watch(index, autoId)

function autoId() {
  turnoutId.value = name.value && device.value && index.value 
    ? `${slugify(name.value)}-${slugify(index.value)}-${slugify(device.value)}` 
    : ''
}

async function submit (e) {
  loading.value = true
  const results = await e
  if (results.valid) {
    const turnout = {
      device: device.value,
      name: name.value,
      desc: desc.value,
      turnoutIdx: index.value,
      effectId: effectId.value?.value || null,
      ['type']: turnoutType.value,
      state: false,
      straight: straight.value,
      divergent: divergent.value
    }
    await setTurnout(props.turnout?.id || turnoutId.value, turnout)
    console.log(turnout)
    loading.value = false
    reset()
    emit('close')
  } else {
    reset()
    loading.value = false
  }
}

function handleClose() {
  reset()
  emit('close')
}

function reset(){
  turnoutId.value = ''
  name.value = ''
  desc.value = ''
  index.value = ''
  effectId.value = ''
  device.value = DEFAULT_DEVICE
  straight.value = ''
  divergent.value = ''
  turnoutType.value = DEFAULT_TYPE
}

function slugify(str: string) {
  str = str.replace(/^\s+|\s+$/g, '') // trim leading/trailing white space
  str = str.toLowerCase() // convert string to lowercase
  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // remove consecutive hyphens
  return str
}


  const turnoutTypes = ['kato', 'servo']
</script>
<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <v-divider class="my-4 border-yellow-500"></v-divider>
    <v-label class="m-2 text-yellow-400 text-2xl">{{ props.turnout ? 'Edit' : 'Add'}} Turnout</v-label>
    <v-divider class="my-4 border-yellow-500"></v-divider>
    <v-btn-toggle v-model="turnoutType" divided class="flex-wrap h-auto" size="x-large" mandatory>
      <v-btn v-for="opt in turnoutTypes" :value="opt" :key="opt"
        class="min-h-48 min-w-48 border"
        color="yellow">
        <div class="flex flex-col">
          <div class="mt-4">{{ opt }}</div>
        </div>
        
      </v-btn>
    </v-btn-toggle>
    <v-divider class="my-4 border-yellow-500"></v-divider>
    <v-label class="m-2">Device</v-label>
    <v-divider class="my-4 border-yellow-500"></v-divider>
    <v-btn-toggle v-model="device" divided class="flex-wrap h-auto" size="x-large">
        <v-btn v-for="device in devices" :value="device.id" :key="device.id" 
          class="min-h-48 min-w-48 border"
          color="yellow" >
          <!-- <v-icon :icon="efxOpt.icon" :color="efxOpt.color"></v-icon> -->
          <div class="flex flex-col justify-center items-center">
            <BsCpu class="w-16 h-16 stroke-none "></BsCpu>
            <div class="mt-4">{{ device.id }}</div>
          </div>        
        </v-btn>
    </v-btn-toggle>
    <v-divider class="my-4"></v-divider>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <v-text-field
        v-model="name"
        label="Name"
        variant="outlined"
          color="yellow"
        :rules="rules.required"
      ></v-text-field>
      <v-text-field
          v-model="index"
          label="Index"
          variant="outlined"
          min-width="100"
          max-width="200"
          color="yellow"
          :rules="rules.required"
        >
      </v-text-field>
      <v-text-field
        v-model="desc"
        label="Description"
        variant="outlined"
          color="yellow"
      ></v-text-field>
      <v-text-field
        v-model="turnoutId"
        label="ID"
        variant="outlined"
        color="yellow"
        :rules="rules.required"
        :disabled="!!props.turnout?.id"
      ></v-text-field>
      <v-text-field
          v-model="straight"
          label="Straight"
          variant="outlined"
          min-width="100"
          max-width="200"
          color="yellow"
          :rules="rules.required"
        >
      </v-text-field>
      <v-text-field
        v-model="divergent"
        label="Divergent"
        variant="outlined"
        min-width="100"
        max-width="200"
          color="yellow"
          :rules="rules.required"
      >
      </v-text-field>
      <v-combobox
        class="col-span-2"
        v-model="effectId"
        label="Effect"
        variant="outlined"
        :items="effectOptions"
        clearable
      ></v-combobox>
    </div>
    
    <v-divider class="my-4"></v-divider>
    <!-- <v-icon :icon="efxType?.icon"></v-icon> -->
    <div class="grid grid-cols-2 gap-8 my-4">   
      <v-btn
        class="mt-2"
        text="Close"
        type="button"
        variant="tonal"
        @click="handleClose"
        block
      ></v-btn>
      <v-btn
        :loading="loading"
        class="mt-2"
        text="Submit"
        type="submit"
        color="yellow"
        block
      ></v-btn>  
    </div>
  </v-form>
</template>