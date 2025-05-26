<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEfx, efxTypes } from '@repo/modules/effects'
import { useColors } from '@/Core/UI/useColors'

const { DEFAULT_COLOR } = useColors()
const { runEffect, deleteEfx } = useEfx()

const props = defineProps({
  efx: Object,
  efxId: String,
})

const active = ref(false)
const confirmDelete = ref(false)


const efxType = computed(() => efxTypes.find((type) => type.value === props?.efx?.type))
const color = ref(props.efx?.color || efxType.value?.color || DEFAULT_COLOR)

async function handleEfx (event: Event) {
  console.log('handleEfx', props.efx, props.efx?.id, event, event?.target?.checked)
  props?.efx && props?.efxId && await runEffect({
      ...props.efx,
      id: props.efxId,
      state: event?.target?.checked
  })
}

</script>
<template>
  <v-card
    class="mx-auto w-full h-full justify-between flex flex-col"
    :color="color"
    variant="tonal"
    density="compact"
  >
    <template #title>
      <span class="text-sm">{{efx?.name}}</span>
    </template>
    <v-card-text 
      class="min-h-8 flex border-t-2 py-2 justify-space-between"
      variant="flat">
      <v-chip-group>
        <v-chip
          :color="color"
        >{{ efx?.point1 }}</v-chip>
        <v-chip
          :color="color"
        >{{ efx?.point2 }}</v-chip>
      </v-chip-group>
        <v-switch
          hide-details
          :color="color"
          @click="handleEfx"
        ></v-switch>
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
    </v-card-actions>
  </v-card>
</template>
