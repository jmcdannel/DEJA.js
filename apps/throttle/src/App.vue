<script setup lang="ts">
  import { RouterView } from 'vue-router'
  import Header from '@/core/Header.vue'
  import Footer from '@/core/Footer.vue'
</script>

<template>
  <v-responsive>
    <v-app theme="dark">
      <Header />
      <v-main>
        <v-container class="p-0 min-h-full flex flex-col" fluid>
          <RouterView />
        </v-container>
      </v-main>
      <Footer />
    </v-app>
  </v-responsive>
</template>