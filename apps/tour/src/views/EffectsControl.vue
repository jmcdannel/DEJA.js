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
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title>Available Effects</v-card-title>
          <v-card-text>
            <!-- Loading State -->
            <div v-if="!tourStore.firebaseEffects || tourStore.firebaseEffects.length === 0" class="text-center py-8">
              <v-progress-circular indeterminate class="mb-4"></v-progress-circular>
              <p class="text-h6">Loading effects...</p>
            </div>
            
            <!-- Error State -->
            <v-alert v-else-if="tourStore.error" type="error" class="mb-4">
              {{ tourStore.error }}
            </v-alert>
            
            <!-- No Effects State -->
            <div v-else-if="filteredGuestEffects.length === 0" class="text-center py-8">
              <v-icon icon="mdi-lightning-bolt-outline" size="64" class="text-medium-emphasis mb-4"></v-icon>
              <h3 class="text-h5 text-medium-emphasis mb-2">No Guest Effects Available</h3>
              <p class="text-body-1 text-medium-emphasis mb-4">
                No effects are currently marked as "allowGuest" for visitor control.
              </p>
              <v-btn color="primary" href="/cloud" target="_blank">
                Configure Effects in Cloud App
              </v-btn>
            </div>
            
            <!-- Effects Grid -->
            <v-row v-else>
              <v-col 
                cols="12" 
                sm="6" 
                lg="4" 
                v-for="effect in filteredGuestEffects" 
                :key="effect.id"
              >
                <GuestEffectCard 
                  :effect="effect" 
                  @activate="tourStore.activateEffect"
                  @deactivate="tourStore.deactivateEffect"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="text-h6">Effect Categories</v-card-title>
          <v-card-text>
            <v-chip-group 
              v-model="selectedCategory" 
              column
              @update:model-value="filterEffects"
            >
              <v-chip 
                v-for="category in categories" 
                :key="category"
                :value="category"
                filter
              >
                {{ category }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
        </v-card>

        <v-card elevation="2" class="mb-4">
          <v-card-title class="text-h6">Active Effects</v-card-title>
          <v-card-text>
            <v-list v-if="tourStore.activeEffects.length > 0">
              <v-list-item 
                v-for="effect in tourStore.activeEffects" 
                :key="effect.id"
                :prepend-icon="effect.icon || 'mdi-lightning-bolt'"
              >
                <v-list-item-title>{{ effect.name }}</v-list-item-title>
                <template v-slot:append>
                  <v-btn 
                    icon="mdi-stop" 
                    size="small" 
                    color="secondary"
                    @click="tourStore.deactivateEffect(effect.id)"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
            <p v-else class="text-medium-emphasis">No effects currently active</p>
          </v-card-text>
        </v-card>

        <v-card elevation="2">
          <v-card-title class="text-h6">Safety Notice</v-card-title>
          <v-card-text>
            <v-alert type="info" variant="tonal">
              <p class="mb-2">
                <strong>Guest Mode Active</strong>
              </p>
              <p class="text-body-2">
                Only effects marked as "allowGuest" are available. 
                Some effects have automatic timeouts for safety.
              </p>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTourStore } from '../stores/tour'
import { GuestEffectCard } from '@repo/ui'

const tourStore = useTourStore()
const selectedCategory = ref<string | null>(null)

const filteredGuestEffects = computed(() => 
  tourStore.guestEffects.filter(effect => 
    selectedCategory.value === null || effect.category === selectedCategory.value
  )
)

const categories = computed(() => 
  [...new Set(tourStore.guestEffects.map(e => e.category || 'Other'))]
)

const filterEffects = () => {
  // Filter logic is handled by the computed property
}
</script>