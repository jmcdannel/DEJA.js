<script setup lang="ts">  
  import { ref } from 'vue';
  import { storeToRefs } from 'pinia'
  import router from '@/router';
  import { useThrottleStore } from '@/throttle/throttleStore';

  const MAX_SAVED_LOCOS = 20

  const throttleStore = useThrottleStore()
  const { locos } = storeToRefs(throttleStore)

  const loco = ref('')
  
  async function handleGoClick() {
    const address = parseInt(loco.value as unknown as string) 
    !!address && saveLoco(address)
    !!address && router.push({ name: 'throttle', params: { address } })
  }

  const navigate = (e:any) => {
    console.log('SELECTLOCO.navigate', e.target.value)
    const address = parseInt(e.target.value)
    !!address && router.push({ name: 'throttle', params: { address } })
  }

  function saveLoco(address:number) {
    if (!locos.value.find(l => l.address === address)) {
      locos.value.push({
        address,
        consist: [],
        functions: []
      });
      if (locos.value.length > MAX_SAVED_LOCOS) {
        locos.value.shift();
      }
      throttleStore.saveLocos()
    }
  }

</script>
<template>  
  <main class="py-3 px-2 pb-24 w-full">
    <div class="p-2 flex flex-row items-center justify-center">
      <input placeholder="DCC Address" v-model="loco" class="input input-bordered w-36 text-right max-w-xs" pattern="[0-9]*" inputmode="numeric">
      <button @click="handleGoClick" class="ml-2 btn btn-primary">GO</button>
    </div>
    <ul class="p-2 flex flex-row flex-wrap items-center" v-if="locos?.length > 0">
      <li class="m-2" v-for="loco in locos" :key="loco.address">
          <button
            @click="navigate"
            role="link"
            :value="loco.address"
            class="btn btn-md btn-outline border-primary text-primary w-full my-1 px-12 min-w-48"
          >
          {{loco.address}}
          </button>
      </li>
    </ul>
  </main>
</template>
