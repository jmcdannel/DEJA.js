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
  
  <!-- Sound Management Links -->
  <div class="mb-4 d-flex gap-3">
    <v-btn
      to="/effects/sound-test"
      color="cyan"
      variant="outlined"
      prepend-icon="mdi-volume-high"
    >
      Test Sound Effects
    </v-btn>
    
    <v-btn
      to="/effects/bbc-importer"
      color="blue"
      variant="outlined"
      prepend-icon="mdi-download"
    >
      BBC Sound Importer
    </v-btn>
  </div>
  
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