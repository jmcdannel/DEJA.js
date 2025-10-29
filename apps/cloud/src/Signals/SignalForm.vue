<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLayout, useSignals, type Signal } from '@repo/modules'

const props = defineProps<{ signal: Signal | null }>()
const emit = defineEmits(['close'])

const { getDevices } = useLayout()
const { setSignal } = useSignals()

const devices = getDevices()

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
    await setSignal(props.signal?.id || '', {
      name: name.value,
      device: device.value,
      red: red.value as any,
      yellow: yellow.value as any,
      green: green.value as any,
      aspect: aspect.value,
      commonAnode: commonAnode.value,
      description: description.value || undefined,
      tags: tags.value?.length ? tags.value : undefined,
    })
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
            v-model="device"
            :items="devices"
            item-value="id"
            item-title="name"
            label="Controller device"
            variant="outlined"
            required
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
            hint="Pin number for the red LED"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="yellow"
            label="Yellow pin"
            type="number"
            variant="outlined"
            hint="Pin number for the yellow LED"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="green"
            label="Green pin"
            type="number"
            variant="outlined"
            hint="Pin number for the green LED"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row class="items-center">
        <v-col cols="12" md="6">
          <v-switch
            v-model="commonAnode"
            color="emerald"
            inset
            :label="`Wiring: ${wiringLabel}`"
            density="comfortable"
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
        <v-col cols="12" md="6">
          <v-textarea
            v-model="description"
            label="Description"
            rows="3"
            auto-grow
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-combobox
            v-model="tags"
            label="Tags"
            multiple
            chips
            variant="outlined"
            hint="Organize signals with optional tags"
            persistent-hint
          />
        </v-col>
      </v-row>

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
          color="emerald"
          type="submit"
          :loading="loading"
        >
          Save Signal
        </v-btn>
      </div>
    </v-form>
  </div>
</template>
