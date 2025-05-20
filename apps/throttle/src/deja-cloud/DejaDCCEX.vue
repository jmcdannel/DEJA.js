<script setup lang="ts">
  import { computed, watch, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { doc } from "firebase/firestore"
  import { db } from "@/firebase"
  import { useCurrentUser, useDocument } from 'vuefire'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import { 
    BsCpu,
  } from 'vue3-icons/bs'
  import { 
    FaUsb,
    FaPowerOff
  } from 'vue3-icons/fa'
  import { useConnectionStore } from '@/connections/connectionStore'
  import { useDejaCloud } from "@/deja-cloud/useDejaCloud"
  import closeIconSvg from '@/assets/icons/close.svg'
  import tttButton from '@/shared/ui/tttButton.component.vue'

  const user = useCurrentUser()
  const conn = useConnectionStore()
  const dejaCloud = useDejaCloud()
  const { layoutId, dccExConnected } = storeToRefs(conn)

  dayjs.extend(relativeTime)

  const layoutDoc = computed(() => layoutId.value 
    ? doc(db, "layouts", layoutId.value) 
    : null)
    
  const layout = useDocument(layoutDoc)
  const clearLayout = (e:any) => {
    e.preventDefault()
    conn.disconnect()
  }

  async function handleRefresh() {
    console.log('handleRefresh', layoutId.value)
    dejaCloud.send({ action: 'status', payload: { layoutId: layoutId.value }})
  }

</script>
<template>
  <div className="divider"></div>
    <h1 class="text-transparent text-2xl bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-600">Selected Layout:</h1>
    <h2 class="text-3xl flex items-end ">
      <span class="bg-clip-text bg-gradient-to-r from-red-800 to-fuchsia-700 font-extrabold">
        {{ layoutId}}            
        <button class="btn btn-circle btn-outline text-white btn-xs bg-gray-200 border-gray-200" @click="clearLayout">
          <img :src="closeIconSvg" alt="clear layout"  class="h-3 w-3" />
        </button>
      </span>
    </h2>    
    <div className="divider"></div>
    <template v-if="layout">
      <article class="px-4 py-4 flex flex-wrap gap-2 items-start relative" >
        <span v-if="dccExConnected" class="text-green-500 text-center flex items-center justify-center">
          <BsCpu class="w-24 h-24 stroke-none" />
        </span>
        <span v-else class="text-red-500 text-center flex items-center justify-center">
          <BsCpu class="w-24 h-24 stroke-none" />
        </span>
        <div class="flex-grow relative">

          <FaUsb class="w-12 h-12 text-green-500 absolute right-2 top-2" />
          <pre class="bg-black text-green-300 p-2 rounded-md text-xs bg-opacity-40 border border-slate-500 pr-16">
{{ layout.dccEx.LCD2 }}
{{ layout.dccEx.LCD3 }}
&gt; <span class="blink">_</span>
          </pre>
        </div>
      
        <div class="flex flex-col">
          <div class="flex py-1 min-w-48 justify-between bg-purple-500 border-purple-500 border my-1 items-center px-2 rounded-full bg-opacity-20"> 
            <v-avatar class="bg-red-500" size="small">A</v-avatar>
            <h3>{{ layout.dccEx.trackA }}</h3>
            <v-avatar class="bg-transparent text-red-500" size="small"><FaPowerOff /></v-avatar>
          </div>
          <div class="flex py-1 min-w-48 justify-between bg-purple-500 border-purple-500 border my-1 items-center px-2 rounded-full bg-opacity-20"> 
            <v-avatar class="bg-red-500" size="small">A</v-avatar>
            <h3>{{ layout.dccEx.trackB }}</h3>
            <v-avatar class="bg-transparent text-red-500" size="small"><FaPowerOff /></v-avatar>
          </div>
          <div>
            <p class="py-2 text-xs text-cyan-200">Updated: {{ dayjs.unix(layout.dccEx.timestamp.seconds).fromNow() }}</p>
          </div>
          <tttButton variant="secondary" size="md" @click="handleRefresh">Get Status</tttButton>
        </div>
      </article>
      <p class="px-4 text-xs text-cyan-200" v-if="layout">
        {{layout.dccEx.version}}
      </p>
      <pre>{{ layout }}</pre>
    </template>
</template>