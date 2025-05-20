<script setup lang="js">
import { ref } from 'vue'
import { useLocos } from '@/api/useLocos'

defineEmits(['added'])
const { createLoco } = useLocos()
const address = ref(null)
const name = ref(null)

async function handleAdd() {
  const newAddress = parseInt(address.value) 
  if (!!newAddress) {
    await createLoco(newAddress, name.value)
  }
  emit('added', address.value)
}
</script>
<template>
  <form class="border border-red-600 rounded-xl border-opacity-40 p-6 bg-gray-950 bg-opacity-60">
    <legend class="p-2 text-xl text-primary">New Loco</legend>
    <div class="p-2 flex flex-row items-center">
      <input v-model="name" placeholder="Name" class="input input-bordered w-64 max-w-xs" >
    </div>
    <div class="p-2 flex flex-row items-center">
      <input v-model="address" placeholder="DCC Address" class="input input-bordered w-36 max-w-xs" pattern="[0-9]*" inputmode="numeric">
      <button @click="handleAdd" class="ml-4 btn btn-primary w-24">Add</button>
    </div>
  </form>
</template>