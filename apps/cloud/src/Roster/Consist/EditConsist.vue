<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useLocos } from '@repo/modules/locos'
import LeadLoco from '@/Roster/Consist/LeadLoco.vue'
import ConsistLoco from '@/Roster/Consist/ConsistLoco.vue'
import AddConsistLoco from '@/Roster/Consist/AddConsistLoco.vue'

const props = defineProps({
  loco: Object,
  color: Object
})

const { getLocos, updateConsist } = useLocos()
const show = ref(false)

let locos = shallowRef(getLocos())

async function handleRemoveLoco(cloco) {
  if (props.loco) {
    const newConsist = (props.loco.consist || [])
      .filter((l) => l.address !== cloco.address)
    console.log('newConsist', newConsist)
    await updateConsist(props.loco.id, newConsist)
    locos.value = getLocos()
  }
}

async function handleAdjustTrim(cloco, trim: number) {
  if (props.loco) {
    const newConsist = (props.loco.consist || []).map((l) => {
      if (l.address === cloco.address) {
        l.trim += trim
      }
      return l
    })
    console.log('newConsist', newConsist)
    await updateConsist(props.loco.id, newConsist)
  }
}

async function handleAddLoco(newAddress: string, direction:boolean = true) {
  if (props.loco) {
    const newLoco = {
      address: parseInt(newAddress),
      direction,
      trim: 0
    }
    const newConsist = [...(props.loco.consist || []), newLoco]
    console.log('newConsist', newConsist)
    await updateConsist(props.loco.id, newConsist)
    show.value = false
  }
}

async function toggleLocoDir(cloco, direction:boolean) {
  if (props.loco) {
    const newConsist = (props.loco.consist || []).map((l) => {
      if (l.address === cloco.address) {
        l.direction = direction
      }
      return l
    })
    console.log('newConsist', newConsist)
    await updateConsist(props.loco.id, newConsist)
  }
}

</script>
<template>
  <div class="my-2 p-2 inset-2 bg-gray-500 rounded-full  w-auto">
    <v-chip 
      class="ma-1" 
      variant="elevated" 
      prepend-icon="mdi-arrow-left-circle"
      :color="color.value"
    >
      {{ loco?.locoId }}
    </v-chip>
    <v-chip v-if="loco?.consist?.length > 0" v-for="cloco in loco?.consist"
      class="ma-1" 
      variant="elevated" 
      :prepend-icon="cloco.direction ? 'mdi-arrow-left-circle' : ''" 
      :append-icon="!cloco.direction ? 'mdi-arrow-right-circle' : ''"
      :key="cloco.address" 
      :color="color.value"
    >
    {{ cloco?.address }}
    </v-chip>
    <v-chip 
      class="ma-1 border-dashed" 
      variant="outlined" 
      prepend-icon="mdi-arrow-left-circle"
      append-icon="mdi-arrow-right-circle"
      :color="color.value"
      @click="show = !show"
    >
      <v-icon icon="mdi-plus"></v-icon>
    </v-chip>
  </div>
  <v-list>
    <LeadLoco v-if="loco?.consist?.length > 0" :loco="loco" :color="color" />
    <v-divider></v-divider>
    <template v-for="cloco in loco?.consist" :key="cloco.address">
      <ConsistLoco 
        :cloco="cloco" 
        :color="color" 
        @toggle="toggleLocoDir" 
        @trim="handleAdjustTrim" 
        @delete="handleRemoveLoco" 
      />
      <v-divider></v-divider>
    </template>
    <AddConsistLoco 
      :alocos="locos" 
      :loco="loco" 
      :color="color" 
      :open="show"
      @add="handleAddLoco"
    />
    
    <v-divider></v-divider>
  </v-list>
</template>