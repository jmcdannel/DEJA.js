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
    <v-divider />
    <div class="flex items-center pa-1" style="background: rgba(var(--v-theme-on-surface), 0.04)">
      <v-btn
        v-if="!confirmDelete"
        icon="mdi-delete-outline"
        variant="text"
        color="error"
        size="small"
        @click="confirmDelete = true"
      />
      <template v-else>
        <v-btn
          text="Cancel"
          variant="outlined"
          size="small"
          @click="confirmDelete = false"
        />
        <v-btn
          text="Confirm"
          variant="tonal"
          color="error"
          size="small"
          prepend-icon="mdi-delete"
          @click="handleDelete"
        />
      </template>
      <v-spacer />
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        :color="props?.loco?.meta?.color || color.value || 'primary'"
        size="small"
        @click="$emit('edit', loco)"
      />
    </div>
  </v-card>
</template>
