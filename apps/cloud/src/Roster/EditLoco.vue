<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {  useRoute, useRouter } from 'vue-router'
import { useLocos, ROADNAMES, type Loco, type RoadName } from '@repo/modules/locos'
import ViewJson from '@/Core/UI/ViewJson.vue'
import EditConsist from '@repo/ui/src/Consist/EditConsist.vue'
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
const settingsDialogOpen = ref(false)
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
  <v-form v-if="loco" validate-on="submit lazy" @submit.prevent="submit" class="my-8">
    <v-card class="my-4 bg-zinc-900">
      <v-card-title class="text-pink-400 text-2xl">Edit Loco</v-card-title>
      <v-card-actions class="flex justify-end">
        <v-btn
          class="mt-2"
          text="Close"
          type="button"
          variant="tonal"
          @click="$router.push({ name: 'Roster' })"
        ></v-btn>
        <v-btn
          :loading="loading"
          class="mt-2"
          text="Submit"
          variant="flat"
          type="submit"
          :color="color"
        ></v-btn>  
      </v-card-actions>
      <v-card-body class="pt-4">
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
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                class="min-h-24 min-w-12 border flex"
                :color="color"
                @click="editColor = true" >
                <!-- <v-icon :icon="efxOpt.icon" :color="efxOpt.color"></v-icon> -->
                <div class="relative flex flex-col justify-center items-center">
                  <v-icon size="16">mdi-palette</v-icon>
                  <div class="mt-4">Color [{{ color }}]</div>
                </div>        
              </v-btn>
            </section>
            <v-dialog max-width="80vw" v-model="editColor">
              <ColorPicker v-model="color" @select="editColor = false" @cancel="editColor = false; color = loco?.meta?.color ?? 'pink'"></ColorPicker>
            </v-dialog>
            
            <v-switch
              v-model="hasSound"
              class="mb-4"
              color="pink"
              hide-details
              label="Locomotive has onboard sound"
            ></v-switch>
          </div>
      </v-card-body>
      <v-card-actions class="flex justify-end bg-zinc-950">
        <v-btn
          class="mt-2"
          text="Close"
          type="button"
          variant="tonal"
          @click="$router.push({ name: 'Roster' })"
        ></v-btn>
        <v-btn
          :loading="loading"
          class="mt-2"
          text="Submit"
          variant="flat"
          type="submit"
          :color="color"
        ></v-btn>  
      </v-card-actions>
    </v-card>
  </v-form>  
  
  <v-divider class="my-4 border-pink-500"></v-divider>
  
  <v-card class="p-2 my-4 bg-zinc-900">
    <v-card-title class="text-pink-400 text-2xl">Consist</v-card-title>
    <v-card-body>

      <div v-if="loco?.consist?.length" class="flex flex-row items-center justify-start overflow-x-auto p-1">
        <v-chip 
          class="ma-1" 
          variant="elevated" 
          prepend-icon="mdi-arrow-left-circle"
          :color="color || 'primary'"
        >
          <v-icon icon="mdi-train"></v-icon>
          {{ loco?.address }}
        </v-chip>
        <template v-for="cloco in loco?.consist" :key="cloco">
          <v-chip 
            class="ma-1" 
            variant="elevated" 
            :append-icon="!cloco.direction ? 'mdi-arrow-right-circle' : undefined"
            :prepend-icon="cloco.direction ? 'mdi-arrow-left-circle' : undefined"
            :color="'secondary'"
            size="small"
          >
            <v-icon icon="mdi-train"></v-icon>
            {{ cloco?.address }}
          </v-chip>
        </template>
      </div>
    </v-card-body>
    <v-card-actions class="flex justify-end">
      <v-btn :color="color" @click="settingsDialogOpen = true" prepend-icon="mdi-cogs" variant="flat">Edit Consist</v-btn>
    </v-card-actions>
  </v-card>

  <v-dialog 
    v-model="settingsDialogOpen" 
    transition="dialog-bottom-transition"
    width="auto"
    min-width="420"
    max-width="80vw">
    <template v-slot:default>
      <EditConsist :loco="loco" :color="color" @close="settingsDialogOpen = false" />
    </template>
  </v-dialog>

  <v-divider class="my-4 border-pink-500"></v-divider>

  <v-card class="p-2 my-4 bg-zinc-900">
    <v-card-title class="text-pink-400 text-2xl">Functions</v-card-title>
    <Functions v-if="loco" :loco="loco" />
  </v-card>

  <ViewJson :json="loco" label="RAW Loco Data"></ViewJson>
  <ViewJson :json="loco?.consist" label="RAW Cosist Data"></ViewJson>
</template>