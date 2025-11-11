<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {  useRoute, useRouter } from 'vue-router'
import { useLocos, ROADNAMES, type Loco, type RoadName } from '@repo/modules/locos'
import ViewJson from '@/Core/UI/ViewJson.vue'
import { Consist } from '@repo/ui'
import Functions from '@/Roster/Functions/Functions.vue'
import ColorPicker from '@/Common/Color/ColorPicker.vue'

interface ValidationRules {
  required: ((val: any) => boolean | string)[];
}

const locoTypes = [
  'Steam',
  'Diesel',
  'Electric'
]

const route = useRoute()
const router = useRouter()
const { getLoco, updateLoco, getRoadname } = useLocos()

const locoDoc = getLoco(parseInt(route.params.address.toString()))
const loco = computed(() => locoDoc.value as Loco || null)

const editColor = ref(false)

const roadname = ref<RoadName | undefined>(undefined)
const color = ref<string>('pink')
const hasSound = ref(true)
const loading = ref(false)
const rules:ValidationRules = {
  required: [(val) => !!val || 'Required.']
}

watch(loco, (newLoco) => {
  if (newLoco) {
    roadname.value = getRoadname(newLoco.meta?.roadname || '')
    color.value = newLoco.meta?.color || roadname.value?.color || 'pink'
    hasSound.value = newLoco.hasSound !== false
  }
}, { immediate: true })

async function submit () {
  loading.value = true
  const newLoco = loco.value || {}
  newLoco.meta = newLoco.meta || {}
  newLoco.meta.roadname = roadname.value?.value || ''
  newLoco.meta.color = color.value || 'primary'
  newLoco.hasSound = hasSound.value
  
  console.log('Submitting loco', {
    ...loco.value,
  })

  await updateLoco(loco.value.id, newLoco)

  loading.value = false
  router.push({ name: 'Roster' })
}

</script>
<template>
  <v-divider class="my-8 border-pink-500"></v-divider>
  <v-label class="m-2 text-pink-400 text-2xl">Edit Loco</v-label>
  <v-divider class="my-4 border-pink-500"></v-divider>
  <v-form v-if="loco" validate-on="submit lazy" @submit.prevent="submit">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <v-text-field
        v-model="loco.address"
        label="DCC Address"
        variant="outlined"
        prepend-icon="mdi-train"
        hint="2/4-digit DCC address"
        :color="color"
        class="mr-4"
        :rules="rules.required"
        clearable
      >
        <template #append>
          <v-icon icon="mdi-check" color="gray" class="opacity-10"></v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="loco.name"
        label="Name"
        variant="outlined"
        :color="color"
        class="col-span-2"
        clearable
      >
      </v-text-field>
    </div>
    <v-divider class="my-4"></v-divider>
    <v-switch
      v-model="hasSound"
      class="mb-4"
      color="pink"
      hide-details
      label="Locomotive has onboard sound"
    ></v-switch>
    <p>{{ (getRoadname(loco.meta?.roadname || ''))?.label }}</p>
    <v-chip-group
        v-model="roadname"
        selected-class="text-primary"
        column
        mandatory
      >
        <v-chip
          v-for="road in ROADNAMES" :key="road.value" :value="road" :text="road.label"
          variant="outlined"
          filter
        ></v-chip>
    </v-chip-group>

    <!-- color -->
    <section class="h-auto  my-4">
      <v-btn
        class="min-h-48 min-w-48 border flex"
        :color="color"
        @click="editColor = true" >
        <!-- <v-icon :icon="efxOpt.icon" :color="efxOpt.color"></v-icon> -->
        <div class="relative flex flex-col justify-center items-center">
          <v-icon size="64">mdi-palette</v-icon>
          <div class="mt-4">Color [{{ color }}]</div>
        </div>        
      </v-btn>
    </section>
    <v-dialog max-width="80vw" v-model="editColor">
      <ColorPicker v-model="color" @select="editColor = false" @cancel="editColor = false; color = loco?.meta?.color ?? 'pink'"></ColorPicker>
    </v-dialog>

    <div class=" my-4">   
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
  </v-form>  
  
  <v-divider class="my-8 border-pink-500"></v-divider>
  <v-label class="m-2 text-pink-400 text-2xl">Consist</v-label>
  <v-divider class="my-4 border-pink-500"></v-divider>

  <Consist v-if="loco" :loco="loco" />

  <v-divider class="my-8 border-pink-500"></v-divider>
  <v-label class="m-2 text-pink-400 text-2xl">Functions</v-label>
  <v-divider class="my-4 border-pink-500"></v-divider>

  <Functions v-if="loco" :loco="loco" />

  <ViewJson :json="loco" label="RAW Loco Data"></ViewJson>
  <ViewJson :json="loco?.consist" label="RAW Cosist Data"></ViewJson>
</template>