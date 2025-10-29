<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCollection } from 'vuefire'
import { useTurnouts, routeType, useLayoutRoutes, type Route } from '@repo/modules/index.ts'
import { useRoutes } from '@repo/modules/routes/useRoutes'
import { useColors } from '@/Core/UI/useColors'

const { DEFAULT_COLOR } = useColors()
const { runRoute } = useLayoutRoutes()
const { deleteRoute } = useRoutes()
const { getTurnoutsByIds } = useTurnouts()

const props = defineProps<{
  route: Route
  routeId?: string
}>()

const confirmDelete = ref(false)
const running = ref(false)
const color = computed(() => props.route?.color || routeType.color || DEFAULT_COLOR)
const routeId = computed(() => props.routeId || props.route?.id || '')
const turnouts = useCollection(props?.route?.turnouts ? getTurnoutsByIds(props.route.turnouts.map(t => t.id?.toString() || '')) : null, { ssrKey: `route-turnouts-${routeId.value}` })

async function handleRun() {
  if (!props.route) return
  try {
    running.value = true
    await runRoute(props.route)
  } finally {
    running.value = false
  }
}

async function handleDelete() {
  const id = props.routeId || props.route?.id
  if (!id) return
  await deleteRoute(id)
  confirmDelete.value = false
}

function getTurnoutState(tId: string) {
  if (!turnouts.value) return true
  const turnout = turnouts.value.find(t => t.id === tId)
  return turnout?.state ?? true
}

</script>
<template>
  <v-card
    class="mx-auto w-full h-full justify-between flex flex-col"
    :color="color"
    variant="tonal"
    density="compact"
  >
    <template #title>
      <span class="text-md">{{ route?.name }}</span>
    </template>
    <template #prepend>
      <v-icon
        :icon="routeType.icon"
        class="text-2xl m-3"></v-icon>
    </template>
    <v-card-text 
      class="min-h-8 flex py-2 justify-space-between">
      <v-stepper>
        <v-stepper-header>
          <v-stepper-item :value="'A'">
            <template #title>
              <v-chip
                prepend-icon="mdi-map-marker"
                color="blue"
                variant="flat"
                size="small"
              >
              {{ route?.point1 }}
            </v-chip>
            </template>
          </v-stepper-item>
          <v-divider></v-divider>
          <template v-for="(t, index) in route?.turnouts" :key="t.id ?? index">
            <v-stepper-item :value="(index + 1)">
              <template #title>
                <v-chip :color="(t.state ?? true) ? 'green' : 'red'" size="small" variant="flat" prepend-icon="mdi-call-split">
                  {{ t.name }}
                </v-chip>
                <v-icon class="ml-1" :color="(getTurnoutState(t.id) ?? true) ? 'green' : 'red'" icon="mdi-circle-slice-8" size="20" />
              </template>
            </v-stepper-item>
            <v-divider></v-divider>
          </template>
        <v-stepper-item :value="'B'">
            <template #title>
              <v-chip
                append-icon="mdi-map-marker"
                color="blue"
                variant="flat"
                size="small"
              >{{ route?.point2 }}</v-chip>
            </template>
          </v-stepper-item>
        </v-stepper-header>
      </v-stepper>
    </v-card-text>
    <v-spacer></v-spacer>
    <v-card-actions>
      <v-btn
        v-if="!confirmDelete"
        class="ma-2"
        icon="mdi-delete"
        variant="tonal"
        size="small"
        @click="confirmDelete = true"
      ></v-btn>
      <template v-else>
        <v-btn
          class="ma-2"
          text="Cancel"
          variant="outlined"
          size="small"
          @click="confirmDelete = false" />
        <v-btn
          class="ma-2"
          text="Confirm"
          variant="tonal"
          size="small"
          prepend-icon="mdi-delete"
          @click="handleDelete" />
      </template>
      <v-spacer></v-spacer>
      <v-btn
        text="Edit"
        variant="tonal"
        prepend-icon="mdi-pencil"
        size="small"
        @click="$emit('edit', route)"
      ></v-btn>
      <v-btn
        text="Run"
        variant="tonal"
        prepend-icon="mdi-play"
        size="small"
        :loading="running"
        @click="handleRun"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>
