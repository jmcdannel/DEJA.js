<script setup lang="ts">
  import { RouterView } from 'vue-router'
  import HeaderView from '@/views/HeaderView.vue'
  import FooterView from '@/views/FooterView.vue'
</script>

<template>
  <v-responsive>
    <v-app theme="dark">
      <HeaderView />
      <v-main>
        <v-container class="p-0 min-h-full flex flex-col" fluid>
          <RouterView />
        </v-container>
      </v-main>
      <FooterView></FooterView>
    </v-app>
  </v-responsive>
</template>