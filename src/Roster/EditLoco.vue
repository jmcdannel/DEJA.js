<script setup lang="ts">
import { ref } from 'vue'
import {
  BsFillTrainFreightFrontFill,
} from 'vue3-icons/bs'
import { useDocument } from 'vuefire'
import { useLocos } from '@/Roster/useLocos'
import { useColors } from '@/Core/UI/useColors'
import ViewJson from '@/Core/UI/ViewJson.vue';
import EditConsist from '@/Roster/Consist/EditConsist.vue'
import Functions from '@/Roster/Functions/Functions.vue'

const locoTypes = [
  'Steam',
  'Diesel',
  'Electric'
]
const { colors, getColor } = useColors()

const props = defineProps({
  layoutId: String,
  loco: Object
})
const emit = defineEmits(['close'])
const { roadnames, getLoco, updateLoco, getRoadname } = useLocos()
console.log('typeof lco', props.loco, typeof props.loco)
const locoDoc = getLoco(props.loco?.id ? props.loco.id : null)

const address = ref(props.loco?.locoId || null)
const name = ref(props.loco?.name || '')
const roadname = ref(getRoadname(props.loco?.meta?.roadname) || null)
const roadnameVal = ref(roadname.value?.value)
const loading = ref(false)
const rules = {
  required: [(val) => !!val || 'Required.']
}
const color = getColor(roadname?.value?.color)

async function submit (e) {
  loading.value = true

  const results = await e
  console.log(results)

  const newAddress = parseInt(address.value as unknown as string) 
  console.log('handleSave', newAddress, props.layoutId, props.loco?.id)
  if (!!newAddress && props.layoutId && props.loco?.id) {
    await updateLoco(props.layoutId, props.loco.id, newAddress, name.value, roadnameVal.value || undefined)
  }

  loading.value = false
  emit('close')
}

</script>
<template>
  <v-divider class="my-8 border-pink-500"></v-divider>
  <h2 class="text-lg mb-8 bg-gradient-to-r from-pink-700 to-pink-400 p-3">
    <v-icon icon="mdi-train" class="mr-2"></v-icon>
    Edit Loco
  </h2>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <v-text-field
        v-model="address"
        label="DCC Address"
        variant="outlined"
        prepend-icon="mdi-train"
        hint="2/4-digit DCC address"
        color="pink"
        class="mr-4"
        :rules="rules.required"
        clearable
      >
        <template #append>
          <v-icon icon="mdi-check" color="gray" class="opacity-10"></v-icon>
        </template>
      </v-text-field>
      <v-text-field
        v-model="name"
        label="Name"
        variant="outlined"
        color="pink"
        class="col-span-2"
        clearable
      >
      </v-text-field>
    </div>
    <v-divider class="my-4"></v-divider>
    <v-chip-group
        v-model="roadnameVal"
        selected-class="text-primary"
        column
        mandatory
      >
        <v-chip
          v-for="road in roadnames" :key="road.value" :value="road.value" :text="road.label"
          variant="outlined"
          :class="`${getColor(road.color)?.border}`"
          filter
        ></v-chip>
    </v-chip-group>
    <div class="grid grid-cols-2 gap-8 my-4">   
      <v-btn
        class="mt-2"
        text="Close"
        type="button"
        variant="tonal"
        @click="$emit('close')"
        block
      ></v-btn>
      <v-btn
        :loading="loading"
        class="mt-2"
        text="Submit"
        type="submit"
        color="pink"
        block
      ></v-btn>  
    </div>
  </v-form>  
  <v-divider class="my-8 border-pink-500"></v-divider>
  <h2 class="text-lg mb-8 bg-gradient-to-r from-pink-700 to-pink-400 p-3">
    <v-icon icon="mdi-train" class="mr-2"></v-icon>
    Consist
  </h2>
  <EditConsist :loco="locoDoc" :color="color" />
  <v-divider class="my-8 border-pink-500"></v-divider>
  <h2 class="text-lg mb-8 bg-gradient-to-r from-pink-700 to-pink-400 p-3">
    <v-icon icon="mdi-cogs" class="mr-2"></v-icon>
    Functions
  </h2>
  <Functions :loco="locoDoc" :color="color" />
  <ViewJson :json="loco" label="RAW Loco Data"></ViewJson>
  <ViewJson :json="loco?.consist" label="RAW Cosist Data"></ViewJson>
</template>