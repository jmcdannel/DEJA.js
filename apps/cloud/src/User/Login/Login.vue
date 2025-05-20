<script setup lang="ts">
import LoginForm from './LoginForm.vue'
import LoginPage from './LoginPage.vue'
import ProviderLogin from './ProviderLogin.vue'

</script>
<template>
  <LoginPage>
    <div class="grid grid-cols-1 gap-4">
      <ProviderLogin />
      <v-spacer class="my-8" />
      <LoginForm />
    </div>
  </LoginPage>
</template>