<script setup lang="ts">
import { ref } from 'vue'
import type { Effect } from '@repo/modules'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import EffectForm from '@/Effects/EffectForm.vue'
import EffectsList from '@/Effects/EffectsList.vue'
import AddTile from '@/Core/UI/AddTile.vue'
import { ListMenu } from '@repo/ui'

const editEffect = ref<Effect | null>(null)
const newEfx: Partial<Effect> = {
  type: '',
  state: false,
  id: '',
  name: '',
  color: 'purple',
  tags: [],
  allowGuest: false
}

</script>
<template>
  <ModuleTitle menu="Effects">
    <ListMenu :disabledMenus="['view']" :module-name="'effects'" />
  </ModuleTitle>
    
  <!-- External Sound Library Quicklinks -->
  <v-card class="mb-4">
    <v-card-title class="text-h6">
      <v-icon icon="mdi-link" class="mr-2" color="info"></v-icon>
      External Sound Libraries
    </v-card-title>
    
    <v-card-text>
      <p class="text-body-2 mb-4">
        Find free sound effects from these external libraries. BBC sounds are automatically available in the SoundPicker component.
      </p>
      
      <div class="d-flex flex-wrap gap-3">
        <v-btn
          href="https://sound-effects.bbcrewind.co.uk"
          target="_blank"
          color="blue"
          variant="outlined"
          prepend-icon="mdi-download"
        >
          BBC Sound Effects
        </v-btn>
        
        <v-btn
          href="https://freesound.org"
          target="_blank"
          color="green"
          variant="outlined"
          prepend-icon="mdi-download"
        >
          Freesound.org
        </v-btn>
        
        <v-btn
          href="https://mixkit.co/free-sound-effects"
          target="_blank"
          color="orange"
          variant="outlined"
          prepend-icon="mdi-download"
        >
          Mixkit
        </v-btn>
        
        <v-btn
          href="https://pixabay.com/sound-effects"
          target="_blank"
          color="red"
          variant="outlined"
          prepend-icon="mdi-download"
        >
          Pixabay
        </v-btn>
        
        <v-btn
          href="https://www.zapsplat.com"
          target="_blank"
          color="purple"
          variant="outlined"
          prepend-icon="mdi-download"
        >
          Zapsplat
        </v-btn>
      </div>
      
      <div class="mt-4 p-3 bg-grey-lighten-4 rounded">
        <div class="text-caption font-weight-medium mb-2">💡 How to use external libraries:</div>
        <ol class="text-caption text-grey-darken-1">
          <li>Browse sounds on the external library website</li>
          <li>Download audio files (MP3, WAV, OGG, M4A)</li>
          <li>Place files in <code>packages/sounds/assets/</code> organized by category</li>
          <li>Run <code>pnpm run scan-sounds</code> to import them</li>
          <li>BBC sounds are automatically loaded from the Vercel blob store</li>
        </ol>
      </div>
    </v-card-text>
  </v-card>
  
  <Transition name="slide">
    <div v-if="editEffect">
      <EffectForm v-if="editEffect" @close="editEffect = null" :efx="editEffect" />
    </div>
    <EffectsList v-else @edit="efx => editEffect = efx">
      <template #prepend>
        <AddTile @click="editEffect = {type: '', state: false, id: '', ...newEfx}" color="purple" />
      </template>
    </EffectsList>
  </Transition>
</template>
<style>

.slide-move,
.slide-leave-active,
.slide-enter-active {
  transition: .5s;
}
.slide-enter {
  transform: translateX(100%);
  opacity: 0;
}
.slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-active {
  position: absolute;
}
</style>