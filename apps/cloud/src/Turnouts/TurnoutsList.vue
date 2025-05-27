<script setup lang="ts">
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'
import TurnoutListItem from '@/Turnouts/TurnoutListItem.vue'
import ViewJson from '@/Core/UI/ViewJson.vue'

defineEmits(['edit'])

const { getTurnouts } = useTurnouts()
const list = getTurnouts()

</script>
<template>
  <v-container>
    <v-row >
      <v-col
        cols="12"
        xs="12"
        sm="6"
        lg="4"
      >
      <slot name="prepend"></slot>      
    </v-col>
      <v-col
        v-for="item in list"
        :key="item.id"
        cols="12"
        xs="12"
        sm="6"
        lg="4"
      >
        <TurnoutListItem :turnout="item as Turnout" :turnoutId="item.id" @edit="$emit('edit', item)"></TurnoutListItem>
    </v-col>
    </v-row>
  </v-container>
  <ViewJson :json="list" label="Turnouts"></ViewJson>
</template>