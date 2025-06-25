<script setup lang="ts">
import { ref } from 'vue'
import { slugify } from '@repo/utils/slugify'
import { useLayout } from '@repo/modules/layouts'
import ColorPicker from '@/Common/Color/ColorPicker.vue'

const emit = defineEmits(['close'])
const { setTag } = useLayout()

const name = ref('')
const color = ref('')
const icon = ref('')

const rules = {
  required: [(val: string) => !!val || 'Required.']
}

async function submit() {
  console.log('submit', name.value)
  if (name.value === '') return
  const id = slugify(name.value)
  const tag = {
    id: slugify(name.value),
    name: name.value,
    color: color.value,
    icon: icon.value
  }
  await setTag(tag)
  name.value = ''
  color.value = ''
  icon.value = ''
  emit('close')
}

</script>
<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <v-text-field
      v-model="name"
      label="New Tag"
      variant="outlined"
      color="yellow"
      :rules="rules.required"
    ></v-text-field>
    <v-text-field
      v-model="icon"
      label="Icon"
      variant="outlined"
      color="yellow"
    ></v-text-field>
    <ColorPicker v-model="color"></ColorPicker>
    <v-btn
      class="mt-2"
      text="Cancel"
      type="button"
      color="yellow"
      variant="outlined"
      @click="$emit('close')"
    ></v-btn>  
    <v-btn
      class="mt-2"
      text="Save"
      type="submit"
      color="yellow"
    ></v-btn>  
  </v-form>
  <!-- <pre>{{  selectedTags }}</pre>
  <pre>{{  tags }}</pre>
  <pre>{{  layout?.tags }}</pre> -->
</template>