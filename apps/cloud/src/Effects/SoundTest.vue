<template>
  <div class="sound-test">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h4 mb-4">Sound Effects Test</h1>
          <p class="text-body-1 mb-6">
            This page tests the sound effects system. You can browse curated sounds, 
            test playback, and verify that the system is working correctly.
          </p>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Sound Picker Test</v-card-title>
            <v-card-text>
              <SoundPicker v-model="selectedSound" />
              <div class="mt-4">
                <strong>Selected Sound:</strong> {{ selectedSound || 'None' }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Sound Effects Service Test</v-card-title>
            <v-card-text>
              <div class="mb-4">
                <v-btn @click="testGetAllSounds" class="mr-2">Get All Sounds</v-btn>
                <v-btn @click="testGetByCategory" class="mr-2">Get Train Sounds</v-btn>
                <v-btn @click="testSearch" class="mr-2">Search "whistle"</v-btn>
              </div>
              
              <div v-if="testResults.length > 0" class="mt-4">
                <h3 class="text-h6 mb-2">Test Results:</h3>
                <div class="text-sm">
                  <div v-for="result in testResults" :key="result.id" class="mb-2 p-2 bg-grey-lighten-4 rounded">
                    <strong>{{ result.name }}</strong> ({{ result.category }})
                    <br>
                    <span class="text-grey">{{ result.url }}</span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-6">
        <v-col cols="12">
          <v-card>
            <v-card-title>Available Sound Categories</v-card-title>
            <v-card-text>
              <v-row>
                <v-col v-for="category in soundCategories" :key="category.value" cols="12" sm="6" md="4">
                  <v-card variant="outlined" class="h-full">
                    <v-card-title class="text-h6">{{ category.title }}</v-card-title>
                    <v-card-text>
                      <v-chip :color="getCategoryColor(category.value)" class="mb-2">
                        {{ category.value }}
                      </v-chip>
                      <div class="text-sm text-grey">
                        {{ getSoundsByCategory(category.value).length }} sounds available
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-6">
        <v-col cols="12">
          <v-card>
            <v-card-title>External Libraries</v-card-title>
            <v-card-text>
              <v-row>
                <v-col v-for="library in availableLibraries" :key="library.name" cols="12" sm="6" md="4">
                  <v-card variant="outlined" class="h-full">
                    <v-card-title class="text-h6">{{ library.name }}</v-card-title>
                    <v-card-text>
                      <div class="mb-2">
                        <strong>License:</strong> {{ library.license }}
                      </div>
                      <div class="mb-2">
                        <strong>Categories:</strong>
                        <div class="flex flex-wrap gap-1 mt-1">
                          <v-chip
                            v-for="category in library.categories.slice(0, 5)"
                            :key="category"
                            size="small"
                            variant="outlined"
                          >
                            {{ category }}
                          </v-chip>
                        </div>
                      </div>
                      <div class="text-xs text-grey">
                        {{ library.attribution }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>


    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { soundEffectsService, type SoundCategory } from '@repo/modules'
import SoundPicker from './SoundPicker.vue'


const selectedSound = ref('')
const testResults = ref<any[]>([])

const soundCategories = computed(() => [
  { title: 'Train Sounds', value: 'train' as SoundCategory },
  { title: 'Station Sounds', value: 'station' as SoundCategory },
  { title: 'City Sounds', value: 'city' as SoundCategory },
  { title: 'Nature Sounds', value: 'nature' as SoundCategory },
  { title: 'Ambient Sounds', value: 'ambient' as SoundCategory },
  { title: 'Mechanical', value: 'mechanical' as SoundCategory },
  { title: 'Transport', value: 'transport' as SoundCategory },
  { title: 'Industrial', value: 'industrial' as SoundCategory }
])

const availableLibraries = computed(() => soundEffectsService.getLibraries())

function testGetAllSounds() {
  const sounds = soundEffectsService.getAllSounds()
  testResults.value = sounds
}

function testGetByCategory() {
  const sounds = soundEffectsService.getSoundsByCategory('train')
  testResults.value = sounds
}

function testSearch() {
  const sounds = soundEffectsService.searchSounds('whistle')
  testResults.value = sounds
}

function getSoundsByCategory(category: SoundCategory) {
  return soundEffectsService.getSoundsByCategory(category)
}

function getCategoryColor(category: SoundCategory): string {
  const colors: Record<SoundCategory, string> = {
    train: 'blue',
    station: 'green',
    city: 'orange',
    nature: 'teal',
    ambient: 'purple',
    mechanical: 'red',
    transport: 'indigo',
    industrial: 'brown'
  }
  return colors[category] || 'grey'
}
</script>

<style scoped>
.sound-test {
  padding: 20px;
}
</style>
