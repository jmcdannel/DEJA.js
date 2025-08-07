<script setup lang="ts">
import { ref } from 'vue'
import { ConsistLoco, Loco, useLocos } from '@repo/modules/locos'
import LeadLoco from './LeadLoco.vue'
import ConsistLocoCmp from './ConsistLoco.vue'
import AddConsistLoco from './AddConsistLoco.vue'

defineEmits(['close'])
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
  <v-sheet class="my-2 p-2 inset-2 w-auto flex items-center justify-between">
    <div>
      <v-chip 
        class="ma-1" 
        variant="elevated" 
        prepend-icon="mdi-arrow-left-circle"
        :color="color || 'primary'"
      >
        {{ loco?.address }}
      </v-chip>
      <template v-for="cloco in loco?.consist" :key="cloco">
        <v-chip 
          class="ma-1" 
          variant="elevated" 
          :append-icon="!cloco.direction ? 'mdi-arrow-right-circle' : undefined"
          :prepend-icon="cloco.direction ? 'mdi-arrow-left-circle' : undefined"
          :color="'secondary'"
        >
          {{ cloco?.address }}
        </v-chip>
      </template>
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
    <v-btn 
      class="ma-1 self-end" 
      icon="mdi-close" 
      variant="tonal" 
      @click="$emit('close')"
    ></v-btn>
  </v-sheet>
  <v-list>
    <LeadLoco v-if="loco?.consist?.length" :loco="loco" :color="color" />
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