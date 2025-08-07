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
    <template #append>
      <v-avatar
        :color="color"
      >{{ efx?.pin }}</v-avatar>
    </template>
    <v-card-text 
      class="min-h-8 flex border-t-2 py-2 justify-space-between"
      variant="flat">
      <div class="grid grid-cols-2 gap-2">
        <v-chip-group column>
          <v-label class="text-xs">{{ efxId }}</v-label>
          <v-chip
            size="small"
            class=""
            :color="color"
          >{{ efxType?.label || 'Effect' }}</v-chip>
          
          <v-chip
            size="small"
            class=""
            :color="color"
            prepend-icon="mdi-memory"
          >
            {{ efx?.device }}
          </v-chip>
        </v-chip-group>
        <div class="flex flex-col items-center justify-center">
          <v-icon 
            :icon="efxType?.icon || 'mdi-help'"
            class="text-5xl m-3"></v-icon>
          <v-switch
            hide-details
            :color="color"
            @click="handleEfx"
          ></v-switch>
        </div>
      </div>
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
