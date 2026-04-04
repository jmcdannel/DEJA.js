<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocos, ROADNAMES, type Loco, type RoadName } from '@repo/modules/locos'
import { useDcc } from '@repo/dccex'
import { createLogger } from '@repo/utils'
import { ConsistIndicator } from '@repo/ui'
import ViewJson from '@/Core/UI/ViewJson.vue'
import Functions from '@/Roster/Functions/Functions.vue'
import ColorPickerRow from '@/Common/Color/ColorPickerRow.vue'
import FormPageHeader from '@/Common/FormPageHeader.vue'

const log = createLogger('EditLoco')
const { syncRosterEntry } = useDcc()

interface ValidationRules {
  required: ((val: unknown) => boolean | string)[]
}

const route = useRoute()
const router = useRouter()
const { getLoco, updateLoco, getRoadname } = useLocos()

const locoDoc = getLoco(parseInt(route.params.address.toString()))
const loco = computed(() => (locoDoc.value as Loco) || null)

const roadname = ref<RoadName | undefined>(undefined)
const color = ref<string>('pink')
const hasSound = ref(true)
const identityLoading = ref(false)
const functionsRef = ref<InstanceType<typeof Functions> | null>(null)

const rules: ValidationRules = {
  required: [(val) => !!val || 'Required.'],
}

watch(
  loco,
  (newLoco) => {
    if (newLoco) {
      roadname.value = getRoadname(newLoco.meta?.roadname || '')
      color.value = newLoco.meta?.color || roadname.value?.color || 'pink'
      hasSound.value = newLoco.hasSound !== false
    }
  },
  { immediate: true }
)

async function saveIdentity() {
  identityLoading.value = true
  const newLoco = structuredClone(loco.value) || {}
  newLoco.meta = newLoco.meta || {}
  newLoco.meta.roadname = roadname.value?.value || ''
  newLoco.meta.color = color.value || 'primary'
  newLoco.hasSound = hasSound.value

  log.debug('Saving identity', newLoco)
  const nameChanged = newLoco.name !== loco.value?.name
  await updateLoco(loco.value.id, newLoco)
  if (nameChanged) {
    void syncRosterEntry(loco.value.address, newLoco.name, loco.value.functions)
  }
  identityLoading.value = false
}

async function saveFunctions() {
  if (functionsRef.value) {
    await functionsRef.value.handleSave()
  }
}
</script>
<template>
  <div v-if="loco" class="animate-fade-in-up space-y-4 max-w-[800px] px-4">
    <FormPageHeader
      icon="mdi-train"
      :title="loco.name || 'Unnamed Loco'"
      :color="color"
      back-label="Roster"
      :back-route="{ name: 'Roster' }"
    >
      <template #subtitle>
        <span class="text-xs text-white/45 bg-white/6 px-2 py-0.5 rounded font-mono">DCC #{{ loco.address }}</span>
        <span
          v-if="roadname?.label"
          class="text-xs px-2 py-0.5 rounded"
          :style="{ color: `color-mix(in srgb, ${color} 80%, white)`, background: `color-mix(in srgb, ${color} 10%, transparent)` }"
        >{{ roadname.label }}</span>
      </template>
    </FormPageHeader>

    <!-- ═══ IDENTITY SECTION — pink accent ═══ -->
    <v-form validate-on="submit lazy" @submit.prevent="saveIdentity">
      <div class="form-section" :style="{ '--form-accent': color }">
        <div class="form-section__header">
          <v-icon size="18" class="form-section__header-icon">mdi-label</v-icon>
          <span class="form-section__title">Identity</span>
        </div>

        <!-- DCC Address + Name grid -->
        <div class="form-section__grid" style="grid-template-columns: 160px 1fr">
          <div>
            <label class="form-section__input-label">DCC Address</label>
            <v-text-field
              v-model="loco.address"
              variant="outlined"
              density="compact"
              :color="color"
              :rules="rules.required"
              hide-details="auto"
            />
            <div class="form-section__input-hint">2 or 4-digit decoder address</div>
          </div>
          <div>
            <label class="form-section__input-label">Name</label>
            <v-text-field
              v-model="loco.name"
              variant="outlined"
              density="compact"
              :color="color"
              hide-details="auto"
            />
            <div class="form-section__input-hint">Display name for this locomotive</div>
          </div>
        </div>

        <!-- Roadname chips -->
        <div class="form-section__row form-section__row--block">
          <span class="form-section__row-name mb-2">Roadname</span>
          <v-chip-group v-model="roadname" selected-class="text-pink-400" column mandatory>
            <v-chip
              v-for="road in ROADNAMES"
              :key="road.value"
              :value="road"
              :text="road.label"
              variant="outlined"
              filter
              size="small"
            />
          </v-chip-group>
        </div>

        <ColorPickerRow v-model="color" :default-color="loco?.meta?.color ?? 'pink'" description="Theme color for throttle & UI" />

        <!-- Sound toggle row -->
        <div class="form-section__row">
          <div class="form-section__row-label">
            <span class="form-section__row-name">Onboard Sound</span>
            <span class="form-section__row-desc">Locomotive has sound decoder</span>
          </div>
          <v-switch v-model="hasSound" color="pink" hide-details density="compact" />
        </div>

        <!-- Save footer -->
        <div class="form-section__footer">
          <v-btn variant="tonal" color="pink" size="small" type="submit" :loading="identityLoading" class="text-none">Save</v-btn>
        </div>
      </div>
    </v-form>

    <!-- ═══ EZ CONSIST — purple accent ═══ -->
    <div class="form-section" style="--form-accent: #7c3aed">
      <div class="form-section__header">
        <v-icon size="18" class="form-section__header-icon">mdi-link-variant</v-icon>
        <span class="form-section__title">EZ Consist</span>
      </div>
      <div class="px-5 py-4">
        <ConsistIndicator :loco="loco" />
        <div class="form-section__input-hint mt-2">Tap to add or remove consist members</div>
      </div>
    </div>

    <!-- ═══ FUNCTIONS — pink accent ═══ -->
    <div class="form-section" :style="{ '--form-accent': color }">
      <div class="form-section__header">
        <v-icon size="18" class="form-section__header-icon">mdi-tune-vertical</v-icon>
        <span class="form-section__title">Functions</span>
        <span class="text-xs opacity-30">F0 – F28</span>
      </div>
      <Functions ref="functionsRef" :loco="loco" />
      <div class="form-section__footer">
        <v-btn
          variant="tonal"
          color="pink"
          size="small"
          :disabled="!functionsRef?.isModified"
          class="text-none"
          @click="saveFunctions"
        >Save</v-btn>
      </div>
    </div>

    <!-- Debug JSON -->
    <ViewJson :json="loco" label="RAW Loco Data" />
    <ViewJson :json="loco?.consist" label="RAW Consist Data" />
  </div>
</template>
