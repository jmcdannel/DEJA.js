<script setup lang="ts">
import { ref } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useEfx } from '@repo/modules/effects'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'

const { switchTurnout } = useTurnouts()
const { runEffect, getEffect } = useEfx()

defineEmits(['edit'])

const props = defineProps<{
  turnout: Turnout
  turnoutId: string
}>()

const turnoutState = ref(props.turnout?.state || true)

async function handleSwitch() {
  
  await switchTurnout({...props.turnout, id: props.turnoutId, state: turnoutState.value})
  if (props.turnout?.effectId) {
    const effectId = props.turnout.effectId
    useTimeoutFn(async () => {
      const effect = await getEffect(effectId)
      if (effect) {
        await runEffect({...effect, type: effect.type || '', state: turnoutState.value})
      }
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
    <v-card-title class="font-weight-black flex items-center justify-between">
      {{ turnout?.name }}
      <v-switch
        v-model="turnoutState"
        @change="handleSwitch"
        :color="turnout?.color || 'yellow'"
        hide-details
      ></v-switch>
    </v-card-title>
    <v-card-subtitle class="text-md">
      {{ turnout?.desc }}
    </v-card-subtitle>
  </v-card-item>
    <v-card-text 
      class="min-h-8 flex py-2 justify-space-between bg-blend-lighten bg-opacity-30"
      variant=""
      >
        <v-chip-group column>
          <v-chip
            size="small"
            class=""
            prepend-icon="mdi-directions-fork"
          >{{ turnout?.type || 'Effect' }}</v-chip>          
          <v-chip
            size="small"
            class=""
            prepend-icon="mdi-memory"
          >
            {{ turnout?.device }}
          </v-chip>
          <v-chip v-for="tag in turnout?.tags" :key="tag"
            size="small"
            class=""
            color="primary"
          >
            {{ tag }}
          </v-chip>
          <v-label
            v-if="turnout?.effectId"
            class="text-xs"
          >
            {{ turnout?.effectId }}
          </v-label>
        </v-chip-group>
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