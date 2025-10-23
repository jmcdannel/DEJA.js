<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTourStore } from '../stores/tour'
import { useCollection } from 'vuefire'
import { useEfx } from '@repo/modules'
import GuestEffectCard from '../components/GuestEffectCard.vue'

const tourStore = useTourStore()
const selectedCategory = ref<string | null>(null)
const { getGuestEffects } = useEfx()
const effects = getGuestEffects()

</script>

<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-card elevation="4" class="mb-6">
          <v-card-title class="text-h4">
            <v-icon icon="mdi-lightning-bolt" class="mr-3"></v-icon>
            Interactive Effects Control
          </v-card-title>
          <v-card-subtitle class="text-h6">
            Control guest-accessible effects throughout the layout
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col 
        v-for="effect in effects as any[]" 
        :key="effect.id" 
        cols="12" 
        md="6" 
        lg="4"
      >
        <GuestEffectCard :effect="effect" />
      </v-col>
    </v-row>

  </div>
</template>

<style scoped>
</style>
