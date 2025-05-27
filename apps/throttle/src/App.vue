<script setup lang="ts">
  import { onMounted } from 'vue'
  import { storeToRefs } from 'pinia'
  import { RouterView } from 'vue-router'
  import { getAuth, onAuthStateChanged } from 'firebase/auth'
  import { useCurrentUser } from 'vuefire'
  import { useConnectionStore } from '@/connections/connectionStore'
  import { firebaseApp } from '@repo/firebase-config/firebase'
  import HeaderView from '@/views/HeaderView.vue'
  import FooterView from '@/views/FooterView.vue'
  import ContextMenu from '@/core/ContextMenu.vue'
  import DejaJsConnect from '@/core/DejaJsConnect.component.vue'
  import DejaCloudConnect from '@/deja-cloud/DejaCloudConnect.vue'
  
  const user = useCurrentUser()
  const connectionStore = useConnectionStore()
  const { layoutId, connectionType } = storeToRefs(connectionStore)
  
  onMounted(async () => {
    const auth = getAuth(firebaseApp)
    console.log('App.vue onMounted', auth)
    onAuthStateChanged(auth, async function(user) {
      if (user && layoutId.value) {
        connectionStore.connect('dejaJS', layoutId.value || undefined)
        }
    })
  })

</script>

<template>
  <v-responsive>
    <v-app theme="dark">
      <template v-if="user && layoutId && connectionType === 'dejaJS'">
        <DejaJsConnect />
      </template>
      <template v-if="user && layoutId">
        <DejaCloudConnect />
      </template>
      <HeaderView />
      <v-main>
        <v-container class="p-0 min-h-full flex flex-col" fluid>
          <RouterView />
        </v-container>
      </v-main>
      <FooterView v-if="!!user && !!layoutId" :layoutId="layoutId"></FooterView>
    </v-app>
  </v-responsive>
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