<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { RouterView } from 'vue-router'
  import { getAuth, onAuthStateChanged } from 'firebase/auth'
  import { useCurrentUser } from 'vuefire'
  import { useConnectionStore } from '@/connections/connectionStore'
  import { useDejaJs } from '@/api/useDejaJs'
  import { db,firebaseApp } from '@/firebase'
  import HeaderView from '@/views/HeaderView.vue'
  import FooterView from '@/views/FooterView.vue'
  import ThrottleNav from '@/throttle/ThrottleNav.vue'
  import DejaJsConnect from '@/core/DejaJsConnect.component.vue'
  import DejaCloudConnect from '@/deja-cloud/DejaCloudConnect.vue'
  import { useDejaCloudStore } from '@/deja-cloud/dejaCloudStore'
  
  const user = useCurrentUser()
  const dejaJsApi = useDejaJs()
  const connectionStore = useConnectionStore()
  const dejaCloudStore = useDejaCloudStore()
  const { layoutId, isDejaJS, isDejaServer, connectionType } = storeToRefs(connectionStore)
  const { initialized } = storeToRefs(dejaCloudStore)
  
  onMounted(async () => {
    const auth = getAuth(firebaseApp)
    console.log('App.vue onMounted', auth)
    onAuthStateChanged(auth, async function(user) {
      // if (connectionType.value === 'dejaJS') {
        if (user) {
          // User is signed in.
          console.log('User is signed in.', auth)
          layoutId.value && await dejaJsApi.connectDejaCloud()
          // layoutId.value && await dejaCloudStore.init(layoutId.value)
        } else {
          // No user is signed in.
          console.log('No user is signed in.', auth)
          // await dejaJsApi.connectMqtt()
        }
      // }
    })
    // if (layoutId.value) {
    //   console.log('connecting from App.vue', user.value, user?.value?.email, layoutId?.value, connectionType.value)
    //   if (connectionType.value === 'dejaJS') {
    //     await dejaJsApi.connect()
    //   }
    // }
  })

  watch(layoutId.value, (newVal:string, oldVal:string) => {
    console.log('layoutId changed', newVal, oldVal, connectionType.value)
  })

</script>

<template>
  <template v-if="layoutId && connectionType === 'dejaJS'">
    <!-- <DejaJsConnect /> -->
  </template>
  <template v-if="user && layoutId">
    <DejaCloudConnect />
  </template>
  <main class="flex flex-col h-screen mx-auto">
    <HeaderView />
    <main class="flex-grow flex flex-col mb-16 min-h-0">
      <RouterView />
      <ThrottleNav v-if="!!user && !!layoutId" />
    </main>
    <FooterView v-if="!!user"></FooterView>
  </main>
</template>
<style>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  .slide-out-enter-active, .slide-out-leave-active {
    transition: transform 0.5s;
  }
  .slide-out-enter-active {
    transform: translateX(100%);
  }
  .slide-out-enter-to {
    transform: translateX(0);
  }

</style>