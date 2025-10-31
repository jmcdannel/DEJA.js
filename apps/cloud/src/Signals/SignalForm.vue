<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLayout } from '@repo/modules'
import { useSignals, type Signal, type SignalAspect } from '@repo/modules/signals'
import ColorPicker from '@/Common/Color/ColorPicker.vue'
import TagPicker from '@/Common/Tags/TagPicker.vue'

interface ValidationRules {
  required: ((val: any) => boolean | string)[];
}

const props = defineProps<{ signal: Signal | null }>()
const emit = defineEmits(['close'])

const { getDevices } = useLayout()
const { setSignal } = useSignals()

const devices = getDevices()

const editColor = ref(false)
const name = ref(props.signal?.name ?? '')
const device = ref(props.signal?.device ?? '')
const red = ref<number | string | undefined>(props.signal?.red)
const yellow = ref<number | string | undefined>(props.signal?.yellow)
const green = ref<number | string | undefined>(props.signal?.green)
const aspect = ref(props.signal?.aspect ?? null)
const commonAnode = ref(Boolean(props.signal?.commonAnode))
const description = ref(props.signal?.description ?? '')
const tags = ref<string[]>(props.signal?.tags ?? [])
const loading = ref(false)
const error = ref<string | null>(null)
const color = ref('cyan')

// Validation for device when required
const deviceRules = computed(() => {
  return [(val: any) => !!val || 'Device is required for this effect type.']
})

watch(() => props.signal, (next) => {
  name.value = next?.name ?? ''
  device.value = next?.device ?? ''
  red.value = next?.red
  yellow.value = next?.yellow
  green.value = next?.green
  aspect.value = next?.aspect ?? null
  commonAnode.value = Boolean(next?.commonAnode)
  description.value = next?.description ?? ''
  tags.value = next?.tags ?? []
}, { immediate: true })

watch(devices, (list) => {
  if (!device.value && Array.isArray(list) && list.length > 0) {
    const first = list[0]
    if (first?.id) {
      device.value = first.id
    }
  }
}, { immediate: true })

const wiringLabel = computed(() => commonAnode.value ? 'Common Anode' : 'Common Cathode')

async function submit() {
  loading.value = true
  error.value = null

  if (!name.value) {
    error.value = 'Name is required.'
    loading.value = false
    return
  }

  if (!device.value) {
    error.value = 'A device is required to control the signal.'
    loading.value = false
    return
  }

  try {
    const payload = {
      name: name.value,
      device: device.value,
      commonAnode: commonAnode.value,
    }
    if (red.value !== '' && red.value !== undefined) {
      Object.assign(payload, { red: Number(red.value) })
    }
    if (yellow.value !== '' && yellow.value !== undefined) {
      Object.assign(payload, { yellow: Number(yellow.value) })
    }
    if (green.value !== '' && green.value !== undefined) {
      Object.assign(payload, { green: Number(green.value) })
    }
    if (aspect.value !== null) {
      Object.assign(payload, { aspect: aspect.value })
    } else {
      Object.assign(payload, { aspect: null })
    }
    if (description.value) {
      Object.assign(payload, { description: description.value })
    }
    if (tags.value.length > 0) {
      Object.assign(payload, { tags: tags.value })
    }
    
    await setSignal(props.signal?.id || '', payload)
    emit('close')
  } catch (err) {
    console.error('Failed to save signal', err)
    error.value = 'Unable to save signal.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <v-form @submit.prevent="submit">
      <v-label class="m-2 text-4xl">
        {{ signal ? 'Edit' : 'Add'}} Signal
      </v-label>
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-label class="m-2">
        Device
      </v-label>
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-btn-toggle v-model="device" divided class="flex-wrap h-auto" size="x-large" :rules="deviceRules">
          <v-btn v-for="deviceOpt in devices" :value="deviceOpt.id" :key="deviceOpt.id" 
            class="min-h-24 min-w-48 border"
            :color="color" >
              {{ deviceOpt.id }}
          </v-btn>
      </v-btn-toggle>
      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="name"
            label="Signal name"
            required
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="aspect"
            :items="[
              { title: 'Off', value: null },
              { title: 'Red', value: 'red' },
              { title: 'Yellow', value: 'yellow' },
              { title: 'Green', value: 'green' },
            ]"
            label="Default aspect"
            variant="outlined"
            hint="Aspect applied when the signal is saved"
            persistent-hint
          />
        </v-col>
      </v-row>      
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="red"
            label="Red pin"
            type="number"
            variant="outlined"
            color="red"
            hint="Pin number for the red LED"
          >
          <template #prepend-inner>
            <v-icon icon="mdi-circle" :color="'red'" />
          </template>
        </v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="yellow"
            label="Yellow pin"
            type="number"
            color="yellow"
            variant="outlined"
            hint="Pin number for the yellow LED"
          >
          <template #prepend-inner>
            <v-icon icon="mdi-circle" :color="'yellow'" />
          </template>
        </v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="green"
            label="Green pin"
            color="green"
            type="number"
            variant="outlined"
            hint="Pin number for the green LED"
          >
          <template #prepend-inner>
            <v-icon icon="mdi-circle" :color="'green'" />
          </template>
        </v-text-field>
        </v-col>
      </v-row>

      <v-row class="items-center">
        <v-col cols="12" md="6">
          <v-switch
            v-model="commonAnode"
            :color="color"
            :label="`Wiring: ${wiringLabel}`"
            density="comfortable"
          />
          <v-textarea
            v-model="description"
            label="Description"
            rows="3"
            auto-grow
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="6">

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
            <ColorPicker v-model="color" @select="editColor = false" @cancel="editColor = false; color = props.efx?.color ?? 'purple'"></ColorPicker>
          </v-dialog>
        </v-col>
      </v-row>

      <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
      <TagPicker class="my-4 " v-model="tags"></TagPicker>

      <v-alert
        v-if="error"
        type="error"
        class="mb-4"
        :text="error"
      />

      <div class="flex justify-end gap-2 mt-4">
        <v-btn variant="text" @click="emit('close')">
          Cancel
        </v-btn>
        <v-btn
          :color="color"
          type="submit"
          :loading="loading"
        >
          Save Signal
        </v-btn>
      </div>
    </v-form>
  </div>
</template>
