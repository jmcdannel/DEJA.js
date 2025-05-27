<script setup lang="ts">
import { ref } from 'vue'
import { useLocos, ROADNAMES } from '@repo/modules/locos'

interface ValidationRules {
  required: ((val: any) => boolean | string)[];
}

const emit = defineEmits(['close'])

const { createLoco } = useLocos()

const address = ref(null)
const name = ref('')
const roadname = ref(null)
const loading = ref(false)
const rules:ValidationRules = {
  required: [(val) => !!val || 'Required.']
}

async function submit () {
  loading.value = true

  const newAddress = parseInt(address.value as unknown as string) 
  if (!!newAddress) {
    await createLoco( newAddress, name.value, roadname.value || undefined)
  }

  loading.value = false
  emit('close')
}

</script>
<template>
<v-sheet class="p-5">
  <h2 class="text-xl mb-8 bg-gradient-to-r from-pink-700 to-pink-400 p-3">
    <v-icon icon="mdi-train" class="mr-2"></v-icon>
    Add Loco
  </h2>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
      <v-text-field
        v-model="address"
        label="DCC Address"
        variant="outlined"
        prepend-inner-icon="mdi-train"
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
        v-model="roadname"
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
</v-sheet>
</template>