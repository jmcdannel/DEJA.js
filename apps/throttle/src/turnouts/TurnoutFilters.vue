<script setup lang="ts">
import { useLayout } from '@repo/modules/layouts'

const show = defineModel<boolean>('show')
const selected = defineModel<string[]>('selected')
const { getDevices } = useLayout()
const devices = getDevices()

</script>
<template>
  <v-dialog
    v-model="show"
  >
  <!-- <pre>{{ devices }}</pre> -->
    <v-chip-group 
      v-if="selected?.length" 
      color="pink" 
      column
      multiple 
      v-model="selected">
      <v-chip 
        v-for="device in selected" 
        filter
        :key="device"
        :text="device" 
        :value="device" 
        color="pink" 
        size="small"
        variant="elevated"
      />
    </v-chip-group>
    <v-list >
      <v-list-subheader>Devices</v-list-subheader>
      <v-list-group multiple>
        <v-list-item v-for="device in devices" :key="device.id" appendIcon="mdi-chip" :value="device.id">
          <template v-slot:prepend="{ isSelected }">
            <v-list-item-action start>
              <v-checkbox-btn :model-value="isSelected"></v-checkbox-btn>
            </v-list-item-action>
          </template>
          <v-list-item-title>{{ device.id }}</v-list-item-title>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-dialog>
</template>