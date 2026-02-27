<script setup lang="ts">
import { useCurrentUser } from 'vuefire'
import { Signout } from '@repo/auth'

const user = useCurrentUser()
</script>

<template>
  <v-container class="max-w-xl mx-auto py-16 text-center">
    <v-icon size="80" color="warning" class="mb-6">mdi-account-clock</v-icon>
    <h1 class="text-h4 mb-4">Account Pending Approval</h1>
    <p class="text-body-1 text-medium-emphasis mb-6">
      Thanks for signing up{{ user?.displayName ? `, ${user.displayName}` : '' }}!
      Your account is awaiting approval from an administrator.
      You'll be able to access DEJA Cloud once your account has been approved.
    </p>
    <v-alert type="info" variant="tonal" class="mb-6">
      Contact the administrator to request access.
    </v-alert>
    <Signout />
  </v-container>
</template>
