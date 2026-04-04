<script setup lang="ts">
import { computed, ref } from 'vue'
import { routeType, type Route, type RouteTurnoutConfig, type RouteInput } from '@repo/modules/index.ts'
import { useRoutes } from '@repo/modules/routes/useRoutes'
import { createLogger } from '@repo/utils'
import ViewJson from '@/Core/UI/ViewJson.vue'
import RouteTurnoutForm from '@/Routes/RouteTurnoutForm.vue'
import ColorPickerRow from '@/Common/Color/ColorPickerRow.vue'
import TagPicker from '@/Common/Tags/TagPicker.vue'
import { slugify } from '@repo/utils/slugify'

const log = createLogger('RouteForm')
// TODO: icon picker

interface ValidationRules {
  required: ((val: unknown) => boolean | string)[];
}

const props = defineProps<{
  route: Route
}>()

const emit = defineEmits(['close'])

const { setRoute, runRoute } = useRoutes()

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
    order: props.route?.order || 0,
    description: props.route?.description || name.value,
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
    order: props.route?.order || 0,
    description: props.route?.description || name.value,
  }
  await setRoute(routeId, newRoute)

  loading.value = false
  emit('close')
}

function handleTurnouts(updated: RouteTurnoutConfig[]) {
  log.debug('updated turnouts', updated)
  turnouts.value = updated
}

function runCurrentRoute() {
  runRoute(buildRoutePayload())
}

</script>
<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <!-- ═══ IDENTITY SECTION ═══ -->
    <div class="form-section" :style="{ '--form-accent': color }">
      <div class="form-section__header">
        <v-icon size="18" class="form-section__header-icon">mdi-tag-outline</v-icon>
        <span class="form-section__title">{{ isEditing ? 'Edit' : 'New' }} Route</span>
      </div>

      <!-- Name + Points grid -->
      <div class="form-section__grid" style="grid-template-columns: 1fr 1fr 1fr">
        <div>
          <label class="form-section__input-label">Name</label>
          <v-text-field
            v-model="name"
            variant="outlined"
            density="compact"
            color="purple"
            :rules="rules.required"
            hide-details="auto"
            placeholder="Main Line"
          />
          <div class="form-section__input-hint">Display name for this route</div>
        </div>
        <div>
          <label class="form-section__input-label">Point 1</label>
          <v-text-field
            v-model="point1"
            variant="outlined"
            density="compact"
            color="purple"
            hide-details="auto"
            placeholder="Yard"
          />
          <div class="form-section__input-hint">Starting endpoint</div>
        </div>
        <div>
          <label class="form-section__input-label">Point 2</label>
          <v-text-field
            v-model="point2"
            variant="outlined"
            density="compact"
            color="purple"
            hide-details="auto"
            placeholder="Station"
          />
          <div class="form-section__input-hint">Ending endpoint</div>
        </div>
      </div>

      <ColorPickerRow v-model="color" :default-color="props.route?.color ?? 'purple'" description="Theme color for this route" />

      <!-- Tags row -->
      <div class="form-section__row form-section__row--block">
        <span class="form-section__row-name mb-2">Tags</span>
        <TagPicker v-model="tags" />
      </div>
    </div>

    <!-- ═══ CONFIGURATION SECTION ═══ -->
    <div class="form-section mt-4" :style="{ '--form-accent': color }">
      <div class="form-section__header">
        <v-icon size="18" class="form-section__header-icon">mdi-directions-fork</v-icon>
        <span class="form-section__title">Configuration</span>
      </div>
      <div class="px-5 py-3">
        <RouteTurnoutForm @change="handleTurnouts" :turnouts="turnouts" />
      </div>

      <!-- Run route row -->
      <div class="form-section__row">
        <div class="form-section__row-label">
          <span class="form-section__row-name">Run Route</span>
          <span class="form-section__row-desc">Throw all turnouts to their configured positions</span>
        </div>
        <v-btn
          variant="tonal"
          color="purple"
          size="small"
          class="text-none"
          prepend-icon="mdi-rocket-launch"
          @click="runCurrentRoute"
        >
          Run
        </v-btn>
      </div>

      <div class="form-section__footer">
        <v-btn variant="tonal" size="small" class="text-none" @click="$emit('close')">Cancel</v-btn>
        <v-btn
          :loading="loading"
          variant="tonal"
          color="purple"
          size="small"
          type="submit"
          class="text-none"
        >
          Save
        </v-btn>
      </div>
    </div>

    <ViewJson :json="route" label="Route" />
  </v-form>
</template>
