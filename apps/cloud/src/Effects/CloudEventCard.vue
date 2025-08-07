<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEfx, efxTypes } from '@repo/modules/effects'
import { useColors } from '@/Core/UI/useColors'
import type { Effect } from '@repo/modules/effects'

const { DEFAULT_COLOR } = useColors()
const { runEffect, deleteEfx } = useEfx()

const props = defineProps({
  efx: Object as () => Effect,
  efxId: String,
})

const emit = defineEmits(['edit'])

const confirmDelete = ref(false)

const efxType = computed(() => efxTypes.find((type) => type.value === props?.efx?.type))
const color = ref(props.efx?.color || efxType.value?.color || DEFAULT_COLOR)

async function handleEfx (event: Event) {
  console.log('handleEfx', props.efx, props.efx?.id, event, (event.target as HTMLInputElement)?.checked)
  props?.efx && props?.efxId && await runEffect({
      ...props.efx,
      id: props.efxId,
      type: props.efx.type || '',
      state: (event.target as HTMLInputElement)?.checked
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
      <span>{{efx?.name}}</span>
    </template>
    <template #subtitle>
      <v-chip 
        v-if="efx?.device" 
        class="ml-2 text-xs"
        prepend-icon="mdi-memory"
        variant="outlined"
      >
        {{efx?.device}}
      </v-chip>
      <v-chip 
        v-if="efx?.type" 
        class="ml-2 text-xs"
        prepend-icon="mdi-cog"
        variant="outlined"
      >
        {{efx?.type}}
      </v-chip>
      <v-chip 
        v-if="efx?.pin" 
        class="ml-2 text-xs"
        prepend-icon="mdi-resistor"
        variant="outlined"
      >
        Pin: {{efx?.pin}}
      </v-chip>
    </template>
    <template #prepend>
      <v-avatar :color="efxType?.color || 'black'" class="text-white">
        <v-icon :icon="efxType?.icon || 'mdi-flash'"></v-icon>
      </v-avatar>
    </template>
    <template #append>
      <v-switch
        :model-value="efx?.state"
        :color="efxType?.color || color"
        @change="handleEfx"
      />
    </template>
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
          @click="efx?.id && deleteEfx(efx.id)" />
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