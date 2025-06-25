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
  <v-list v-if="show || open" class="bg-red-960">
    <template v-for="aloco in alocos" :key="aloco.address">
      <v-list-item v-if="aloco.address !== loco.address && !loco.consist?.find((l) => l.address === aloco.address)">
        <template #prepend>
          <v-icon icon="mdi-train" class="w-8 h-8"></v-icon>
        </template>
        <template #title>
          <v-btn
            class="ma-2"
            icon="mdi-arrow-left-circle"
            variant="tonal"
            @click="$emit('add', aloco?.address, true)"
            :color="aloco?.meta?.color || getRoadname(aloco?.meta?.roadname)?.color || 'pink'"
            :disabled="!!(aloco?.address === loco?.address || loco?.consist?.find((l) => l.address === aloco?.address))"
          ></v-btn>
          <v-avatar 
            :color="aloco?.meta?.color || getRoadname(aloco?.meta?.roadname)?.color || 'pink'">{{ aloco?.address }}</v-avatar>
          <v-btn
            class="ma-2"
            icon="mdi-arrow-right-circle"
            variant="tonal"
            @click="$emit('add', aloco?.address, false)"
            :color="aloco?.meta?.color || getRoadname(aloco?.meta?.roadname)?.color || 'pink'"
            :disabled="!!(aloco?.address === loco?.address || loco?.consist?.find((l) => l.address === aloco?.address))"
          ></v-btn>
        </template>
        <template #append>
          <h3 class="text-h3 text-sm-h5">{{ aloco.name }}</h3>
          <v-chip :color="getRoadname(aloco?.meta?.roadname)?.color || 'pink'" class="ma-2">
            {{ getRoadname(aloco?.meta?.roadname)?.label || aloco?.meta?.roadname || 'Unknown' }}
          </v-chip>
        </template>
      </v-list-item>
    </template>
  </v-list>
</template>