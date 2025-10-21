<script setup lang="ts">
import { ref } from 'vue'
import type { Effect } from '@repo/modules'
import { useRouter } from 'vue-router'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import EffectsList from '@/Effects/EffectsList.vue'
import EffectSorter from '@/Effects/EffectSorter.vue'
import AddTile from '@/Core/UI/AddTile.vue'
import { ListMenu } from '@repo/ui'

const router = useRouter()
const showSorter = ref(false)

function handleEdit(effect: Effect) {
  router.push({ name: 'Edit Effect', params: { effectId: effect.id } })
}

function handleAdd() {
  router.push({ name: 'Add Effect' })
}

</script>
<template>
  <ModuleTitle menu="Effects">
    <ListMenu :disabledMenus="['view']" :module-name="'effects'" />
    <v-btn @click="showSorter = !showSorter" icon="mdi-sort-variant"></v-btn>
  </ModuleTitle>

  <v-dialog v-model="showSorter" max-width="80vw">
    <EffectSorter @close="showSorter = false" />
  </v-dialog>

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

  <EffectsList @edit="handleEdit">
    <template #prepend>
      <AddTile @click="handleAdd" color="purple" />
    </template>
  </EffectsList>
</template>