<script setup lang="ts">
import { ref } from 'vue'
import { ConsistLoco, Loco, useLocos } from '@repo/modules/locos'
import LeadLoco from '@/Roster/Consist/LeadLoco.vue'
import ConsistLocoCmp from '@/Roster/Consist/ConsistLoco.vue'
import AddConsistLoco from '@/Roster/Consist/AddConsistLoco.vue'

const props = defineProps<{
  loco: Loco
  color: string
}>()

const { getLocos, updateConsist } = useLocos()
const show = ref(false)

const locos = getLocos()

async function handleRemoveLoco(cloco: ConsistLoco) {
  if (props.loco) {
    const newConsist = (props.loco.consist || [])
      .filter((l:ConsistLoco) => l.address !== cloco.address)
    console.log('newConsist', newConsist)
    if (props.loco.id) {
      await updateConsist(props.loco.id, newConsist)
    }
    // locos.value = getLocos()
  }
}

async function handleAdjustTrim(cloco: ConsistLoco, trim: number) {
  if (props.loco) {
    const newConsist = (props.loco.consist || []).map((l:ConsistLoco) => {
      if (l.address === cloco.address) {
        l.trim += trim
      }
      return l
    })
    console.log('newConsist', newConsist)
    if (props.loco.id) {
      await updateConsist(props.loco.id, newConsist)
    }
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
    if (props.loco.id) {
      await updateConsist(props.loco.id, newConsist)
    }
    show.value = false
  }
}

async function toggleLocoDir(cloco: ConsistLoco, direction:boolean) {
  if (props.loco) {
    const newConsist = (props.loco.consist || []).map((l:ConsistLoco) => {
      if (l.address === cloco.address) {
        l.direction = direction
      }
      return l
    })
    console.log('newConsist', newConsist)
    if (props.loco.id) {
      await updateConsist(props.loco.id, newConsist)
    }
  }
}

</script>
<template>
  <div class="my-2 p-2 inset-2 bg-gray-500 rounded-full  w-auto">
    <v-chip 
      class="ma-1" 
      variant="elevated" 
      prepend-icon="mdi-arrow-left-circle"
      :color="color || 'primary'"
    >
      {{ loco?.address }}
    </v-chip>
    <v-chip v-if="(loco?.consist?.length || 0) > 0" v-for="cloco in loco?.consist"
      class="ma-1" 
      variant="elevated" 
      :prepend-icon="cloco.direction ? 'mdi-arrow-left-circle' : ''" 
      :append-icon="!cloco.direction ? 'mdi-arrow-right-circle' : ''"
      :key="cloco.address" 
      :color="color || 'primary'""
    >
    {{ cloco?.address }}
    </v-chip>
    <v-chip 
      class="ma-1 border-dashed" 
      variant="outlined" 
      prepend-icon="mdi-arrow-left-circle"
      append-icon="mdi-arrow-right-circle"
      :color="color || 'primary'"
      @click="show = !show"
    >
      <v-icon icon="mdi-plus"></v-icon>
    </v-chip>
  </div>
  <v-list>
    <LeadLoco v-if="(loco?.consist?.length || 0) > 0" :loco="loco" :color="color" />
    <v-divider></v-divider>
    <template v-for="cloco in loco?.consist" :key="cloco.address">
      <ConsistLocoCmp 
        :cloco="cloco" 
        :color="color || 'primary'" 
        @toggle="toggleLocoDir" 
        @trim="handleAdjustTrim" 
        @delete="handleRemoveLoco" 
      />
      <v-divider></v-divider>
    </template>
    <AddConsistLoco 
      :alocos="locos as Loco[]" 
      :loco="loco" 
      :color="color" 
      :open="show"
      @add="handleAddLoco"
    />
    
    <v-divider></v-divider>
  </v-list>
</template>