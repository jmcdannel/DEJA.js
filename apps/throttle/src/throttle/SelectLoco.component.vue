<script setup lang="ts">  
  import { ref, type PropType } from 'vue';
  import router from '@/router';
  import type { Loco } from './types';

  const MAX_SAVED_LOCOS = 20

  const props = defineProps({
    locos: {
      type: Array as PropType<Loco[]>,
      required: true
    },
  })

  const locos = ref<Loco[]>(props.locos as Loco[])
  const loco = ref(null)

  const handleGoClick = async () => {
    const locoId = parseInt(loco.value as unknown as string) 
    !!locoId && saveLoco(locoId)
    router.push({ name: 'throttle', params: { locoId } })
  }

  const navigate = (e:any) => {
    console.log('SELECTLOCO.navigate', e.target.value)
    const locoId = parseInt(e.target.value)
    !!locoId && saveLoco(locoId)
    !!locoId && router.push({ name: 'throttle', params: { locoId } })
  }

  const saveLoco = (address:number) => {
    if (!locos.value.find(l => l.address === address)) {
      locos.value.push({
        address,
        consist: [],
        functions: []
      });
      if (locos.value.length > MAX_SAVED_LOCOS) {
        locos.value.shift();
      }
      // localStorage.setItem('@DEJA/locos', JSON.stringify(locos.value))
    }
  }

</script>
<template>  
  <main class="py-3 px-2 pb-24 overflow-auto viaduct-background bg-opacity-50">
    <h2 class="[word-spacing: 90vw] placeholder:font-extrabold text-transparent text-8xl bg-clip-text bg-gradient-to-r from-purple-300 to-pink-600">
      Select
      Your
      <strong class="text-9xl uppercase">Loco</strong>
    </h2>
    <div class="p-2 flex flex-row items-center justify-center">
      <input v-model="loco" class="input input-bordered w-24 text-right max-w-xs" pattern="[0-9]*" inputmode="numeric">
      <button @click="handleGoClick" class="ml-2 btn btn-primary">GO</button>
    </div>
    <ul class="p-2 flex flex-col items-center" v-if="locos?.length > 0">
      <li class="mb-2" v-for="loco in locos" :key="loco.address">
          <button
            @click="navigate"
            role="link"
            :value="loco.address"
            class="btn bg-gradient-to-br from-orange-700 to-rose-500 text-white text-lg btn-wide btn-lg"
          >
          {{loco.address}}
          </button>
      </li>
    </ul>
  </main>
</template>
