<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { useConnectionStore } from '@/connections/connectionStore.jsx'
  import { useDejaCloud } from "@/deja-cloud/useDejaCloud.js"
  import DejaCloudLayoutList from '@/deja-cloud/DejaCloudLayoutList.vue'
  import DejaDCCEX from '@/deja-cloud/DejaDCCEX.vue'
  import DejaUser from '@/deja-cloud/DejaUser.vue'
  import router from '@/router'
  import tttButton from '@/shared/ui/tttButton.component.vue'
  
  const conn = useConnectionStore()
  const dejaCloud = useDejaCloud()
  const { layoutId } = storeToRefs(conn)

  function handleCancelClick() {
    router.push({ name: 'home' })
  }

  async function handleLayoutClick(_layout) {
    console.log('handleLayoutClick', _layout?.layoutId)
    dejaCloud.send({ action: 'status', payload: { layoutId: _layout?.layoutId }})
    conn.connect('cloud', _layout?.layoutId)
  }

  function handleDisconnectClick() {
    conn.disconnect()
    router.push({ name: 'home' })
  }

</script>

<template>
  <main class="p-4 flex flex-col justify-between w-full overflow-auto forest-background">
    <main class="my-1 pt-2 flex-grow flex flex-col">  
      <DejaUser />
      <template v-if="layoutId">
        <DejaDCCEX />
      </template>
      <div v-else class="p-2 flex flex-col items-center justify-center">
        <DejaCloudLayoutList @selectLayout="handleLayoutClick" />\
      </div>
      <div class="flex-grow flex justify-between items-end">
        <tttButton variant="warning" size="lg" @click="handleCancelClick">Cancel</tttButton>
        <tttButton v-if="layoutId" variant="error" size="lg" @click="handleDisconnectClick">Disconnect</tttButton>
      </div>
    </main>
  </main>
</template>