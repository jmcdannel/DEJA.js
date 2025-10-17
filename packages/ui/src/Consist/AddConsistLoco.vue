<script setup lang="ts">
import { ref } from 'vue'
import  { ROADNAMES, type Loco } from '@repo/modules/locos'

defineEmits(['add'])
const props = defineProps<{
  alocos: Array<Loco>,
  loco: Loco
  color: string
  open: boolean
}>()
const show = ref(props.open)
function getRoadname(value: string | undefined) {
  if (!value) return undefined
  return ROADNAMES.find(rn => rn.value === value)
}
const roadName = getRoadname(props.loco.meta?.roadname)

</script>
<template>
  <v-list-item title="Add Loco to Consist">
    <template #prepend>
        <v-btn
          :color="loco?.meta?.color || roadName?.color || 'pink'"
          :icon="show ? 'mdi-minus-circle' : 'mdi-plus-circle'"
          variant="tonal"
          class="mr-8"
          @click="show = !show"
        ></v-btn>
    </template>
  </v-list-item>
  <v-divider></v-divider>
  <v-dialog 
    v-model="show"
    width="auto"
    min-width="420"
    max-width="80vw">
    <v-card title="Add Loco to Consist" class="bg-gradient-to-r from-purple-950 to-pink-950">
      <template v-slot:append>
        <v-btn
          icon="mdi-close"
          @click="show = false"
        ></v-btn>
      </template>
      <v-card-text>
        <v-list>
          <template v-for="aloco in alocos" :key="aloco.address">
            <v-list-item v-if="aloco.address !== loco.address && !loco.consist?.find((l) => l.address === aloco.address)">
              <template #prepend>
                <v-avatar 
                  :size="42"
                  :variant="'tonal'"
                  :color="aloco?.meta?.color || getRoadname(aloco?.meta?.roadname)?.color || 'pink'">{{ aloco?.address }}</v-avatar>
              </template>
              <template #title>
                <v-btn
                  class="ma-2"
                  icon="mdi-arrow-left-circle"
                  variant="tonal"
                  size="x-small"
                  @click="$emit('add', aloco?.address, true)"
                  :color="aloco?.meta?.color || getRoadname(aloco?.meta?.roadname)?.color || 'pink'"
                  :disabled="!!(aloco?.address === loco?.address || loco?.consist?.find((l) => l.address === aloco?.address))"
                ></v-btn>
                <v-btn
                  class="ma-2"
                  icon="mdi-arrow-right-circle"
                  variant="tonal"
                  size="x-small"
                  @click="$emit('add', aloco?.address, false)"
                  :color="aloco?.meta?.color || getRoadname(aloco?.meta?.roadname)?.color || 'pink'"
                  :disabled="!!(aloco?.address === loco?.address || loco?.consist?.find((l) => l.address === aloco?.address))"
                ></v-btn>
              </template>
              <template #append>
                <h3 class="text-sm">{{ aloco.name }}</h3>
                <v-chip size="x-small" :color="getRoadname(aloco?.meta?.roadname)?.color || 'pink'" class="ma-2 hidden md:flex">
                  {{ getRoadname(aloco?.meta?.roadname)?.label || aloco?.meta?.roadname || 'Unknown' }}
                </v-chip>
              </template>
            </v-list-item>
          </template>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>