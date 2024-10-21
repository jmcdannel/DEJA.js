<script setup lang="ts">
import { ref } from 'vue'
import { 
  BsCloudPlusFill
} from 'vue3-icons/bs'
import { useLayout } from '@/Layout/useLayout'

const emit = defineEmits(['close'])
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})
const reveal = ref(false)
const loading = ref(false)
const connection = ref(null)
const deviceType = ref(null)
const deviceId = ref(null)
const rules = {
  required: [(val) => !!val || 'Required.']
}

const { createDevice, deviceTypes } = useLayout()

const connectionTypes = ['usb', 'wifi']

async function submit (e) {
  loading.value = true
  const results = await e

  if (results.valid) {
    const device = {
      connection: connection.value,
      ['type']: deviceType.value
    }
    await createDevice(deviceId.value, device)
    console.log(results, e, device)
  }

  loading.value = false
}

function handleClose() {
  reveal.value = false
  emit('close')
}

</script>
<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <v-card  
      v-if="reveal || props.show"
    >
    <v-card-title>
      <h3 class="flex text-sky-500 dark:text-sky-400 mt-4">
        <v-icon icon="mdi-memory" class="w-8 h-8 mr-2"></v-icon>
        <span class="text-xl">Add Device</span>
      </h3>
    </v-card-title>
      <v-card-text class="pb-0">
          <v-btn-toggle v-model="deviceType" color="cyan" divided class="flex-col sm:flex-row flex-wrap h-auto" size="x-large">
            <v-btn v-for="device in deviceTypes" :value="device.value" :key="device.value"  
              class="md:min-h-24 border">
              <div class="flex flex-col justify-center items-center py-2">
                <v-icon :icon="device.icon" :color="device.color"></v-icon>
                <div class="mt-4">{{ device.label }}</div>
              </div>
            </v-btn>
          </v-btn-toggle>
          <v-divider class="my-4"></v-divider>
          <v-btn-toggle v-model="connection" color="cyan" divided class="flex-wrap h-auto" size="x-large">
            <v-btn v-for="conn in connectionTypes" :value="conn" :key="conn" 
            class="min-h-24 min-w-24 border">
              <!-- <v-icon :icon="efxOpt.icon" :color="efxOpt.color"></v-icon> -->
              
              <div class="flex flex-col justify-center items-center py-2">
                <v-icon :icon="`mdi-${conn}`"></v-icon>
                <div class="mt-4">{{ conn }}</div>
              </div>
            </v-btn>
          </v-btn-toggle>
          <v-divider class="my-4"></v-divider>
          <v-text-field
            v-model="deviceId"
            label="ID"
            variant="outlined"
            density="compact"
            :rules="rules.required"
          ></v-text-field>
          <div class="grid grid-cols-2 gap-8 my-4">
          </div>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text="Close"
          type="button"
          variant="tonal"
          @click="handleClose"
        ></v-btn>
        <v-spacer></v-spacer>
        <v-btn
          :loading="loading"
          text="Submit"
          type="submit"
          color="cyan"
          variant="flat"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>