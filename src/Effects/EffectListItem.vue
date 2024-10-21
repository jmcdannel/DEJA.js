<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEfx } from '@/Effects/useEfx'
import { useColors } from '@/Core/UI/useColors'

const { colors, DEFAULT_COLOR } = useColors()
const { efxTypes, runEffect } = useEfx()

const props = defineProps({
  efx: Object,
  efxId: String,
})

const active = ref(false)

const efxType = computed(() => efxTypes.find((type) => type.value === props?.efx?.type))
const color = computed(() => colors[efxType?.value?.color || DEFAULT_COLOR])

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
    :class="color.border"
    :color="color.value"
    variant="outlined"
    density="compact"
  >
    <template #title>
      <span class="text-sm">{{efx?.name}}</span>
    </template>
    <template #append>
      <v-avatar
        :color="color.value"
      >{{ efx?.pin }}</v-avatar>
    </template>
    <v-card-text 
      class="min-h-8 flex border-t-2 py-2 justify-space-between"
      :class="color.border"
      variant="flat">
      <div class="grid grid-cols-2 gap-2">
        <v-chip-group column>
          <v-chip
            size="small"
            class=""
            :color="color.value"
          >{{ efxId }}</v-chip>
          <v-chip
            size="small"
            class=""
            :color="color.value"
          >{{ efxType?.label || 'Effect' }}</v-chip>
          
          <v-chip
            size="small"
            class=""
            :color="color.value"
            prepend-icon="mdi-memory"
          >
            {{ efx?.interface }}
          </v-chip>
        </v-chip-group>
        <div class="flex flex-col items-center justify-center">
          <v-icon 
            :icon="efxType?.icon || 'mdi-help'"
            class="text-5xl m-3"
            :class="color.text"></v-icon>
          <v-switch
            hide-details
            :color="color.value"
            @click="handleEfx"
          ></v-switch>
        </div>
      </div>
    </v-card-text>
    <v-spacer></v-spacer>
    <v-card-actions>
      <v-btn
        class="ma-2"
        icon="mdi-delete"
        variant="tonal"
        size="small"
      ></v-btn>
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
