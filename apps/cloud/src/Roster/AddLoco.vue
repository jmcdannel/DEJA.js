<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocos, ROADNAMES } from '@repo/modules/locos'

interface ValidationRules {
  required: ((val: unknown) => boolean | string)[]
}

const router = useRouter()
const { createLoco } = useLocos()

const address = ref<number | null>(null)
const name = ref('')
const roadname = ref(null)
const loading = ref(false)
const hasSound = ref(true)
const rules: ValidationRules = {
  required: [(val) => !!val || 'Required.'],
}

async function submit() {
  loading.value = true
  const newAddress = parseInt(address.value as unknown as string)
  if (newAddress) {
    await createLoco(newAddress, name.value, roadname.value || undefined, hasSound.value)
  }
  loading.value = false
  router.push({ name: 'Roster' })
}
</script>

<template>
  <div class="animate-fade-in-up space-y-4 max-w-[800px] px-4">
    <!-- ═══ HERO HEADER ═══ -->
    <div
      class="flex items-center gap-4 p-5 rounded-[14px] border"
      style="
        background: linear-gradient(135deg, rgba(244, 114, 182, 0.08), transparent);
        border-color: rgba(244, 114, 182, 0.15);
      "
    >
      <div class="w-14 h-14 rounded-[14px] flex items-center justify-center flex-shrink-0 bg-pink-500/80">
        <v-icon size="28" color="white">mdi-train</v-icon>
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-white/95 tracking-tight">New Locomotive</h1>
        <div class="flex items-center gap-2.5 mt-1">
          <span class="text-xs text-white/45">Add a loco to your roster</span>
        </div>
      </div>
      <v-btn variant="outlined" size="small" class="text-none" @click="router.push({ name: 'Roster' })">
        <v-icon start size="16">mdi-arrow-left</v-icon>
        Roster
      </v-btn>
    </div>

    <!-- ═══ IDENTITY SECTION ═══ -->
    <v-form validate-on="submit lazy" @submit.prevent="submit">
      <div class="form-section" style="--form-accent: #f472b6">
        <div class="form-section__header">
          <v-icon size="18" class="form-section__header-icon">mdi-label</v-icon>
          <span class="form-section__title">Identity</span>
        </div>

        <!-- DCC Address + Name grid -->
        <div class="form-section__grid" style="grid-template-columns: 160px 1fr">
          <div>
            <label class="form-section__input-label">DCC Address</label>
            <v-text-field
              v-model="address"
              variant="outlined"
              density="compact"
              color="pink"
              :rules="rules.required"
              hide-details="auto"
              placeholder="3"
              type="number"
            />
            <div class="form-section__input-hint">2 or 4-digit decoder address</div>
          </div>
          <div>
            <label class="form-section__input-label">Name</label>
            <v-text-field
              v-model="name"
              variant="outlined"
              density="compact"
              color="pink"
              hide-details="auto"
              placeholder="BNSF 5801"
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
              :value="road.value"
              :text="road.label"
              variant="outlined"
              filter
              size="small"
            />
          </v-chip-group>
        </div>

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
          <v-btn variant="tonal" size="small" class="text-none" @click="router.push({ name: 'Roster' })">Cancel</v-btn>
          <v-btn variant="tonal" color="pink" size="small" type="submit" :loading="loading" class="text-none">Add Locomotive</v-btn>
        </div>
      </div>
    </v-form>
  </div>
</template>
