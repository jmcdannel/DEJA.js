<script setup lang="ts">
import { ref } from 'vue'
import { useCvProgrammer } from './useCvProgrammer'
import CvReadWrite from './CvReadWrite.vue'
import CvConfigEditor from './CvConfigEditor.vue'
import CvAddressEditor from './CvAddressEditor.vue'
import CvCommonTable from './CvCommonTable.vue'
import CvLog from './CvLog.vue'

const {
  mode,
  pomAddress,
  isConnected,
  isBusy,
  cvLog,
  readCv,
  writeCv,
  writeCvBit,
  readAddress,
  writeAddress,
  verifyCv,
  factoryReset,
  batchReadCommonCvs,
  batchProgress,
  batchTotal,
  clearLog,
  decodeCv29,
  encodeCv29,
  longAddressToCv17Cv18,
  cv17Cv18ToLongAddress,
} = useCvProgrammer()

const activeTab = ref('read-write')
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <v-card variant="tonal" color="orange" class="shadow-xl">
      <v-card-title class="flex items-center gap-3">
        <v-icon>mdi-chip</v-icon>
        <span>CV Programmer</span>
        <v-spacer />
        <v-chip
          :color="isConnected ? 'success' : 'error'"
          variant="flat"
          size="small"
          :prepend-icon="isConnected ? 'mdi-wifi' : 'mdi-wifi-off'"
        >
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </v-chip>
      </v-card-title>

      <v-card-text>
        <div class="flex flex-wrap items-center gap-4">
          <!-- Mode Selector -->
          <v-btn-toggle v-model="mode" mandatory variant="outlined" density="comfortable" divided>
            <v-btn value="service" prepend-icon="mdi-train-car">
              Service Track
            </v-btn>
            <v-btn value="pom" prepend-icon="mdi-road-variant">
              Main Track (POM)
            </v-btn>
          </v-btn-toggle>

          <!-- POM Address -->
          <v-text-field
            v-if="mode === 'pom'"
            v-model.number="pomAddress"
            label="Loco Address"
            type="number"
            :min="1"
            :max="9999"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 160px"
            prepend-inner-icon="mdi-train"
          />

          <v-chip
            v-if="mode === 'pom'"
            color="warning"
            variant="tonal"
            size="small"
            prepend-icon="mdi-alert"
          >
            Write-only (no reads on main track)
          </v-chip>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-card variant="tonal" class="shadow-xl">
      <v-tabs v-model="activeTab" color="orange" grow>
        <v-tab value="read-write" prepend-icon="mdi-pencil-box">Read / Write</v-tab>
        <v-tab value="cv29" prepend-icon="mdi-cog">CV29 Config</v-tab>
        <v-tab value="address" prepend-icon="mdi-pound">Address</v-tab>
        <v-tab value="common" prepend-icon="mdi-table">Common CVs</v-tab>
        <v-tab value="log" prepend-icon="mdi-text-box">
          Log
          <v-badge v-if="cvLog.length > 0" :content="cvLog.length" color="orange" floating />
        </v-tab>
      </v-tabs>

      <v-divider />

      <v-window v-model="activeTab">
        <v-window-item value="read-write">
          <CvReadWrite
            :mode="mode"
            :is-busy="isBusy"
            :is-connected="isConnected"
            @read="readCv"
            @write="writeCv"
            @write-bit="writeCvBit"
            @verify="verifyCv"
          />
        </v-window-item>

        <v-window-item value="cv29">
          <CvConfigEditor
            :mode="mode"
            :is-busy="isBusy"
            :is-connected="isConnected"
            :decode-cv29="decodeCv29"
            :encode-cv29="encodeCv29"
            @read="readCv"
            @write="writeCv"
          />
        </v-window-item>

        <v-window-item value="address">
          <CvAddressEditor
            :mode="mode"
            :is-busy="isBusy"
            :is-connected="isConnected"
            :long-address-to-cv17-cv18="longAddressToCv17Cv18"
            :cv17-cv18-to-long-address="cv17Cv18ToLongAddress"
            @read="readCv"
            @write="writeCv"
            @read-address="readAddress"
            @write-address="writeAddress"
          />
        </v-window-item>

        <v-window-item value="common">
          <CvCommonTable
            :mode="mode"
            :is-busy="isBusy"
            :is-connected="isConnected"
            :batch-progress="batchProgress"
            :batch-total="batchTotal"
            @read="readCv"
            @write="writeCv"
            @batch-read="batchReadCommonCvs"
            @factory-reset="factoryReset"
          />
        </v-window-item>

        <v-window-item value="log">
          <CvLog :log="cvLog" @clear="clearLog" />
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>
