<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useEfx } from '@/Effects/useEfx'
import { useTurnouts } from '@/Turnouts/useTurnouts'

const { switchTurnout } = useTurnouts()
const { runEffect, getEffect } = useEfx()

defineEmits(['edit'])
const props = defineProps({
  turnout: Object,
  turnoutId: String,
})

const turnoutState = ref(props.turnout?.state || true)

async function handleSwitch() {
  await switchTurnout({...props.turnout, id: props.turnoutId, state: turnoutState.value})
  if (props.turnout?.effectId) {
    useTimeoutFn(async () => {
      const effect = await getEffect(props.turnout?.effectId)
      await runEffect({...effect, state: turnoutState.value})
    }, 2000)
  }
}

</script>
<template> 
  <v-card
    class="mx-auto w-full h-full justify-between flex flex-col bg-zinc-500  bg-opacity-20"
    variant="tonal"
    density="compact"
    :color="turnout?.color || 'yellow'"
  >
  <v-card-item class="font-weight-black">
    <v-card-title class="font-weight-black">
      {{ turnout?.name }}
    </v-card-title>
  </v-card-item>
    <v-card-text 
      class="min-h-8 flex py-2 justify-space-between bg-blend-lighten bg-opacity-30"
      variant=""
      >
      <div class="grid grid-cols-2 gap-2">
        <v-chip-group column>
          <v-chip
            size="small"
            class=""
            icon="mdi-directions-fork"
          >{{ turnout?.type || 'Effect' }}</v-chip>          
          <v-chip
            size="small"
            class=""
            prepend-icon="mdi-memory"
          >
            {{ turnout?.device }}
          </v-chip>
          <v-label
            v-if="turnout?.effectId"
            class="text-xs"
          >
            {{ turnout?.effectId }}
          </v-label>
        </v-chip-group>
        <div class="flex flex-col items-center justify-center">
          <v-switch
            v-model="turnoutState"
            @change="handleSwitch"
            :color="turnout?.color || 'yellow'"
            hide-details
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
        disabled
      ></v-btn>
      <v-spacer></v-spacer>

      <v-btn
        text="Edit"
        variant="tonal"
        prepend-icon="mdi-pencil"
        size="small"
        @click="$emit('edit', turnout)"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>