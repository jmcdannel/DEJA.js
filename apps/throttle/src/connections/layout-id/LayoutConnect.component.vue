<script setup lang="ts">  
  import { ref } from 'vue';
  import { storeToRefs } from 'pinia'
  import { useMQTT } from 'mqtt-vue-hook'
  import useDcc from '@/api/dccApi'
  import router from '@/router';
  import { useConnectionStore } from '@/connections/connectionStore'

  const mqttHook = useMQTT()
  const dccApi = useDcc()
  const { layoutId } = storeToRefs(useConnectionStore())  
  const storedLayoutsData = localStorage.getItem('@DEJA/layouts')
  const layouts = ref(storedLayoutsData ? JSON.parse(storedLayoutsData) : [])
  const layout = ref(null)
  const MAX_SAVED_LAYOUTS = 10
  const dejaTopic = ref(`@ttt/DCCEX.js/${layoutId.value}`)

  const handleGoClick = async () => {
    console.log('LayoutConnect.handleGoClick', layout.value)
    layoutId.value = layout.value
    !!layout.value && savelayout(layout.value)
    // router.push({ name: 'connect' })
    
  }

  const navigate = (e:any) => {
    // console.log('SELECTlayout.navigate', e.target.value)
    // const newLayoutId = e.target.value
    // layoutId.value = newLayoutId

    // mqttHook.registerEvent(
    //   dejaTopic.value,
    //   (topic: string, message: string) => {
    //     dccApi.parseMessage(topic, message.toString())
    //   },
    //   'string_key',
    // )      

    // mqttHook.subscribe([dejaTopic.value])
    
    // !!newLayoutId && savelayout(newLayoutId)
    // !!newLayoutId && router.push({ name: 'connect' })
  }

  const savelayout = (layout:string) => {
    if (!layouts.value.includes(layout)) {
      layouts.value.push(layout);
      if (layouts.value.length > MAX_SAVED_LAYOUTS) {
        layouts.value.shift();
      }
      localStorage.setItem('@DEJA/layouts', JSON.stringify(layouts.value))
    }
    localStorage.setItem('@DEJA/layoutId', layout)
  }

  console.log('LayoutConnect.layouts', layouts?.value, typeof layouts?.value, Array.isArray(layouts.value) && layouts.value.length > 0)

</script>
<template>  
  <main class="py-3 px-2 pb-24 overflow-auto viaduct-background bg-opacity-50">
    <h2 class="[word-spacing: 90vw] placeholder:font-extrabold text-transparent text-8xl bg-clip-text bg-gradient-to-r from-purple-300 to-pink-600">
      Select
      Your
      <strong class="text-9xl uppercase">Layout</strong>
    </h2>
    <div class="p-2 flex flex-row items-center justify-center">
      <input v-model="layout" class="text-black rounded p-2 text-xl w-auto">
      <button @click="handleGoClick" class="btn">GO</button>
    </div>
    <ul class="p-2 flex flex-col items-center" v-if="Array.isArray(layouts) && layouts.length > 0">
      <li class="mb-2" v-for="savedLayout in layouts" :key="savedLayout">
          <button
            @click="navigate"
            role="link"
            :value="savedLayout"
            class="btn bg-gradient-to-br from-orange-700 to-rose-500 text-white text-lg btn-wide btn-lg"
          >
          {{savedLayout}}          
          </button>
      </li>
    </ul>
  </main>
</template>