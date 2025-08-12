<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useEfx, efxTypes } from '@repo/modules/effects'
import { useColors } from '@/Core/UI/useColors'

const { DEFAULT_COLOR } = useColors()
const { runEffect, deleteEfx } = useEfx()

const props = defineProps({
  efx: Object,
  efxId: String,
})

const confirmDelete = ref(false)

const efxType = computed(() => efxTypes.find((type) => type.value === props?.efx?.type))
const color = ref(props.efx?.color || efxType.value?.color || DEFAULT_COLOR)
const state = ref(props.efx?.state || false)

async function handleEfx (state: boolean) {
  props?.efx?.type && props?.efx && props?.efxId && await runEffect({
    ...props.efx,
    type: props.efx.type,
    id: props.efxId,
    state,
  })
}

watch(state, (newState) => {
  handleEfx(newState)
})

</script>
<template>
  <v-card
    class="mx-auto w-full h-full justify-between flex flex-col"
    :color="color"
    variant="tonal"
    density="compact"
  >
    <template #title>
      <span class="text-md">{{efx?.name}}</span>
    </template>
    <template #prepend>
      <v-icon 
        :icon="efxType?.icon || 'mdi-help'"
        class="text-2xl m-3"></v-icon>
    </template>
    <v-card-text 
      class="min-h-8 flex py-2 justify-space-between"
      variant="flat">
      <!-- <v-chip-group>
        <v-chip
          prepend-icon="mdi-map-marker"
          size="small"
        >{{ efx?.point1 }}</v-chip>
        <v-chip v-for="t in efx?.on" :key="t.id" size="small" prepend-icon="mdi-call-split">{{ t.name }}</v-chip>
        <v-chip
          append-icon="mdi-map-marker"
          :color="color"
          size="small"
        >{{ efx?.point2 }}</v-chip>
      </v-chip-group> -->
      <v-stepper>
        <v-stepper-header>
          <v-stepper-item :value="'A'">
            <template #title>
              <v-chip
                prepend-icon="mdi-map-marker"
                color="blue"
                variant="flat"
                size="small"
              >{{ efx?.point1 }}</v-chip>
            </template>
          </v-stepper-item>
          <v-divider></v-divider>
          <template v-for="(t, index) in efx?.on" :key="t.id">
            <v-stepper-item :value="(index + 1)">
              <template #title>
                <v-chip :color="t.state ? 'green' : 'red'" size="small" variant="flat" prepend-icon="mdi-call-split">{{ t.name }}</v-chip>
              </template>
            </v-stepper-item>
            <v-divider></v-divider>
          </template>
          <v-stepper-item :value="'B'">
            <template #title>
              <v-chip
                append-icon="mdi-map-marker"
                color="blue"
                variant="flat"
                size="small"
              >{{ efx?.point2 }}</v-chip>
            </template>
          </v-stepper-item>
        </v-stepper-header>
      </v-stepper>
    </v-card-text>
    <v-spacer></v-spacer>
    <v-card-actions>
      <v-btn
        v-if="!confirmDelete"
        class="ma-2"
        icon="mdi-delete"
        variant="tonal"
        size="small"
        @click="confirmDelete = true"
      ></v-btn>
      <template v-else>
        <v-btn
          class="ma-2"
          text="Cancel"
          variant="outlined"
          size="small"
          @click="confirmDelete = false" />
        <v-btn
          class="ma-2"
          text="Confirm"
          variant="tonal"
          size="small"
          prepend-icon="mdi-delete"
          @click="deleteEfx(efx?.id)" />
      </template>
      <v-spacer></v-spacer>
      <v-btn
        text="Edit"
        variant="tonal"
        prepend-icon="mdi-pencil"
        size="small"
        @click="$emit('edit', efx)"
      ></v-btn>
      <v-btn
        text="Run"
        variant="tonal"
        prepend-icon="mdi-play"
        size="small"
        @click="state = !state"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>
