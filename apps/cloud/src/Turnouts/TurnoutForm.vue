<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTurnouts } from '@/Turnouts/useTurnouts'
import { useLayout } from '@/Layout/useLayout'
import { useEfx } from '@/Effects/useEfx'
import { ITurnout } from '@/Turnouts/types'
import { slugify } from '@/Common/Utils'
import TurnoutTypePicker from '@/Turnouts/TurnoutTypePicker.vue'
import DevicePicker from '@/Layout/Devices/DevicePicker.vue'
import EffectPicker from '@/Effects/EffectPicker.vue'
import ColorPicker from '@/Common/Color/ColorPicker.vue'
import TagPicker from '@/Common/Tags/TagPicker.vue'
import ViewJson from '@/Core/UI/ViewJson.vue'

const props = defineProps<{
  turnout: ITurnout
}>()
const emit = defineEmits(['close'])
const DEFAULT_DEVICE = 'dccex'
const DEFAULT_TYPE = 'kato'

const { getEffects } = useEfx()
const { getDevices } = useLayout()
const { setTurnout } = useTurnouts()

const devices = getDevices()
const effects = getEffects()

const editColor = ref(false)
const editEffect = ref(false)
const editType = ref(false) // TODO: remove - don't allow this to be changed
const editDevice = ref(false) // TODO: remove - don't allow this to be changed

const turnoutId = ref(props.turnout?.id || '')
const name = ref(props.turnout?.name || '')
const desc = ref(props.turnout?.desc || '')
const index = ref(props.turnout?.turnoutIdx || '')
const effectId = ref(props.turnout?.effectId)
const device = ref(props.turnout?.device || DEFAULT_DEVICE)
const straight = ref<number | undefined>(props.turnout?.straight)
const divergent = ref<number | undefined>(props.turnout?.divergent)
const color = ref(props.turnout?.color || 'yellow')
const tags = ref<string[]>(props.turnout?.tags || [])
const turnoutType = ref(props.turnout?.type || DEFAULT_TYPE)
const loading = ref(false)
const rules = {
  required: [(val) => !!val || 'Required.']
}

console.log('turnout', props.turnout)
const effectOptions = effects?.value.map((efx) => ({
  title: `${efx.name} [${efx.id}]`,
  value: efx.id
}))

watch(name, autoId)
watch(device, autoId)
watch(index, autoId)

function autoId() {
  console.log('autoId', name.value, device.value, index.value)
  turnoutId.value = name.value && device.value && index.value 
    ? `${slugify(name.value)}-${slugify(index.value.toString())}-${slugify(device.value)}` 
    : ''
}

async function submit (e) {
  loading.value = true
  const results = await e
  if (results.valid) {
    const turnout: ITurnout = {
      id: props.turnout?.id || turnoutId.value,
      device: device.value,
      name: name.value,
      desc: desc.value,
      turnoutIdx: parseInt(index.value as string),
      type: turnoutType.value,
      tags: tags.value,
      state: false,
      color: color.value,
      straight: straight.value ? Number(straight.value) : undefined,
      divergent: divergent.value ? Number(divergent.value) : undefined
    }
    if (effectId.value) {
      turnout.effectId = effectId.value
    }
    await setTurnout(props.turnout?.id || turnoutId.value, turnout)
    console.log(turnout, tags.value)
    loading.value = false
    reset()
    emit('close')
  } else {
    // reset()
    console.log('invalid form', results)
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
  color.value = ''
  tags.value = []
  index.value = ''
  effectId.value = ''
  device.value = DEFAULT_DEVICE
  straight.value = undefined
  divergent.value = undefined
  turnoutType.value = DEFAULT_TYPE
}

const title = computed(() => props.turnout ? `Edit Turnout: ${props.turnout.name}` : 'Add Turnout')

</script>
<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <h3 class="my-6 text-2xl">{{ title }}</h3>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <v-text-field
        v-model="name"
        label="Name"
        variant="outlined"
        :color="color"
        :rules="rules.required"
      ></v-text-field>
      <v-text-field
          v-model="index"
          label="Index"
          variant="outlined"
          min-width="100"
          max-width="200"
          :color="color"
          :rules="rules.required"
        >
      </v-text-field>
      <v-text-field
        v-model="desc"
        label="Description"
        variant="outlined"
          :color="color"
      ></v-text-field>
      <v-text-field
        v-model="turnoutId"
        label="ID"
        variant="outlined"
        :color="color"
        :rules="rules.required"
        :disabled="!!props.turnout?.id"
      ></v-text-field>
      <v-text-field
          v-model="straight"
          label="Straight"
          variant="outlined"
          min-width="100"
          max-width="200"
          :color="color"
          :rules="rules.required"
        >
      </v-text-field>
      <v-text-field
        v-model="divergent"
        label="Divergent"
        variant="outlined"
        min-width="100"
        max-width="200"
          :color="color"
          :rules="rules.required"
      >
      </v-text-field>
    </div>
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <TagPicker class="my-4 " v-model="tags"></TagPicker>
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <section>
        <v-btn
          class="min-h-48 min-w-48 border w-full"
          :color="color"
          @click="editType = true" >
          <div class="relative flex flex-col justify-center items-center">
            <v-icon size="64">mdi-directions-fork</v-icon>
            <div class="mt-4">Type [{{ turnoutType }}]</div>
          </div>
        </v-btn>
      </section>

      <section>
        <v-btn
          class="min-h-48 min-w-48 border w-full"
          :color="color"
          @click="editDevice = true" >
          <div class="relative flex flex-col justify-center items-center">
            <v-icon size="64">mdi-memory</v-icon>
            <div class="mt-4">Device [{{ device }}]</div>
          </div>
        </v-btn>
      </section>

      <section>
        <v-btn
          class="min-h-48 min-w-48 border w-full"
          :color="color"
          @click="editColor = true" >
          <!-- <v-icon :icon="efxOpt.icon" :color="efxOpt.color"></v-icon> -->
          <div class="relative flex flex-col justify-center items-center">
            <v-icon size="64">mdi-palette</v-icon>
            <div class="mt-4">Color [{{ color }}]</div>
          </div>        
        </v-btn>
      </section>

      <section>
        <v-btn
          class="min-h-48 min-w-48 border w-full"
          :color="color"
          @click="editEffect = true" >
          <div class="relative flex flex-col justify-center items-center">
            <v-icon size="64">mdi-rocket</v-icon>
            <div class="mt-4">Effect</div>
            <span class="text-xs line-clamp-1">[{{ effectId }}]</span>
          </div>
        </v-btn>
      </section>

    </div>

    <TurnoutTypePicker v-if="editType" v-model="turnoutType" :color="color" @select="editType = false" @cancel="editType = false; turnoutType = props.turnout.type ?? 'kato'"></TurnoutTypePicker>
    <DevicePicker v-if="editDevice" v-model="device" :color="color" @select="editDevice = false" @cancel="editDevice = false; device = props.turnout.device ?? DEFAULT_DEVICE"></DevicePicker>
    <ColorPicker v-if="editColor" v-model="color" @select="editColor = false" @cancel="editColor = false; color = props.turnout.color ?? 'yellow'"></ColorPicker>
    <EffectPicker v-if="editEffect" v-model="effectId" :color="color" @select="editEffect = false" @cancel="editEffect = false; effectId = props.turnout.effectId"></EffectPicker>

    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <div class="grid grid-cols-2 gap-8 my-4">
      <v-btn
        class="mt-2"
        text="Close"
        type="button"
        variant="tonal"
        @click="handleClose"
      ></v-btn>
      <v-btn
        :loading="loading"
        class="mt-2"
        text="Submit"
        type="submit"
        :color="color"
      ></v-btn>  
    </div>
  </v-form>
  <ViewJson :json="turnout"></ViewJson>
  <ViewJson :json="devices"></ViewJson>
</template>