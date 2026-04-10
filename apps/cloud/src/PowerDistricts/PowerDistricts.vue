<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePowerDistricts, useLayout, type Device, type PowerDistrict } from '@repo/modules'
import { useTrackOutputs, type TrackOutput } from '@repo/dccex'
import { PowerDistrictCard } from '@repo/ui'
import { useNotification } from '@repo/ui'
import ListPage from '@/Core/UI/ListPage.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

const { getPowerDistricts, setPowerDistrict, deletePowerDistrict } = usePowerDistricts()
const { getDevices } = useLayout()
const { notify } = useNotification()

const districts = getPowerDistricts()
const allDevices = getDevices()

const dccExDevices = computed(() =>
  (allDevices.value ?? []).filter((d: Device) => d.type === 'dcc-ex'),
)

// New district form
const showAddForm = ref(false)
const newName = ref('')
const newDeviceId = ref('')
const newOutput = ref('')
const newColor = ref('#7C3AED')

const districtColors = [
  '#7C3AED', '#EF4444', '#10B981', '#F59E0B',
  '#3B82F6', '#EC4899', '#14B8A6', '#F97316',
]

function getDevice(deviceId: string): Device | undefined {
  return allDevices.value?.find((d: Device) => d.id === deviceId)
}

function getTrackOutput(deviceId: string, output: string): TrackOutput | null {
  const device = getDevice(deviceId)
  if (!device?.trackOutputs) return null
  return device.trackOutputs[output] ?? null
}

function getAvailableOutputs(deviceId: string): string[] {
  const device = getDevice(deviceId)
  if (!device?.trackOutputs) return ['A', 'B']
  return Object.keys(device.trackOutputs)
}

async function handleAddDistrict() {
  if (!newName.value || !newDeviceId.value || !newOutput.value) return

  const success = await setPowerDistrict('', {
    name: newName.value,
    deviceId: newDeviceId.value,
    output: newOutput.value,
    color: newColor.value,
  })

  if (success) {
    notify?.success('Power district created')
    showAddForm.value = false
    newName.value = ''
    newDeviceId.value = ''
    newOutput.value = ''
  } else {
    notify?.error('Failed to create power district')
  }
}

async function handleDeleteDistrict(district: PowerDistrict) {
  await deletePowerDistrict(district.id)
  notify?.info(`Removed "${district.name}"`)
}

// Import sendTrackPower from the first device's composable (used for power toggle)
const firstDeviceTrackOutputs = useTrackOutputs(() => dccExDevices.value?.[0]?.id ?? null)

async function handleTogglePower(district: PowerDistrict, newState: boolean) {
  await firstDeviceTrackOutputs.sendTrackPower(district.deviceId, district.output, newState)
}
</script>

<template>
  <ListPage
    title="Power Districts"
    icon="mdi-lightning-bolt"
    color="violet"
    :empty="!!districts && districts.length === 0 && !showAddForm"
  >
    <template #actions>
      <v-btn
        color="violet"
        variant="flat"
        size="small"
        prepend-icon="mdi-plus"
        @click="showAddForm = !showAddForm"
      >
        Add District
      </v-btn>
    </template>

    <!-- Add District Form -->
    <v-expand-transition>
      <v-card v-if="showAddForm" variant="outlined" class="mb-4 pa-4">
        <v-row dense>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="newName"
              label="District Name"
              placeholder="e.g., Mainline"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="newDeviceId"
              :items="dccExDevices"
              item-title="name"
              item-value="id"
              label="Device"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="2">
            <v-select
              v-model="newOutput"
              :items="getAvailableOutputs(newDeviceId)"
              label="Output"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="1">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :color="newColor"
                  icon
                  size="small"
                  variant="flat"
                  title="Pick color"
                >
                  <v-icon>mdi-palette</v-icon>
                </v-btn>
              </template>
              <v-card class="pa-2">
                <div class="d-flex flex-wrap gap-1" style="max-width: 160px">
                  <v-btn
                    v-for="c in districtColors"
                    :key="c"
                    :color="c"
                    icon
                    size="x-small"
                    variant="flat"
                    @click="newColor = c"
                  />
                </div>
              </v-card>
            </v-menu>
          </v-col>
          <v-col cols="12" sm="2" class="d-flex align-center">
            <v-btn
              color="violet"
              variant="flat"
              size="small"
              :disabled="!newName || !newDeviceId || !newOutput"
              @click="handleAddDistrict"
            >
              Create
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-expand-transition>

    <!-- District list -->
    <div v-if="districts && districts.length > 0">
      <PowerDistrictCard
        v-for="district in districts"
        :key="district.id"
        :district="district"
        :device-name="getDevice(district.deviceId)?.name || district.deviceId"
        :track-output="getTrackOutput(district.deviceId, district.output)"
        @toggle-power="handleTogglePower"
        @delete="handleDeleteDistrict"
      />
    </div>

    <template #empty-state>
      <EmptyState
        icon="mdi-lightning-bolt"
        color="violet"
        title="No Power Districts Yet"
        description="Power districts let you name and control individual track outputs across your command stations."
        :use-cases="[
          { icon: 'mdi-format-list-bulleted', text: 'Name individual track outputs' },
          { icon: 'mdi-toggle-switch', text: 'Toggle power per district' },
          { icon: 'mdi-palette', text: 'Color-code your layout' },
        ]"
        action-label="Add Your First District"
        @action="showAddForm = true"
      />
    </template>
  </ListPage>
</template>
