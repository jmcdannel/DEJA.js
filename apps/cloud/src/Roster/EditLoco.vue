<script setup lang="ts">
import { ref } from 'vue'
import { useLocos, ROADNAMES, type Loco } from '@repo/modules/locos'
import { useColors } from '@/Core/UI/useColors'
import ViewJson from '@/Core/UI/ViewJson.vue';
import EditConsist from '@/Roster/Consist/EditConsist.vue'
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

const props = defineProps({
  loco: Object
})
const emit = defineEmits(['close'])
const { getLoco, updateLoco, getRoadname } = useLocos()

const locoDoc = getLoco(props.loco?.id ? props.loco.id : null)

const editColor = ref(false)
const address = ref(props.loco?.locoId || null)
const name = ref(props.loco?.name || '')
const roadname = ref(getRoadname(props.loco?.meta?.roadname) || null)
const roadnameVal = ref(roadname.value?.value)
const color = ref(props.loco?.meta?.color || roadname?.value?.color || 'pink')  
const loading = ref(false)
const rules:ValidationRules = {
  required: [(val) => !!val || 'Required.']
}
// const color = getColor(roadname?.value?.color)

async function submit () {
  loading.value = true

  if (!!address && props.loco?.id) {
    const loco: Loco = {
      ...props.loco,
      locoId: address.value,
      name: name.value,
      meta: {
        color: color.value,
        roadname: roadnameVal.value || undefined
      },
      consist: props.loco?.consist || [],
      functions: props.loco?.functions || [],
    }

    await updateLoco(props.loco.id, {...loco})
  }

  loading.value = false
  emit('close')
}

</script>
<template>
  <v-divider class="my-8 border-pink-500"></v-divider>
  <v-label class="m-2 text-pink-400 text-2xl">Edit Loco</v-label>
  <v-divider class="my-4 border-pink-500"></v-divider>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <v-text-field
        v-model="address"
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
        v-model="name"
        label="Name"
        variant="outlined"
        :color="color"
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
          v-for="road in ROADNAMES" :key="road.value" :value="road.value" :text="road.label"
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
      <ColorPicker v-model="color" @select="editColor = false" @cancel="editColor = false; color = props.loco?.meta?.color ?? 'pink'"></ColorPicker>
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

  <EditConsist :loco="locoDoc as Loco" :color="color" />

  <v-divider class="my-8 border-pink-500"></v-divider>
  <v-label class="m-2 text-pink-400 text-2xl">Functions</v-label>
  <v-divider class="my-4 border-pink-500"></v-divider>

  <Functions v-if="locoDoc" :loco="locoDoc" />

  <ViewJson :json="loco" label="RAW Loco Data"></ViewJson>
  <ViewJson :json="loco?.consist" label="RAW Cosist Data"></ViewJson>
</template>