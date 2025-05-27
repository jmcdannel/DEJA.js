<script setup lang="ts">
  import { ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useCurrentUser } from 'vuefire'
  import ConnectionStatus from '@/core/ConnectionStatus.component.vue'
  import { useLayout } from '@repo/modules/layouts'
  import { useDcc } from '@repo/dccex'
  import router from '@/router'
  import tttButton from '@/shared/ui/tttButton.component.vue'
  import { useConnectionStore } from '@/connections/connectionStore.jsx'
  import closeIconSvg from '@/assets/icons/close.svg'  

  const { getLayout } = useLayout()

  const layout = getLayout()

  const user = useCurrentUser()
  const { sendDccCommand } = useDcc()
  const conn = useConnectionStore()
  const { layoutId, ports, isDejaJS, mqttConnected, dccExConnected } = storeToRefs(conn)
  const dccStatus = ref(isDejaJS.value && dccExConnected.value ? 'connected' : 'disconnected')
  const storedLayoutsData = localStorage.getItem('@DEJA/layouts')
  const MAX_SAVED_LAYOUTS = 10
  const layouts = ref(storedLayoutsData ? JSON.parse(storedLayoutsData) : [])

  const handleRefreshClick = () => {
    sendDccCommand({ action: 'listPorts', payload: { } })
  }

  const handlePortClick = async (e:any) => {
    try {
      e.preventDefault()
      dccStatus.value = 'pending'
      const serial = e.target.value
      sendDccCommand({ action: 'connect', payload: serial })
    } catch (err) {
      console.error(err)
    }
  }
  const handleCancelClick = () => {
    router.push({ name: 'home' })
  }

  const handleLayoutClick = async () => {
    console.log('LayoutConnect.handleGoClick', layout.value)
    layoutId.value = layout.value?.id || null
    !!layout.value && savelayout(layout.value?.id || layout.value)
    // await dejaJsApi.connect()
    
  }
  const handleDisconnectClick = () => {
    conn.disconnect()
    router.push({ name: 'home' })
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

  const handleLayoutSelect = async (e:any) => {
    console.log('SELECTlayout.navigate', e.target.value)
    const newLayoutId = e.target.value
    layoutId.value = newLayoutId    
    !!newLayoutId && savelayout(newLayoutId)
    // await dejaJsApi.connect()
  }

  const clearLayout = (e:any) => {
    e.preventDefault()
    layoutId.value = null
    ports.value = []
    localStorage.removeItem('@DEJA/layoutId')
  }

  // const handleMqtt = async () => {
  //   dejaJsApi.connectMqtt()
  // }

  // const handleCloud = async () => {
  //   console.log('handleCloud', user.value)
  //   dejaJsApi.connectDejaCloud()
  // }

</script>

<template>
  <main class="p-4 flex flex-col justify-between w-full overflow-auto forest-background">
    <header>
      <h1 class="fancy-title leading-tight text-transparent text-8xl bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-600">Connect</h1>
      <h2 class="text-5xl flex items-end ">
       <span class="bg-clip-text bg-gradient-to-r from-red-800 to-fuchsia-700 uppercase font-extrabold">
          DEJA.js
        </span>
      </h2>
    </header>
    <main class="my-1 pt-8 flex-grow flex flex-col">  
      <div class="p-2">
          <ConnectionStatus connectedLabel="DCC-EX" disconnectedLabel="DCC-EX" :connected="dccExConnected" />
          <ConnectionStatus connectedLabel="DEJA.js" disconnectedLabel="DEJA.js" :connected="isDejaJS" />
          <ConnectionStatus connectedLabel="MQTT" disconnectedLabel="MQTT" :connected="mqttConnected" />
          <ConnectionStatus :connectedLabel="conn.layoutId?.toString()" disconnectedLabel="Layout" :connected="!!conn.layoutId" />
          <tttButton variant="information" size="sm" @click="handleRefreshClick">Refresh</tttButton>
      </div>   
      <p class="p-2">Connect to your layout via DEJA.js - the DCC-EX JavaScript API by Track & Trestle Technology</p>
              
      <div className="divider"></div> 
      <template v-if="layoutId">
        <h1 class="text-transparent text-2xl bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-600">Selected Layout:</h1>
        <h2 class="text-5xl flex items-end ">
          <span class="bg-clip-text bg-gradient-to-r from-red-800 to-fuchsia-700 uppercase font-extrabold">
            {{ layoutId}}            
            <button class="btn btn-circle btn-outline text-white btn-xs bg-gray-200 border-gray-200" @click="clearLayout">
              <img :src="closeIconSvg" alt="clear layout"  class="h-3 w-3" />
            </button>
          </span>
        </h2>
        <div className="divider"></div>

        <div v-if="conn.isDejaJS && conn.dccExConnected" class="text-green-500 text-center flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-32 h-32 mr-1">
            <path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clip-rule="evenodd" />
          </svg>
        </div>
        <template v-else-if="user && layoutId">
          <p>Connect via DEJA Cloud</p>
          <pre>{{ layout }}</pre>
        </template>
        <div v-else-if="!ports?.length">
          <span class=" ">Loading</span>
        </div>
        <ul v-else>
          <li v-for="port in ports" :key="port">
            <button class="btn btn-sm btn-outline w-full border-teal-500" :value="port" @click="handlePortClick">{{ port }}</button>
            <div className="divider"></div> 
          </li>
        </ul>
      </template>
      <div v-else class="p-2 flex flex-col items-center justify-center">
        <div>
          <input v-model="layout" class="text-black rounded p-2 text-xl w-auto" placeholder="DEJA.js Layout ID">
          <button @click="handleLayoutClick" class="btn">GO</button>
        </div>
        <ul class="p-2 flex flex-col items-center" v-if="Array.isArray(layouts) && layouts.length > 0">
          <li class="mb-2" v-for="savedLayout in layouts" :key="savedLayout">
            <tttButton size="lg" :value="savedLayout" @click="handleLayoutSelect">{{savedLayout}}</tttButton>
          </li>
        </ul>
      </div>
      <!-- <pre>{{ conn }}</pre> -->

      <div class="flex-grow flex justify-between items-end">
        <tttButton variant="warning" size="lg" @click="handleCancelClick">Cancel</tttButton>
        <tttButton v-if="layoutId" variant="error" size="lg" @click="handleDisconnectClick">Disconnect</tttButton>
      </div>
    </main>
  </main>
</template>