<script setup lang="ts">

defineEmits(['select', 'cancel'])
const model = defineModel<string>()

const types = [
  {
    id: 'kato',
    name: 'Kato'
  },
  {
    id: 'servo',
    name: 'Servo'
  },
  {
    id: 'tortise',
    name: 'Tortise',
    disabled: true
  },
  {
    id: 'dcc',
    name: 'DCC',
    disabled: true
  }
]

defineProps({
  color: String
})

</script>
<template>
  <v-card class="mx-auto w-full h-full justify-between flex flex-col bg-zinc-500  bg-opacity-20"
    variant="tonal"
    density="compact"
    :color="color">
    <v-card-item class="font-weight-black">
      <v-card-title class="font-weight-black">
        Turnout Type
      </v-card-title>
    </v-card-item>
    <v-card-text>
      <v-btn-toggle v-model="model" divided class="flex-wrap h-auto" size="x-large">
        <v-btn v-for="turnoutType in types" :value="turnoutType.id" :key="turnoutType.id"
          class="min-h-48 min-w-48 border"
          variant="flat"
          :disabled="turnoutType?.disabled ?? false"
          :color="color">
          <div class="flex flex-col justify-center items-center">
            <v-icon color="white" size="64">mdi-directions-fork</v-icon>
            <div class="mt-4">{{ turnoutType.name }}</div>
          </div> 
        </v-btn>
      </v-btn-toggle>
    </v-card-text>
    <v-card-actions>
      <v-btn
        prepend-icon="mdi-cancel"
        variant="outlined"
        @click="$emit('cancel')">
        Cacnel
      </v-btn>
      <v-btn
        prepend-icon="mdi-check"
        :color="model"
        variant="flat"
        @click="$emit('select')">
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>