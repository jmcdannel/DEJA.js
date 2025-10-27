<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLayoutRoutes, useRoutes, routeType, type Route, type RouteTurnoutConfig, type RouteInput } from '@repo/modules'
import ViewJson from '@/Core/UI/ViewJson.vue'
import RouteTurnoutForm from '@/Routes/RouteTurnoutForm.vue'
import ColorPicker from '@/Common/Color/ColorPicker.vue'
import TagPicker from '@/Common/Tags/TagPicker.vue'
import { slugify } from '@repo/utils/slugify'
// TODO: icon picker

interface ValidationRules {
  required: ((val: any) => boolean | string)[];
}

const props = defineProps<{
  route: Route
}>()

const emit = defineEmits(['close'])

const { setRoute } = useRoutes()
const { runRoute } = useLayoutRoutes()

const editColor = ref(false)

const name = ref(props.route?.name || '')
const point1 = ref(props.route?.point1)
const point2 = ref(props.route?.point2)
const turnouts = ref<RouteTurnoutConfig[]>(props.route?.turnouts || [])
const color = ref(props.route?.color || routeType.color || 'purple')
const tags = ref<string[]>(props.route?.tags || [])
const loading = ref(false)
const isEditing = computed(() => Boolean(props.route?.id))
const rules: ValidationRules = {
  required: [(val) => !!val || 'Required.']
}

function resolveRouteId() {
  return props.route?.id || `route-${slugify(point1.value || '')}-${slugify(point2.value || '')}`
}

function buildRoutePayload(): Route {
  return {
    ...(props.route || { id: resolveRouteId() }),
    id: props.route?.id || resolveRouteId(),
    name: name.value,
    color: color.value,
    tags: tags.value,
    point1: point1.value || '',
    point2: point2.value || '',
    turnouts: turnouts.value,
    order: props.route?.order,
    description: props.route?.description,
  }
}

async function submit () {
  loading.value = true

  const routeId = props.route?.id || `route-${slugify(point1.value || '')}-${slugify(point2.value || '')}`
  const newRoute: RouteInput = {
    name: name.value,
    color: color.value,
    tags: tags.value,
    point1: point1.value || '',
    point2: point2.value || '',
    turnouts: turnouts.value,
    order: props.route?.order,
    description: props.route?.description,
  }

  await setRoute(routeId, newRoute)

  loading.value = false
  emit('close')
}

function handleTurnouts(updated: RouteTurnoutConfig[]) {
  turnouts.value = updated
}

function runCurrentRoute() {
  runRoute(buildRoutePayload())
}

</script>
<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <div class="flex items-center justify-between">
      <v-label class="m-2 text-4xl">
        <v-icon :icon="routeType.icon" :color="color" class="w-16 h-16 stoke-none mr-4"></v-icon>
        {{ isEditing ? 'Edit' : 'Add'}} Route
      </v-label>
      <v-chip class="m-2" :color="color" size="x-large">
        <v-icon :icon="routeType.icon" class="mr-2"></v-icon>
        {{ routeType.label }}
      </v-chip>
    </div>
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>

    <!-- name, points -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <v-text-field
        v-model="name"
        label="Name"
        variant="outlined"
        :rules="rules.required"
      ></v-text-field>
      <div class="grid grid-cols-2 gap-4">
        <v-text-field
            v-model="point1"
            label="Point 1"
            variant="outlined"
            min-width="100"
            max-width="200"
          >
        </v-text-field>
        <v-text-field
            v-model="point2"
            label="Point 2"
            variant="outlined"
            min-width="100"
            max-width="200"
          >
        </v-text-field>
      </div>
    </div>


    <RouteTurnoutForm @change="handleTurnouts" :turnouts="turnouts"></RouteTurnoutForm>


    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <v-sheet>
      <v-btn text="Run Route" @click="runCurrentRoute">
        <v-icon left>mdi-rocket-launch</v-icon>
        Run Route
      </v-btn>
    </v-sheet>
    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>
    <!-- color -->
    <section class="h-auto  my-4">
      <v-btn
        class="min-h-48 min-w-48 border flex"
        :color="color"
        @click="editColor = true" >
        <div class="relative flex flex-col justify-center items-center">
          <v-icon size="64">mdi-palette</v-icon>
          <div class="mt-4">Color [{{ color }}]</div>
        </div>
      </v-btn>
    </section>
    <v-dialog max-width="80vw" v-model="editColor">
      <ColorPicker v-model="color" @select="editColor = false" @cancel="editColor = false; color = props.route?.color ?? routeType.color"></ColorPicker>
    </v-dialog>

    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>

    <TagPicker class="my-4 " v-model="tags"></TagPicker>

    <v-divider class="my-4 border-opacity-100" :color="color"></v-divider>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 my-4">
      <v-btn
        class="mt-2"
        text="Close"
        type="button"
        variant="tonal"
        @click="$emit('close')"
      ></v-btn>
      <v-btn
        :loading="loading"
        class="mt-2"
        text="Submit"
        type="submit"
        :color="color"
      ></v-btn>
    </div>
    <ViewJson :json="route" label="Route" />
    <ViewJson :json="routeType" label="routeType" />
  </v-form>
</template>
