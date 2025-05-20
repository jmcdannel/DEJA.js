<script setup lang="ts">
  import { computed,} from 'vue'
  import { storeToRefs } from 'pinia'
  import { doc } from "firebase/firestore"
  import { db } from "@/firebase"
  import { useDocument } from 'vuefire'
  import { useConnectionStore } from '@/connections/connectionStore'
  const conn = useConnectionStore()
  const { layoutId } = storeToRefs(conn)

  const emit = defineEmits(['connect'])
  const layoutDoc = computed(() => layoutId.value 
    ? doc(db, "layouts", layoutId.value) 
    : null)
    
  const layout = useDocument(layoutDoc)

  const handlePortClick = async (e:any) => {
    try {
      e.preventDefault()
      // dccStatus.value = 'pending'
      // const serial = e.target.value
      // dccApi.send('connect', { serial })
      console.log('handlePortClick', e.target.value)
      emit('connect', e) 
    } catch (err) {
      console.error(err)
    }
  }

</script>
<template>
    <pre>{{ layout?.ports }}</pre>
    <div v-if="!layout?.ports?.length">
      <span class=" ">Loading</span>
    </div>
    <ul v-else>
      <li v-for="port in layout?.ports" :key="port">
        <button class="btn btn-sm btn-outline w-full border-teal-500" :value="port" @click="handlePortClick">{{ port }}</button>
        <div className="divider"></div> 
      </li>
    </ul>
</template>