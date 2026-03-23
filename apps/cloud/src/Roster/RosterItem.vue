<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  BsBezier2,
} from 'vue3-icons/bs'
import { useLocos, type Loco } from '@repo/modules/locos'
import { createLogger } from '@repo/utils'
import { useColors } from '@/Core/UI/useColors'

const log = createLogger('RosterItem')

defineEmits(['edit'])
const props = defineProps<{
  loco: Loco
}>()

const { colors, DEFAULT_COLOR } = useColors()
const { getRoadname, deleteLoco } = useLocos()

const confirmDelete = ref(false)
const roadname = computed(() => props.loco.meta?.roadname ? getRoadname(props.loco.meta?.roadname) : null)
const color = computed(() => colors[roadname?.value?.color || DEFAULT_COLOR])

//  watch(() => props.loco?.roadname, (value) => {
//    roadname.value = getRoadname(value?.meta?.roadname)
//    color.value = colors[roadname?.color || DEFAULT_COLOR]
//  })

 async function handleDelete() {
  log.debug('handleDelete', props.loco.id)
  if (!props.loco.id) {
    log.error('No loco ID provided for deletion')
    return
  }
  await deleteLoco(props.loco.id)
  confirmDelete.value = false
 }

</script>
<template>
  <v-card
    class="mx-auto w-full justify-between flex flex-col"
    :color="color.value"
    :title="loco?.name"
    :subtitle="roadname?.label || 'Loco'"
    variant="tonal"
    density="compact"
  >
    <template #prepend>
      <v-icon class="drag-handle cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 mr-1" size="small">mdi-drag</v-icon>
    </template>
    <template #append>
      <v-avatar size="small" :color="props?.loco?.meta?.color || color.value">{{ loco?.address }}</v-avatar>
    </template>
    <v-card-text class="min-h-10 flex flex-wrap py-1">
        <v-badge
          class="m-2"
          :color="props?.loco?.meta?.color || color.value || 'primary'"
          :content="loco?.functions?.length || 0"
          >
          <v-chip variant="outlined"
            :color="props?.loco?.meta?.color || color.value || 'primary'">
            Functions
            <template #prepend>
              <BsBezier2 class="mr-2"></BsBezier2>
            </template>
          </v-chip>
        </v-badge>
        <v-badge 
          class="m-2"
          :color="props?.loco?.meta?.color || color.value || 'primary'"
          :content="(loco?.consist?.length || 0) + 1">
          <v-chip variant="outlined"
            :color="props?.loco?.meta?.color || color.value || 'primary'">
            Consist
            <template #prepend>
              <v-icon class="mr-2" icon="mdi-cogs"></v-icon>
            </template>
          </v-chip>
        </v-badge>
    </v-card-text>
    <v-spacer></v-spacer>
    <v-card-actions class="py-1">
      <v-btn
        :color="props?.loco?.meta?.color || color.value || 'primary'"
        text="Edit"
        variant="tonal"
        size="x-small"
       @click="$emit('edit', loco)"
      ></v-btn>
      <v-spacer></v-spacer>
      <v-btn
        icon="mdi-delete"
        variant="tonal"
        size="x-small"
        @click="confirmDelete = true"></v-btn>
    </v-card-actions>
  </v-card>
  <v-dialog
      v-model="confirmDelete"
      max-width="400"
      persistent
    ><v-card
      prepend-icon="mdi-delete"
      title="Confirm Delete"
      text="Are you sure you want to delete this loco? There is no undo."
      >
      <template v-slot:actions>
        <v-spacer></v-spacer>
        <v-btn @click="confirmDelete = false">
          Cancel
        </v-btn>
        <v-btn @click="handleDelete">
          Agree
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
